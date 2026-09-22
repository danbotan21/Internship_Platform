using InternshipPlatform.BusinessLayer.Common;
using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.BusinessLayer.Admin.Companies;

public sealed record CompanyListResultDto(
    PagedResult<CompanyListItemDto> Companies,
    CompanyCountsDto Counts);

public sealed record CompanyCountsDto(
    int Active,
    int Suspended);

public sealed record CompanyListItemDto(
    Guid Id,
    string LegalName,
    string RegistrationNumber,
    CompanyStatus Status,
    string? OwnerName,
    int MemberCount);
