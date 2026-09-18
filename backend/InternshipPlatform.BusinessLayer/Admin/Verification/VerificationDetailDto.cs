using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.BusinessLayer.Admin.Verification;

public sealed record VerificationDetailDto(
    Guid Id,
    VerificationStatus Status,
    string LegalName,
    string RegistrationNumber,
    string Website,
    string Headquarters,
    string Industry,
    string CompanySize,
    VerificationRequesterDto Requester,
    VerificationChecksDto Checks,
    int EarlierRequestsForRegistration,
    DateTimeOffset SubmittedAt,
    DateTimeOffset? DecidedAt,
    string? DecidedByName,
    string? RejectionReason,
    Guid? CompanyId);

public sealed record VerificationRequesterDto(
    Guid UserId,
    string Name,
    string Email,
    string Position,
    string? Phone,
    DateTimeOffset AccountCreatedAt);

public sealed record VerificationChecksDto(
    bool EmailDomainMatchesWebsite,
    bool RegistrationNumberFormatValid);
