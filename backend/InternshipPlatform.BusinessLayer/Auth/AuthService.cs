using InternshipPlatform.BusinessLayer.Progress;
using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain;
using InternshipPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Auth;

public class AuthService(AppDbContext db, ITokenService tokenService, JwtSettings settings) : IAuthService
{
    public async Task<AuthResult> RegisterAsync(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (await db.Users.AnyAsync(u => u.Email == email))
        {
            throw new EmailAlreadyRegisteredException();
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,
            Role = UserRole.Student,
            CreatedAt = DateTime.UtcNow,
        };

        db.Users.Add(user);
                db.Milestones.AddRange(MilestoneTemplates.CreateFor(user.Id, DateOnly.FromDateTime(user.CreatedAt.UtcDateTime)));

        await db.SaveChangesAsync();

        return await IssueTokensAsync(user);
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.SingleOrDefaultAsync(u => u.Email == email);

        if (user is null || !PasswordMatches(request.Password, user.PasswordHash))
        {
            throw new InvalidCredentialsException();
        }

        // An account an admin deactivated must not be able to sign back in.
        if (user.Status == UserStatus.Deactivated)
        {
            throw new AccountDeactivatedException();
        }

        // Feeds the "last active" column in the admin user directory.
        user.LastLoginAt = DateTimeOffset.UtcNow;

        return await IssueTokensAsync(user);
    }

    public async Task<AuthResult> RefreshAsync(string refreshToken)
    {
        var existing = await db.RefreshTokens
            .Include(rt => rt.User)
            .SingleOrDefaultAsync(rt => rt.Token == refreshToken);

        if (existing is null || !existing.IsActive)
        {
            throw new InvalidRefreshTokenException();
        }

        // A deactivated account keeps no valid session, even with a token issued earlier.
        if (existing.User.Status == UserStatus.Deactivated)
        {
            existing.RevokedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();

            throw new AccountDeactivatedException();
        }

        existing.RevokedAt = DateTime.UtcNow;

        return await IssueTokensAsync(existing.User);
    }

    public async Task LogoutAsync(string refreshToken)
    {
        var existing = await db.RefreshTokens.SingleOrDefaultAsync(rt => rt.Token == refreshToken);
        if (existing is not null && existing.IsActive)
        {
            existing.RevokedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
        }
    }

    private static bool PasswordMatches(string password, string passwordHash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            // Seed data stores a placeholder, not a hash: treat it as a failed sign-in
            // instead of letting the request fail with a 500.
            return false;
        }
    }

    private async Task<AuthResult> IssueTokensAsync(User user)
    {
        var accessToken = tokenService.CreateAccessToken(user);

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = tokenService.CreateRefreshToken(),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(settings.RefreshTokenDays),
            UserId = user.Id,
        };

        db.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync();

        return new AuthResult(user.Id, user.Email, user.FullName, user.Role, accessToken, refreshToken.Token);
    }
}
