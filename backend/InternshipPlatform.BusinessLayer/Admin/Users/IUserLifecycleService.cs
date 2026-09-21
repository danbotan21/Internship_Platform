using InternshipPlatform.Domain;

namespace InternshipPlatform.BusinessLayer.Admin.Users;

/// <summary>
/// Admin actions that change a user's account. Queries live in <see cref="IUserDirectoryService"/>.
/// </summary>
public interface IUserLifecycleService
{
    Task<UserLifecycleResult> DeactivateAsync(
        Guid userId,
        string reason,
        Guid? actorUserId,
        CancellationToken cancellationToken = default);

    Task<UserLifecycleResult> ReactivateAsync(
        Guid userId,
        string reason,
        Guid? actorUserId,
        CancellationToken cancellationToken = default);

    Task<UserLifecycleResult> ChangePlatformRoleAsync(
        Guid userId,
        UserRole role,
        string reason,
        Guid? actorUserId,
        CancellationToken cancellationToken = default);
}
