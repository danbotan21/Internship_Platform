using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.BusinessLayer.Admin.Companies;

public sealed record CompanyDetailDto(
    Guid Id,
    string LegalName,
    string RegistrationNumber,
    string Website,
    string Headquarters,
    string Industry,
    string CompanySize,
    CompanyStatus Status,
    DateTimeOffset VerifiedAt,
    string? VerifiedByName,
    Guid? VerificationRequestId,
    DateTimeOffset? SuspendedAt,
    IReadOnlyList<CompanyMemberDto> Members);

public sealed record CompanyMemberDto(
    Guid UserId,
    string FullName,
    string Email,
    CompanyRole Role,
    DateTimeOffset JoinedAt);
