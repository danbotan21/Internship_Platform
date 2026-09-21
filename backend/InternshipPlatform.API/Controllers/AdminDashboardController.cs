using InternshipPlatform.BusinessLayer.Admin.Dashboard;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
public class AdminDashboardController(IAdminDashboardService dashboard) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<AdminDashboardDto>> Get(CancellationToken cancellationToken)
    {
        return Ok(await dashboard.GetDashboardAsync(cancellationToken));
    }
}
