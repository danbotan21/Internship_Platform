using InternshipPlatform.BusinessLayer.Common;
using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InternshipPlatform.BusinessLayer.Admin.Companies;

public class CompanyAdminService(AppDbContext context, ILogger<CompanyAdminService> logger)
    : ICompanyAdminService
{
    private const int MaxPageSize = 100;

    public async Task<CompanyListResultDto> GetCompaniesAsync(
        CompanyListQuery query,
        CancellationToken cancellationToken = default)
    {
        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, MaxPageSize);

        var searched = ApplySearch(context.Companies.AsNoTracking(), query.Search);

        var countsByStatus = await searched
            .GroupBy(c => c.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count, cancellationToken);

        var counts = new CompanyCountsDto(
            Active: countsByStatus.GetValueOrDefault(CompanyStatus.Active),
            Suspended: countsByStatus.GetValueOrDefault(CompanyStatus.Suspended));

        var inTab = searched.Where(c => c.Status == query.Status);

        var sorted = query.Sort == CompanyListSort.NameDesc
            ? inTab.OrderByDescending(c => c.LegalName).ThenBy(c => c.Id)
            : inTab.OrderBy(c => c.LegalName).ThenBy(c => c.Id);

        var items = await sorted
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CompanyListItemDto(
                c.Id,
                c.LegalName,
                c.RegistrationNumber,
                c.Status,
                c.Memberships
                    .Where(m => m.Role == CompanyRole.Owner)
                    .Select(m => m.User.FullName)
                    .FirstOrDefault(),
                c.Memberships.Count))
            .ToListAsync(cancellationToken);

        return new CompanyListResultDto(
            new PagedResult<CompanyListItemDto>(items, page, pageSize, countsByStatus.GetValueOrDefault(query.Status)),
            counts);
    }

    public async Task<CompanyDetailDto?> GetCompanyAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var company = await context.Companies
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new
            {
                Company = c,
                Members = c.Memberships
                    .Select(m => new CompanyMemberDto(m.UserId, m.User.FullName, m.User.Email, m.Role, m.JoinedAt))
                    .ToList(),
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (company is null)
        {
            return null;
        }

        var verification = await context.CompanyVerificationRequests
            .AsNoTracking()
            .Where(r => r.CompanyId == id)
            .Select(r => new
            {
                r.Id,
                DecidedByName = r.DecidedBy != null ? r.DecidedBy.FullName : null,
            })
            .FirstOrDefaultAsync(cancellationToken);

        var entity = company.Company;

        // Role is stored as a string, so order in memory to get Owner, Recruiter, Mentor.
        var members = company.Members
            .OrderBy(m => m.Role)
            .ThenBy(m => m.FullName, StringComparer.CurrentCultureIgnoreCase)
            .ToList();

        return new CompanyDetailDto(
            entity.Id,
            entity.LegalName,
            entity.RegistrationNumber,
            entity.Website,
            entity.Headquarters,
            entity.Industry,
            entity.CompanySize,
            entity.Status,
            entity.VerifiedAt,
            verification?.DecidedByName,
            verification?.Id,
            entity.SuspendedAt,
            members);
    }

    public async Task<CompanyActionResult> SuspendAsync(
        Guid id,
        string reason,
        Guid? actorUserId,
        CancellationToken cancellationToken = default)
    {
        var company = await context.Companies.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (company is null)
        {
            return CompanyActionResult.Fail(CompanyActionError.NotFound);
        }

        if (company.Status == CompanyStatus.Suspended)
        {
            return CompanyActionResult.Fail(CompanyActionError.AlreadySuspended);
        }

        company.Status = CompanyStatus.Suspended;
        company.SuspendedAt = DateTimeOffset.UtcNow;
        await context.SaveChangesAsync(cancellationToken);

        LogAction("Suspended", company, reason, actorUserId);
        return CompanyActionResult.Success;
    }

    public async Task<CompanyActionResult> RestoreAsync(
        Guid id,
        string reason,
        Guid? actorUserId,
        CancellationToken cancellationToken = default)
    {
        var company = await context.Companies.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (company is null)
        {
            return CompanyActionResult.Fail(CompanyActionError.NotFound);
        }

        if (company.Status != CompanyStatus.Suspended)
        {
            return CompanyActionResult.Fail(CompanyActionError.NotSuspended);
        }

        company.Status = CompanyStatus.Active;
        company.SuspendedAt = null;
        await context.SaveChangesAsync(cancellationToken);

        LogAction("Restored", company, reason, actorUserId);
        return CompanyActionResult.Success;
    }

    private static IQueryable<Company> ApplySearch(IQueryable<Company> companies, string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return companies;
        }

        var pattern = $"%{search.Trim()}%";

        return companies.Where(c =>
            EF.Functions.ILike(c.LegalName, pattern) ||
            EF.Functions.ILike(c.RegistrationNumber, pattern) ||
            c.Memberships.Any(m => m.Role == CompanyRole.Owner && EF.Functions.ILike(m.User.FullName, pattern)));
    }

    // The reason an admin gave is kept in the structured application log.
    private void LogAction(string action, Company company, string reason, Guid? actorUserId) =>
        logger.LogInformation(
            "Admin action: {Action} company {CompanyId} by {ActorUserId}. Reason: {Reason}",
            action,
            company.Id,
            actorUserId,
            reason.Trim());
}
