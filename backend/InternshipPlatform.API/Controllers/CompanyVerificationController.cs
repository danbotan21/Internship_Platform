using InternshipPlatform.BusinessLayer.Onboarding;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

/// <summary>
/// How a user asks to represent a company. The admin panel decides on what is submitted here.
/// </summary>
[ApiController]
[Authorize]
[Route("api/company-verification")]
public class CompanyVerificationController(ICompanyVerificationRequestService requests) : ControllerBase
{
    [HttpGet("me")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<MyVerificationStateDto>> GetMine(CancellationToken cancellationToken)
    {
        return Ok(await requests.GetMyStateAsync(User.GetUserId(), cancellationToken));
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Submit(
        SubmitVerificationRequestDto body,
        CancellationToken cancellationToken)
    {
        var result = await requests.SubmitAsync(body, User.GetUserId(), cancellationToken);

        return result.Error switch
        {
            null => NoContent(),
            SubmitVerificationError.InvalidRegistrationNumber =>
                Problem(statusCode: StatusCodes.Status400BadRequest,
                    title: "The registration number must be a 13-digit IDNO."),
            SubmitVerificationError.AlreadyPending =>
                Problem(statusCode: StatusCodes.Status409Conflict,
                    title: "You already have a request waiting for review."),
            SubmitVerificationError.AlreadyInCompany =>
                Problem(statusCode: StatusCodes.Status409Conflict,
                    title: "You already belong to a company."),
            SubmitVerificationError.CompanyAlreadyRegistered =>
                Problem(statusCode: StatusCodes.Status409Conflict,
                    title: "A company with this registration number is already on the platform."),
            _ => throw new ArgumentOutOfRangeException(nameof(result)),
        };
    }
}
