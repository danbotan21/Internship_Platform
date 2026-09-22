using InternshipPlatform.Domain;
using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.BusinessLayer.Admin.Users;

/// <summary>
/// A row in the user directory. The platform role and the company role are kept apart
/// on purpose: they answer different questions ("what may this account do on the
/// platform" vs "what is this person inside their company") and a user can have both.
/// </summary>
public sealed record UserListItemDto(
    Guid Id,
    string FullName,
    string Email,
    UserStatus Status,
    UserRole PlatformRole,
    CompanyRole? CompanyRole,
    string? Organisation,
    DateTimeOffset? LastActiveAt);
