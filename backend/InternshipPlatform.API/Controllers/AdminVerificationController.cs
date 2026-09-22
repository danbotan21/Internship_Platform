using InternshipPlatform.BusinessLayer.Admin.Verification;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/verification-requests")]
public class AdminVerificationController(ICompanyVerificationService verification) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<VerificationQueueResultDto>> GetQueue(
        [FromQuery] VerificationQueueQuery query,
        CancellationToken cancellationToken)
    {
        return Ok(await verification.GetQueueAsync(query, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<VerificationDetailDto>> GetRequest(
        Guid id,
        CancellationToken cancellationToken)
    {
        var request = await verification.GetRequestAsync(id, cancellationToken);

        return request is null ? NotFound() : Ok(request);
    }

    [HttpPost("{id:guid}/approve")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Approve(Guid id, CancellationToken cancellationToken)
    {
        var result = await verification.ApproveAsync(id, decidedByUserId: User.GetUserId(), cancellationToken);

        return ToActionResult(result);
    }

    [HttpPost("{id:guid}/reject")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Reject(
        Guid id,
        RejectVerificationRequestDto body,
        CancellationToken cancellationToken)
    {
        var result = await verification.RejectAsync(id, body.Reason, decidedByUserId: User.GetUserId(), cancellationToken);

        return ToActionResult(result);
    }

    private IActionResult ToActionResult(VerificationDecisionResult result) =>
        result.Error switch
        {
            null => NoContent(),
            VerificationDecisionError.NotFound => NotFound(),
            VerificationDecisionError.NotPending =>
                Problem(statusCode: StatusCodes.Status409Conflict,
                    title: "This request has already been decided."),
            VerificationDecisionError.CompanyAlreadyRegistered =>
                Problem(statusCode: StatusCodes.Status409Conflict,
                    title: "A company with this registration number is already registered."),
            VerificationDecisionError.RequesterAlreadyInCompany =>
                Problem(statusCode: StatusCodes.Status409Conflict,
                    title: "The requester already belongs to a company."),
            _ => throw new ArgumentOutOfRangeException(nameof(result)),
        };
}
