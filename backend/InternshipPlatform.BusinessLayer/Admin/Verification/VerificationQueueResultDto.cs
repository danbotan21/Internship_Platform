using InternshipPlatform.BusinessLayer.Common;
using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.BusinessLayer.Admin.Verification;

public sealed record VerificationQueueResultDto(
    PagedResult<VerificationListItemDto> Requests,
    VerificationCountsDto Counts);

public sealed record VerificationCountsDto(
    int Pending,
    int Approved,
    int Rejected);

public sealed record VerificationListItemDto(
    Guid Id,
    string LegalName,
    string RegistrationNumber,
    VerificationStatus Status,
    string RequesterName,
    bool EmailDomainMatchesWebsite,
    DateTimeOffset SubmittedAt);
