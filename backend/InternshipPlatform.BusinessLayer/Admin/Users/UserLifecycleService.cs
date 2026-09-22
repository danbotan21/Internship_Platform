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
        await RevokeSessionsAsync(user.Id, cancellationToken);
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
        // The role travels in the access token, so end the sessions that still carry the old one.
        await RevokeSessionsAsync(user.Id, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        LogAction($"Changed platform role {previous} -> {role}", user, reason, actorUserId);
        return UserLifecycleResult.Success;
    }

    // Deactivating or re-roling a user must not leave a usable refresh token behind:
    // without this the account keeps renewing its session as if nothing had changed.
    private async Task RevokeSessionsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var active = await context.RefreshTokens
            .Where(token => token.UserId == userId && token.RevokedAt == null)
            .ToListAsync(cancellationToken);

        foreach (var token in active)
        {
            token.RevokedAt = now;
        }
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

    // The reason an admin gave is kept in the structured application log. There is no audit
    // log table yet, so this is the only place it survives.
    private void LogAction(string action, User user, string reason, Guid? actorUserId) =>
        logger.LogInformation(
            "Admin action: {Action} for user {UserId} by {ActorUserId}. Reason: {Reason}",
            action,
            user.Id,
            actorUserId,
            reason.Trim());
}
