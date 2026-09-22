using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

// Student endpoints: drafts, evidence and submission.
[ApiController]
[Authorize(Roles = "Student")]
[Route("api/contributions")]
public sealed class ContributionsController : ContributionControllerBase
{
    private const long MaximumUploadBytes = 6 * 1024 * 1024;

    private readonly IContributionAction _contributionAction;

    public ContributionsController(IContributionAction contributionAction)
    {
        _contributionAction = contributionAction;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyContributions(CancellationToken ct) =>
        ToActionResult(await _contributionAction.GetStudentContributionsAsync(CurrentUserId, ct));

    [HttpGet("{contributionId:guid}")]
    public async Task<IActionResult> GetMyContribution(Guid contributionId, CancellationToken ct) =>
        ToActionResult(await _contributionAction.GetStudentContributionAsync(contributionId, CurrentUserId, ct));

    [HttpPost]
    public async Task<IActionResult> CreateDraft(
        [FromBody] SaveContributionDraftRequest request,
        CancellationToken ct)
    {
        var result = await _contributionAction.CreateDraftAsync(request, CurrentUserId, ct);
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
        CancellationToken ct) =>
        ToActionResult(await _contributionAction.UpdateDraftAsync(contributionId, request, CurrentUserId, ct));

    [HttpDelete("{contributionId:guid}")]
    public async Task<IActionResult> DeleteDraft(Guid contributionId, CancellationToken ct)
    {
        var result = await _contributionAction.DeleteDraftAsync(contributionId, CurrentUserId, ct);
        return result.IsSuccess ? NoContent() : ToActionResult(result);
    }

    [HttpPost("{contributionId:guid}/submit")]
    public async Task<IActionResult> Submit(
        Guid contributionId,
        [FromBody] SubmitContributionRequest request,
        CancellationToken ct) =>
        ToActionResult(await _contributionAction.SubmitAsync(contributionId, request, CurrentUserId, ct));

    [HttpPost("{contributionId:guid}/evidence/links")]
    public async Task<IActionResult> AddLinkEvidence(
        Guid contributionId,
        [FromBody] AddContributionLinkRequest request,
        CancellationToken ct) =>
        ToActionResult(await _contributionAction.AddLinkEvidenceAsync(contributionId, request, CurrentUserId, ct));

    [HttpPost("{contributionId:guid}/evidence/github")]
    public async Task<IActionResult> AddGitHubEvidence(
        Guid contributionId,
        [FromBody] AddGitHubEvidenceRequest request,
        CancellationToken ct) =>
        ToActionResult(await _contributionAction.AddGitHubEvidenceAsync(contributionId, request, CurrentUserId, ct));

    [HttpPost("{contributionId:guid}/evidence/files")]
    [RequestSizeLimit(MaximumUploadBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaximumUploadBytes)]
    public async Task<IActionResult> AddFileEvidence(
        Guid contributionId,
        [FromForm] IFormFile file,
        [FromForm] string? caption,
        CancellationToken ct)
    {
        await using var content = file.OpenReadStream();
        return ToActionResult(await _contributionAction.AddFileEvidenceAsync(
            contributionId,
            CurrentUserId,
            caption ?? string.Empty,
            file.FileName,
            file.Length,
            content,
            ct));
    }

    [HttpDelete("{contributionId:guid}/evidence/{evidenceId:guid}")]
    public async Task<IActionResult> RemoveEvidence(
        Guid contributionId,
        Guid evidenceId,
        CancellationToken ct) =>
        ToActionResult(await _contributionAction.RemoveEvidenceAsync(contributionId, evidenceId, CurrentUserId, ct));

    // Current GitHub state (CI, pull request) of the evidence snapshots.
    [HttpGet("{contributionId:guid}/github-status")]
    public async Task<IActionResult> GetGitHubStatus(Guid contributionId, CancellationToken ct) =>
        ToActionResult(await _contributionAction.GetLiveGitHubStatusAsync(contributionId, CurrentUserId, ct));

    // Students of the same mentor who can be added as collaborators.
    [HttpGet("team-members")]
    public async Task<IActionResult> GetTeamMembers(CancellationToken ct) =>
        ToActionResult(await _contributionAction.GetTeamMembersAsync(CurrentUserId, ct));
}
