using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace InternshipPlatform.API;

public static class ClaimsPrincipalExtensions
{
    public static Guid? TryGetUserId(this ClaimsPrincipal user)
    {
        var val = user.FindFirstValue(JwtRegisteredClaimNames.Sub)
               ?? user.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? user.FindFirstValue("sub");

        return Guid.TryParse(val, out var id) ? id : null;
    }

    public static Guid GetUserId(this ClaimsPrincipal user) =>
        user.TryGetUserId() ?? throw new InvalidOperationException("User ID claim was not found in token.");
}
