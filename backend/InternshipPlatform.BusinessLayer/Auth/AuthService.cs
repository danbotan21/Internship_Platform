using InternshipPlatform.BusinessLayer.Progress;
using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain;
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
        db.Milestones.AddRange(MilestoneTemplates.CreateFor(user.Id, DateOnly.FromDateTime(user.CreatedAt)));

        await db.SaveChangesAsync();

        return await IssueTokensAsync(user);
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.SingleOrDefaultAsync(u => u.Email == email);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new InvalidCredentialsException();
        }

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
