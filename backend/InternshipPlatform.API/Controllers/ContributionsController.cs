using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

[ApiController]
[Route("api/contributions")]
public sealed class ContributionsController : ControllerBase
{
    private static readonly Guid DefaultStudentId =
        Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid DefaultMentorId =
        Guid.Parse("22222222-2222-2222-2222-222222222222");

    private readonly IContributionAction _contributionAction;

    public ContributionsController(IContributionAction contributionAction)
    {
        _contributionAction = contributionAction;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyContributions(
        [FromQuery] string? search,
        [FromQuery] ContributionStatus? status,
        [FromQuery] ContributionCategory? category,
        CancellationToken ct)
    {
        var result = await _contributionAction.GetStudentContributionsAsync(
            GetActorId("X-Student-Id", DefaultStudentId),
            search,
            status,
            category,
            ct);
        return Ok(result);
    }

    [HttpGet("{contributionId:guid}")]
    public async Task<IActionResult> GetMyContribution(
        Guid contributionId,
        CancellationToken ct)
    {
        var result = await _contributionAction.GetStudentContributionAsync(
            contributionId,
            GetActorId("X-Student-Id", DefaultStudentId),
            ct);
        return ToActionResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateDraft(
        [FromBody] SaveContributionDraftRequest request,
        CancellationToken ct)
    {
        var result = await _contributionAction.CreateDraftAsync(
            request,
            GetActorId("X-Student-Id", DefaultStudentId),
            ct);
        if (!result.IsSuccess)
        {
            return ToActionResult(result);
        }

        return CreatedAtAction(
            nameof(GetMyContribution),
            new { contributionId = result.Data!.Id },
            result.Data);
    }

    [HttpPut("{contributionId:guid}")]
    public async Task<IActionResult> SaveDraft(
        Guid contributionId,
        [FromBody] SaveContributionDraftRequest request,
        CancellationToken ct)
    {
        var result = await _contributionAction.UpdateDraftAsync(
            contributionId,
            request,
            GetActorId("X-Student-Id", DefaultStudentId),
            ct);
        return ToActionResult(result);
    }

    [HttpPost("{contributionId:guid}/evidence/links")]
    public async Task<IActionResult> AddLinkEvidence(
        Guid contributionId,
        [FromBody] AddContributionLinkRequest request,
        CancellationToken ct)
    {
        var result = await _contributionAction.AddLinkEvidenceAsync(
            contributionId,
            request,
            GetActorId("X-Student-Id", DefaultStudentId),
            ct);
        return ToActionResult(result);
    }

    [HttpPost("{contributionId:guid}/evidence/files")]
    [RequestSizeLimit(2 * 1024 * 1024)]
    public async Task<IActionResult> AddFileEvidence(
        Guid contributionId,
        [FromForm] IFormFile file,
        [FromForm] string? name,
        CancellationToken ct)
    {
        await using var content = file.OpenReadStream();
        var result = await _contributionAction.AddFileEvidenceAsync(
            contributionId,
            GetActorId("X-Student-Id", DefaultStudentId),
            name ?? file.FileName,
            file.FileName,
            file.ContentType,
            file.Length,
            content,
            ct);
        return ToActionResult(result);
    }

    [HttpDelete("{contributionId:guid}/evidence/{evidenceId:guid}")]
    public async Task<IActionResult> RemoveEvidence(
        Guid contributionId,
        Guid evidenceId,
        CancellationToken ct)
    {
        var result = await _contributionAction.RemoveEvidenceAsync(
            contributionId,
            evidenceId,
            GetActorId("X-Student-Id", DefaultStudentId),
            ct);
        return ToActionResult(result);
    }

    [HttpPost("{contributionId:guid}/submit")]
    public async Task<IActionResult> Submit(
        Guid contributionId,
        [FromBody] SubmitContributionRequest request,
        CancellationToken ct)
    {
        var result = await _contributionAction.SubmitAsync(
            contributionId,
            request,
            GetActorId("X-Student-Id", DefaultStudentId),
            ct);
        return ToActionResult(result);
    }

    [HttpGet("mentor/queue")]
    public async Task<IActionResult> GetReviewQueue(
        [FromQuery] string? search,
        [FromQuery] ContributionCategory? category,
        CancellationToken ct)
    {
        var result = await _contributionAction.GetReviewQueueAsync(
            search,
            category,
            ct);
        return Ok(result);
    }

    [HttpGet("mentor/{contributionId:guid}")]
    public async Task<IActionResult> GetForMentor(
        Guid contributionId,
        CancellationToken ct)
    {
        var result = await _contributionAction.GetMentorContributionAsync(
            contributionId,
            ct);
        return ToActionResult(result);
    }

    [HttpPost("mentor/{contributionId:guid}/request-changes")]
    public async Task<IActionResult> RequestChanges(
        Guid contributionId,
        [FromBody] RequestContributionChangesRequest request,
        CancellationToken ct)
    {
        var result = await _contributionAction.RequestChangesAsync(
            contributionId,
            request,
            GetActorId("X-Mentor-Id", DefaultMentorId),
            ct);
        return ToActionResult(result);
    }

    [HttpPost("mentor/{contributionId:guid}/validate")]
    public async Task<IActionResult> Validate(
        Guid contributionId,
        [FromBody] ValidateContributionRequest request,
        CancellationToken ct)
    {
        var result = await _contributionAction.ValidateAsync(
            contributionId,
            request,
            GetActorId("X-Mentor-Id", DefaultMentorId),
            ct);
        return ToActionResult(result);
    }

    [HttpPost("mentor/{contributionId:guid}/reject")]
    public async Task<IActionResult> Reject(
        Guid contributionId,
        [FromBody] RejectContributionRequest request,
        CancellationToken ct)
    {
        var result = await _contributionAction.RejectAsync(
            contributionId,
            request,
            GetActorId("X-Mentor-Id", DefaultMentorId),
            ct);
        return ToActionResult(result);
    }

    [HttpPost("{contributionId:guid}/collaborators")]
    public async Task<IActionResult> AddCollaborator(
        Guid contributionId,
        [FromBody] AddContributionCollaboratorRequest request,
        CancellationToken ct)
    {
        var result = await _contributionAction.AddCollaboratorAsync(
            contributionId,
            request,
            GetActorId("X-Student-Id", DefaultStudentId),
            ct);
        return ToActionResult(result);
    }

    [HttpPut("{contributionId:guid}/collaborators/{collaboratorId:guid}")]
    public async Task<IActionResult> UpdateCollaboratorRole(
        Guid contributionId,
        Guid collaboratorId,
        [FromBody] UpdateContributionCollaboratorRoleRequest request,
        CancellationToken ct)
    {
        var result = await _contributionAction.UpdateCollaboratorRoleAsync(
            contributionId,
            collaboratorId,
            request,
            GetActorId("X-Student-Id", DefaultStudentId),
            ct);
        return ToActionResult(result);
    }

    [HttpPost("{contributionId:guid}/collaborators/{collaboratorId:guid}/confirm")]
    public async Task<IActionResult> ConfirmParticipation(
        Guid contributionId,
        Guid collaboratorId,
        CancellationToken ct)
    {
        var actorId = GetActorId("X-Collaborator-Id", Guid.Empty);
        if (actorId != collaboratorId)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new { message = "The collaborator identity does not match the attribution being confirmed." });
        }

        var result = await _contributionAction.ConfirmParticipationAsync(
            contributionId,
            collaboratorId,
            ct);
        return ToActionResult(result);
    }

