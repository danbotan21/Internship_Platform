using InternshipPlatform.BusinessLayer.Admin.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/users")]
public class AdminUsersController(
    IUserDirectoryService directory,
    IUserLifecycleService lifecycle) : ControllerBase
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

    [HttpPost("{id:guid}/deactivate")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Deactivate(
        Guid id,
        AccountActionRequestDto body,
        CancellationToken cancellationToken)
    {
        var result = await lifecycle.DeactivateAsync(id, body.Reason, actorUserId: User.GetUserId(), cancellationToken);

        return ToActionResult(result);
    }

    [HttpPost("{id:guid}/reactivate")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Reactivate(
        Guid id,
        AccountActionRequestDto body,
        CancellationToken cancellationToken)
    {
        var result = await lifecycle.ReactivateAsync(id, body.Reason, actorUserId: User.GetUserId(), cancellationToken);

        return ToActionResult(result);
    }

    [HttpPost("{id:guid}/platform-role")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> ChangePlatformRole(
        Guid id,
        ChangePlatformRoleRequestDto body,
        CancellationToken cancellationToken)
    {
        var result = await lifecycle.ChangePlatformRoleAsync(
            id, body.Role!.Value, body.Reason, actorUserId: User.GetUserId(), cancellationToken);

        return ToActionResult(result);
    }

    private IActionResult ToActionResult(UserLifecycleResult result) =>
        result.Error switch
        {
            null => NoContent(),
            UserLifecycleError.NotFound => NotFound(),
            UserLifecycleError.CannotActOnSelf =>
                ConflictProblem("You cannot change your own account from the admin panel."),
            UserLifecycleError.AlreadyDeactivated =>
                ConflictProblem("This account is already deactivated."),
            UserLifecycleError.NotDeactivated =>
                ConflictProblem("This account is already active."),
            UserLifecycleError.RoleUnchanged =>
                ConflictProblem("The user already has this role."),
            UserLifecycleError.LastActiveAdmin =>
                ConflictProblem("This is the last active admin. Make someone else an admin first."),
            _ => throw new ArgumentOutOfRangeException(nameof(result)),
        };

    private ObjectResult ConflictProblem(string title) =>
        Problem(statusCode: StatusCodes.Status409Conflict, title: title);
}
