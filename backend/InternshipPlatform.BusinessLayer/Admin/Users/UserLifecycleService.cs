using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain;
using InternshipPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InternshipPlatform.BusinessLayer.Admin.Users;

public class UserLifecycleService(AppDbContext context, ILogger<UserLifecycleService> logger)
    : IUserLifecycleService
{
    public async Task<UserLifecycleResult> DeactivateAsync(
        Guid userId,
        string reason,
        Guid? actorUserId,
        CancellationToken cancellationToken = default)
    {
        var (user, error) = await LoadTargetAsync(userId, actorUserId, cancellationToken);
        if (error is not null)
        {
            return error;
        }

        if (user!.Status == UserStatus.Deactivated)
        {
            return UserLifecycleResult.Fail(UserLifecycleError.AlreadyDeactivated);
        }

        if (user.Role == UserRole.Admin && await IsLastActiveAdminAsync(user.Id, cancellationToken))
        {
            return UserLifecycleResult.Fail(UserLifecycleError.LastActiveAdmin);
        }

        user.Status = UserStatus.Deactivated;
        user.DeactivatedAt = DateTimeOffset.UtcNow;
        await context.SaveChangesAsync(cancellationToken);

        LogAction("Deactivated", user, reason, actorUserId);
        return UserLifecycleResult.Success;
    }

    public async Task<UserLifecycleResult> ReactivateAsync(
        Guid userId,
        string reason,
        Guid? actorUserId,
        CancellationToken cancellationToken = default)
    {
        var (user, error) = await LoadTargetAsync(userId, actorUserId, cancellationToken);
        if (error is not null)
        {
            return error;
        }

        if (user!.Status != UserStatus.Deactivated)
        {
            return UserLifecycleResult.Fail(UserLifecycleError.NotDeactivated);
        }

        user.Status = UserStatus.Active;
        user.DeactivatedAt = null;
        await context.SaveChangesAsync(cancellationToken);

        LogAction("Reactivated", user, reason, actorUserId);
        return UserLifecycleResult.Success;
    }

    public async Task<UserLifecycleResult> ChangePlatformRoleAsync(
        Guid userId,
        UserRole role,
        string reason,
        Guid? actorUserId,
        CancellationToken cancellationToken = default)
    {
        var (user, error) = await LoadTargetAsync(userId, actorUserId, cancellationToken);
        if (error is not null)
        {
            return error;
        }

        if (user!.Role == role)
        {
            return UserLifecycleResult.Fail(UserLifecycleError.RoleUnchanged);
        }

        if (user.Role == UserRole.Admin
            && user.Status == UserStatus.Active
            && await IsLastActiveAdminAsync(user.Id, cancellationToken))
        {
            return UserLifecycleResult.Fail(UserLifecycleError.LastActiveAdmin);
        }

        var previous = user.Role;
        user.Role = role;
        await context.SaveChangesAsync(cancellationToken);

        LogAction($"Changed platform role {previous} -> {role}", user, reason, actorUserId);
        return UserLifecycleResult.Success;
    }

    private async Task<(User? User, UserLifecycleResult? Error)> LoadTargetAsync(
        Guid userId,
        Guid? actorUserId,
        CancellationToken cancellationToken)
    {
        // An admin must not lock themselves out or drop their own rights by mistake (#717).
        if (actorUserId == userId)
        {
            return (null, UserLifecycleResult.Fail(UserLifecycleError.CannotActOnSelf));
        }

        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        return user is null
            ? (null, UserLifecycleResult.Fail(UserLifecycleError.NotFound))
            : (user, null);
    }

    // Keeps the platform manageable: there is always at least one active admin.
    private async Task<bool> IsLastActiveAdminAsync(Guid userId, CancellationToken cancellationToken)
    {
        var anotherActiveAdminExists = await context.Users.AnyAsync(
            u => u.Id != userId
                && u.Role == UserRole.Admin
                && u.Status == UserStatus.Active,
            cancellationToken);

        return !anotherActiveAdminExists;
    }

    // TODO: write to the audit log table once the Audit Log feature exists; until then the reason
    // is kept in the structured application log.
    private void LogAction(string action, User user, string reason, Guid? actorUserId) =>
        logger.LogInformation(
            "Admin action: {Action} for user {UserId} by {ActorUserId}. Reason: {Reason}",
            action,
            user.Id,
            actorUserId,
            reason.Trim());
}
