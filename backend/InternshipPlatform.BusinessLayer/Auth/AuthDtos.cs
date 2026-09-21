using InternshipPlatform.Domain;

namespace InternshipPlatform.BusinessLayer.Auth;

public record RegisterRequest(string Email, string Password, string FullName, UserRole Role);

public record LoginRequest(string Email, string Password);

public record RefreshRequest(string RefreshToken);

public record AuthResult(Guid UserId, string Email, string FullName, UserRole Role, string AccessToken, string RefreshToken);
