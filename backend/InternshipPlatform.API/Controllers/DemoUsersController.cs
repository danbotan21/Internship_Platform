using InternshipPlatform.BusinessLayer.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

// TEMPORARY: lists the demo members for the frontend "Preview as" switcher.
// Delete when the Authentication Epic provides real sign-in.
[ApiController]
[Route("api/demo/users")]
public sealed class DemoUsersController : ControllerBase
{
    private readonly IInternshipDirectoryAction _directory;

    public DemoUsersController(IInternshipDirectoryAction directory)
    {
        _directory = directory;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers(CancellationToken ct) =>
        Ok(await _directory.GetMembersAsync(ct));
}
