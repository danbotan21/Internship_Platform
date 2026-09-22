using InternshipPlatform.BusinessLayer.Admin.Companies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/companies")]
public class AdminCompaniesController(ICompanyAdminService companies) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<CompanyListResultDto>> GetCompanies(
        [FromQuery] CompanyListQuery query,
        CancellationToken cancellationToken)
    {
        return Ok(await companies.GetCompaniesAsync(query, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CompanyDetailDto>> GetCompany(
        Guid id,
        CancellationToken cancellationToken)
    {
        var company = await companies.GetCompanyAsync(id, cancellationToken);

        return company is null ? NotFound() : Ok(company);
    }

    [HttpPost("{id:guid}/suspend")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Suspend(
        Guid id,
        CompanyActionRequestDto body,
        CancellationToken cancellationToken)
    {
        var result = await companies.SuspendAsync(id, body.Reason, actorUserId: User.GetUserId(), cancellationToken);

        return ToActionResult(result);
    }

    [HttpPost("{id:guid}/restore")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Restore(
        Guid id,
        CompanyActionRequestDto body,
        CancellationToken cancellationToken)
    {
        var result = await companies.RestoreAsync(id, body.Reason, actorUserId: User.GetUserId(), cancellationToken);

        return ToActionResult(result);
    }

    private IActionResult ToActionResult(CompanyActionResult result) =>
        result.Error switch
        {
            null => NoContent(),
            CompanyActionError.NotFound => NotFound(),
            CompanyActionError.AlreadySuspended =>
                Problem(statusCode: StatusCodes.Status409Conflict, title: "This company is already suspended."),
            CompanyActionError.NotSuspended =>
                Problem(statusCode: StatusCodes.Status409Conflict, title: "This company is already active."),
            _ => throw new ArgumentOutOfRangeException(nameof(result)),
        };
}
