using InternshipPlatform.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

[Authorize]
public abstract class EvaluationControllerBase : ControllerBase
{
    protected Guid CurrentUserId => User.GetUserId();

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
