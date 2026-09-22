using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

// A collaborator's view: contributions they are listed on, confirm or dispute.
[ApiController]
[Authorize(Roles = "Student")]
[Route("api/contributions/attributed")]
public sealed class AttributedContributionsController : ContributionControllerBase
{
    private readonly IContributionAction _contributionAction;

    public AttributedContributionsController(IContributionAction contributionAction)
    {
        _contributionAction = contributionAction;
    }

    [HttpGet]
    public async Task<IActionResult> GetAttributedContributions(CancellationToken ct) =>
        ToActionResult(await _contributionAction.GetAttributedContributionsAsync(CurrentUserId, ct));

    [HttpGet("{contributionId:guid}")]
    public async Task<IActionResult> GetAttributedContribution(Guid contributionId, CancellationToken ct) =>
        ToActionResult(await _contributionAction.GetAttributedContributionAsync(contributionId, CurrentUserId, ct));

    [HttpPost("{contributionId:guid}/confirm")]
    public async Task<IActionResult> ConfirmParticipation(Guid contributionId, CancellationToken ct) =>
        ToActionResult(await _contributionAction.ConfirmParticipationAsync(contributionId, CurrentUserId, ct));

    [HttpPost("{contributionId:guid}/dispute")]
    public async Task<IActionResult> DisputeParticipation(
        Guid contributionId,
        [FromBody] DisputeContributionParticipationRequest request,
        CancellationToken ct) =>
        ToActionResult(await _contributionAction.DisputeParticipationAsync(
            contributionId,
            CurrentUserId,
            request,
            ct));
}
