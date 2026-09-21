using InternshipPlatform.Domain;

namespace InternshipPlatform.BusinessLayer.Auth;

public interface ITokenService
{
    string CreateAccessToken(User user);
    string CreateRefreshToken();
}
