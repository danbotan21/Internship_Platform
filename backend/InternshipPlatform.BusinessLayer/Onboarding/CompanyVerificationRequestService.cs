using InternshipPlatform.BusinessLayer.Admin.Verification;
using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Onboarding;

public class CompanyVerificationRequestService(AppDbContext context) : ICompanyVerificationRequestService
{
    public async Task<SubmitVerificationResult> SubmitAsync(
        SubmitVerificationRequestDto request,
        Guid requesterUserId,
        CancellationToken cancellationToken = default)
    {
        // Someone who already represents a company has nothing to ask for.
        if (await context.CompanyMemberships.AnyAsync(m => m.UserId == requesterUserId, cancellationToken))
        {
            return SubmitVerificationResult.Fail(SubmitVerificationError.AlreadyInCompany);
        }

        if (await context.CompanyVerificationRequests.AnyAsync(
                r => r.RequesterUserId == requesterUserId && r.Status == VerificationStatus.Pending,
                cancellationToken))
        {
            return SubmitVerificationResult.Fail(SubmitVerificationError.AlreadyPending);
        }

        var registrationNumber = request.RegistrationNumber.Trim();

        if (!VerificationChecks.RegistrationNumberFormatValid(registrationNumber))
        {
            return SubmitVerificationResult.Fail(SubmitVerificationError.InvalidRegistrationNumber);
        }

        // The admin side refuses to approve a company that is already registered. Saying so now
        // saves the person from waiting days for a rejection they could not have avoided.
        if (await context.Companies.AnyAsync(
                c => c.RegistrationNumber == registrationNumber, cancellationToken))
        {
            return SubmitVerificationResult.Fail(SubmitVerificationError.CompanyAlreadyRegistered);
        }

        var requester = await context.Users
            .Where(user => user.Id == requesterUserId)
            .Select(user => new { user.FullName, user.Email })
            .FirstOrDefaultAsync(cancellationToken);

        if (requester is null)
        {
            // The token is valid but the account is gone; treat it as nothing to act on.
            return SubmitVerificationResult.Fail(SubmitVerificationError.AlreadyInCompany);
        }

        var entity = new CompanyVerificationRequest
        {
            Id = Guid.CreateVersion7(),

            LegalName = request.LegalName.Trim(),
            RegistrationNumber = registrationNumber,
            Website = request.Website.Trim(),
            Headquarters = request.Headquarters.Trim(),
            Industry = request.Industry.Trim(),
            CompanySize = request.CompanySize.Trim(),

            // Identity comes from the account, never from the request body.
            RequesterUserId = requesterUserId,
            RequesterName = requester.FullName,
            RequesterEmail = requester.Email,
            RequesterPosition = request.Position.Trim(),
            RequesterPhone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),

            Status = VerificationStatus.Pending,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        context.CompanyVerificationRequests.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return SubmitVerificationResult.Success(entity.Id);
    }

    public async Task<MyVerificationStateDto> GetMyStateAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var alreadyInCompany = await context.CompanyMemberships
            .AnyAsync(m => m.UserId == userId, cancellationToken);

        var latest = await context.CompanyVerificationRequests
            .AsNoTracking()
            .Where(r => r.RequesterUserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ThenByDescending(r => r.Id)
            .Select(r => new MyVerificationRequestDto(
                r.Id,
                r.Status,
                r.LegalName,
                r.RegistrationNumber,
                r.Website,
                r.Headquarters,
                r.Industry,
                r.CompanySize,
                r.RequesterPosition,
                r.RequesterPhone,
                r.CreatedAt,
                r.DecidedAt,
                r.RejectionReason,
                r.CompanyId))
            .FirstOrDefaultAsync(cancellationToken);

        // A rejected request is not the end: the person can fix the details and try again.
        var canSubmit = !alreadyInCompany
            && (latest is null || latest.Status == VerificationStatus.Rejected);

        return new MyVerificationStateDto(canSubmit, alreadyInCompany, latest);
    }
}
