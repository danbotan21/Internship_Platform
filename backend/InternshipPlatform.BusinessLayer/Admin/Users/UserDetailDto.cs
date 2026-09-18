using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.BusinessLayer.Admin.Users;

public sealed record UserDetailDto(
    Guid Id,
    string FullName,
    string Email,
    UserStatus Status,
    DirectoryRole Role,
    string? University,
    string? Programme,
    string? AcademicGroup,
    bool EmailVerified,
    DateTimeOffset CreatedAt,
    DateTimeOffset? LastActiveAt,
    DateTimeOffset? DeactivatedAt,
    CompanyPlacementDto? Company);

public sealed record CompanyPlacementDto(
    Guid Id,
    string LegalName,
    CompanyRole Role);