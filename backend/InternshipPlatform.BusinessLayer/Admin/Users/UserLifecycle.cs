using System.ComponentModel.DataAnnotations;
using InternshipPlatform.Domain;

namespace InternshipPlatform.BusinessLayer.Admin.Users;

public enum UserLifecycleError
{
    NotFound,
    CannotActOnSelf,
    AlreadyDeactivated,
    NotDeactivated,
    RoleUnchanged,
    LastActiveAdmin
}

public sealed record UserLifecycleResult(UserLifecycleError? Error)
{
    public static UserLifecycleResult Success { get; } = new((UserLifecycleError?)null);

    public static UserLifecycleResult Fail(UserLifecycleError error) => new(error);

    public bool Succeeded => Error is null;
}

public record AccountActionRequestDto
{
    [Required]
    [StringLength(1000, MinimumLength = 5)]
    public string Reason { get; init; } = string.Empty;
}

public sealed record ChangePlatformRoleRequestDto : AccountActionRequestDto
{
    // Nullable so a missing value fails [Required] instead of silently binding to User.
    [Required]
    public UserRole? Role { get; init; }
}
