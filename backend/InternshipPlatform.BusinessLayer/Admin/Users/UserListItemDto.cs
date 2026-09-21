using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.BusinessLayer.Admin.Users;

public sealed record UserListItemDto(
    Guid Id,
    string FullName,
    string Email,
    UserStatus Status,
    DirectoryRole Role,
    string? Organisation,
    DateTimeOffset? LastActiveAt);