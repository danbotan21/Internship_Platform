using InternshipPlatform.API.Infrastructure;
using InternshipPlatform.Domain.Models;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

// Shared helpers for the contribution controllers.
public abstract class ContributionControllerBase : ControllerBase
{
    // TEMPORARY: the preview switcher in the frontend sends the demo user id.
    // When the Authentication Epic is merged this becomes the JWT "sub" claim.
    protected Guid CurrentUserId
    {
        get
        {
            var value = Request.Headers["X-Demo-User-Id"].FirstOrDefault();
            return Guid.TryParse(value, out var userId) && userId != Guid.Empty
                ? userId
                : DemoInternshipDirectory.DefaultStudentId;
        }
    }

    protected IActionResult ToActionResult<T>(ServiceResult<T> result)
    {
        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        var body = new { message = result.Error };
        return result.ErrorType switch
        {
            ServiceErrorType.Validation => BadRequest(body),
            ServiceErrorType.NotFound => NotFound(body),
            ServiceErrorType.Forbidden => StatusCode(StatusCodes.Status403Forbidden, body),
            ServiceErrorType.Conflict => Conflict(body),
            ServiceErrorType.ExternalService => StatusCode(StatusCodes.Status503ServiceUnavailable, body),
            _ => StatusCode(StatusCodes.Status500InternalServerError, body)
        };
    }
}
