using System.Security.Claims;
using InternshipPlatform.BusinessLayer.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UserController(IUserLogic userLogic) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    //GET /api/users/me — current user profile
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var result = await userLogic.GetProfileAsync(CurrentUserId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    //GET /api/mentor/company-info — mentor's company name/info
    [HttpGet("/api/mentor/company-info")]
    public async Task<IActionResult> GetCompanyInfo()
    {
        var result = await userLogic.GetCompanyInfoAsync(CurrentUserId);
        return result.Success ? Ok(result) : NotFound(result);
    }
}
