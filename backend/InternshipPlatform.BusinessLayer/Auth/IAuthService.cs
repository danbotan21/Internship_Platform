namespace InternshipPlatform.BusinessLayer.Auth;

public interface IAuthService
{
    Task<AuthResult> RegisterAsync(RegisterRequest request);
    Task<AuthResult> LoginAsync(LoginRequest request);
    Task<AuthResult> RefreshAsync(string refreshToken);
    Task LogoutAsync(string refreshToken);
}

public class EmailAlreadyRegisteredException() : Exception("A user with this email already exists.");
public class InvalidCredentialsException() : Exception("Invalid email or password.");
public class InvalidRefreshTokenException() : Exception("Refresh token is invalid or expired.");
public class AccountDeactivatedException() : Exception("This account has been deactivated. Contact an administrator.");