    [HttpPost("{contributionId:guid}/collaborators/{collaboratorId:guid}/dispute")]
    public async Task<IActionResult> DisputeParticipation(
        Guid contributionId,
        Guid collaboratorId,
        [FromBody] DisputeContributionParticipationRequest request,
        CancellationToken ct)
    {
        var actorId = GetActorId("X-Collaborator-Id", Guid.Empty);
        if (actorId != collaboratorId)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new { message = "The collaborator identity does not match the attribution being disputed." });
        }

        var result = await _contributionAction.DisputeParticipationAsync(
            contributionId,
            collaboratorId,
            request,
            ct);
        return ToActionResult(result);
    }

    [HttpPost("{contributionId:guid}/collaborators/{collaboratorId:guid}/resolve")]
    public async Task<IActionResult> ResolveAttribution(
        Guid contributionId,
        Guid collaboratorId,
        [FromBody] ResolveContributionAttributionRequest request,
        CancellationToken ct)
    {
        var result = await _contributionAction.ResolveAttributionAsync(
            contributionId,
            collaboratorId,
            request,
            GetActorId("X-Student-Id", DefaultStudentId),
            ct);
        return ToActionResult(result);
    }

    private Guid GetActorId(string headerName, Guid fallback)
    {
        var value = Request.Headers[headerName].FirstOrDefault();
        return Guid.TryParse(value, out var actorId) && actorId != Guid.Empty
            ? actorId
            : fallback;
    }

    private IActionResult ToActionResult(ServiceResult<ContributionDetailsDto> result)
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
            _ => StatusCode(StatusCodes.Status500InternalServerError, body)
        };
    }
}
