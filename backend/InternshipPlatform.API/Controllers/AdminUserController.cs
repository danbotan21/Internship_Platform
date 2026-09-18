using System.Globalization;
using InternshipPlatform.BusinessLayer.Admin.Users;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

[ApiController]
[Route("api/admin/users")]
public class AdminUsersController(IUserDirectoryService directory) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<UserDirectoryResultDto>> GetDirectory(
        [FromQuery] UserDirectoryQuery query,
        CancellationToken cancellationToken)
    {
        return Ok(await directory.GetDirectoryAsync(query, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDetailDto>> GetUser(
        Guid id,
        CancellationToken cancellationToken)
    {
        var user = await directory.GetUserAsync(id, cancellationToken);

        return user is null ? NotFound() : Ok(user);
    }
}