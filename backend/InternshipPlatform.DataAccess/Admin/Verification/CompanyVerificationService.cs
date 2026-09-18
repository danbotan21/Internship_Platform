using InternshipPlatform.BusinessLayer.Admin.Verification;
using InternshipPlatform.BusinessLayer.Common;
using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace InternshipPlatform.DataAccess.Admin.Verification;

public class CompanyVerificationService(AppDbContext context) : ICompanyVerificationService
{
    private const int MaxPageSize = 100;

    public async Task<VerificationQueueResultDto> GetQueueAsync(
        VerificationQueueQuery query,
        CancellationToken cancellationToken = default)
    {
        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, MaxPageSize);

        var searched = ApplySearch(context.CompanyVerificationRequests.AsNoTracking(), query.Search);

        // Tab counts respect the search box, so the numbers always match what the tabs would show.
        var countsByStatus = await searched
            .GroupBy(r => r.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count, cancellationToken);

        var counts = new VerificationCountsDto(
            Pending: countsByStatus.GetValueOrDefault(VerificationStatus.Pending),
            Approved: countsByStatus.GetValueOrDefault(VerificationStatus.Approved),
            Rejected: countsByStatus.GetValueOrDefault(VerificationStatus.Rejected));

        var inTab = searched.Where(r => r.Status == query.Status);
        var totalCount = countsByStatus.GetValueOrDefault(query.Status);

        var sorted = query.Sort == VerificationQueueSort.NewestFirst
            ? inTab.OrderByDescending(r => r.CreatedAt).ThenBy(r => r.Id)
            : inTab.OrderBy(r => r.CreatedAt).ThenBy(r => r.Id);

        var rows = await sorted
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                r.Id,
                r.LegalName,
                r.RegistrationNumber,
                r.Status,
                r.RequesterName,
                r.RequesterEmail,
                r.Website,
                r.CreatedAt,
            })
            .ToListAsync(cancellationToken);

        var items = rows
            .Select(r => new VerificationListItemDto(
                r.Id,
                r.LegalName,
                r.RegistrationNumber,
                r.Status,
                r.RequesterName,
                VerificationChecks.EmailDomainMatchesWebsite(r.RequesterEmail, r.Website),
                r.CreatedAt))
            .ToList();

        return new VerificationQueueResultDto(
            new PagedResult<VerificationListItemDto>(items, page, pageSize, totalCount),
            counts);
    }

    public async Task<VerificationDetailDto?> GetRequestAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var row = await context.CompanyVerificationRequests
            .AsNoTracking()
            .Where(r => r.Id == id)
            .Select(r => new
            {
                Request = r,
                AccountCreatedAt = r.Requester.CreatedAt,
                DecidedByName = r.DecidedBy != null ? r.DecidedBy.FullName : null,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (row is null)
        {
            return null;
        }

        var request = row.Request;

        var earlierRequests = await context.CompanyVerificationRequests
            .CountAsync(
                other => other.RegistrationNumber == request.RegistrationNumber
                    && other.Id != request.Id
                    && other.CreatedAt < request.CreatedAt,
                cancellationToken);

        return new VerificationDetailDto(
            request.Id,
            request.Status,
            request.LegalName,
            request.RegistrationNumber,
            request.Website,
            request.Headquarters,
            request.Industry,
            request.CompanySize,
            new VerificationRequesterDto(
                request.RequesterUserId,
                request.RequesterName,
                request.RequesterEmail,
                request.RequesterPosition,
                request.RequesterPhone,
                row.AccountCreatedAt),
            new VerificationChecksDto(
                VerificationChecks.EmailDomainMatchesWebsite(request.RequesterEmail, request.Website),
                VerificationChecks.RegistrationNumberFormatValid(request.RegistrationNumber)),
            earlierRequests,
            request.CreatedAt,
            request.DecidedAt,
            row.DecidedByName,
            request.RejectionReason,
            request.CompanyId);
    }

    public async Task<VerificationDecisionResult> ApproveAsync(
        Guid id,
        Guid? decidedByUserId,
        CancellationToken cancellationToken = default)
    {
        var request = await context.CompanyVerificationRequests
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (request is null)
        {
            return VerificationDecisionResult.Fail(VerificationDecisionError.NotFound);
        }

        if (request.Status != VerificationStatus.Pending)
        {
            return VerificationDecisionResult.Fail(VerificationDecisionError.NotPending);
        }

        if (await context.Companies.AnyAsync(
                c => c.RegistrationNumber == request.RegistrationNumber, cancellationToken))
        {
            return VerificationDecisionResult.Fail(VerificationDecisionError.CompanyAlreadyRegistered);
        }

        if (await context.CompanyMemberships.AnyAsync(
                m => m.UserId == request.RequesterUserId, cancellationToken))
        {
            return VerificationDecisionResult.Fail(VerificationDecisionError.RequesterAlreadyInCompany);
        }

        var now = DateTimeOffset.UtcNow;

        var company = new Company
        {
            Id = Guid.CreateVersion7(),
            LegalName = request.LegalName,
            RegistrationNumber = request.RegistrationNumber,
            Website = request.Website,
            Headquarters = request.Headquarters,
            Industry = request.Industry,
            CompanySize = request.CompanySize,
            Status = CompanyStatus.Active,
            VerifiedAt = now,
        };

        context.Companies.Add(company);
        context.CompanyMemberships.Add(new CompanyMembership
        {
            UserId = request.RequesterUserId,
            CompanyId = company.Id,
            Role = CompanyRole.Owner,
            JoinedAt = now,
        });

        request.Status = VerificationStatus.Approved;
        request.DecidedAt = now;
        request.DecidedByUserId = decidedByUserId;
        request.RejectionReason = null;
        request.CompanyId = company.Id;

        try
        {
            // One SaveChanges = one transaction: company, owner and request change together or not at all.
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException
        {
            SqlState: PostgresErrorCodes.UniqueViolation,
        } unique)
        {
            // Another admin approved a request for the same company or requester a moment earlier.
            return VerificationDecisionResult.Fail(
                unique.ConstraintName?.Contains("Membership", StringComparison.OrdinalIgnoreCase) == true
                    ? VerificationDecisionError.RequesterAlreadyInCompany
                    : VerificationDecisionError.CompanyAlreadyRegistered);
        }

        return VerificationDecisionResult.Success;
    }

    public async Task<VerificationDecisionResult> RejectAsync(
        Guid id,
        string reason,
        Guid? decidedByUserId,
        CancellationToken cancellationToken = default)
    {
        var request = await context.CompanyVerificationRequests
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (request is null)
        {
            return VerificationDecisionResult.Fail(VerificationDecisionError.NotFound);
        }

        if (request.Status != VerificationStatus.Pending)
        {
            return VerificationDecisionResult.Fail(VerificationDecisionError.NotPending);
        }

        request.Status = VerificationStatus.Rejected;
        request.RejectionReason = reason.Trim();
        request.DecidedAt = DateTimeOffset.UtcNow;
        request.DecidedByUserId = decidedByUserId;

        await context.SaveChangesAsync(cancellationToken);

        return VerificationDecisionResult.Success;
    }

    private static IQueryable<CompanyVerificationRequest> ApplySearch(
        IQueryable<CompanyVerificationRequest> requests,
        string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return requests;
        }

        var pattern = $"%{search.Trim()}%";

        return requests.Where(r =>
            EF.Functions.ILike(r.LegalName, pattern) ||
            EF.Functions.ILike(r.RegistrationNumber, pattern) ||
            EF.Functions.ILike(r.RequesterName, pattern) ||
            EF.Functions.ILike(r.RequesterEmail, pattern));
    }
}
