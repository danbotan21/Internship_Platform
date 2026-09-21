using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.Domain.Models;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

// Mentor endpoints: contributions of their students and the structured review.
[ApiController]
[Route("api/contributions/mentor")]
public sealed class MentorContributionsController : ContributionControllerBase
{
    private readonly IContributionAction _contributionAction;

    public MentorContributionsController(IContributionAction contributionAction)
    {
        _contributionAction = contributionAction;
    }

    [HttpGet]
    public async Task<IActionResult> GetContributions(CancellationToken ct) =>
        ToActionResult(await _contributionAction.GetMentorContributionsAsync(CurrentUserId, ct));

    [HttpGet("{contributionId:guid}")]
    public async Task<IActionResult> GetContribution(Guid contributionId, CancellationToken ct) =>
        ToActionResult(await _contributionAction.GetMentorContributionAsync(contributionId, CurrentUserId, ct));

    [HttpPost("{contributionId:guid}/review")]
    public async Task<IActionResult> Review(
        Guid contributionId,
        [FromBody] ReviewContributionRequest request,
        CancellationToken ct) =>
        ToActionResult(await _contributionAction.ReviewAsync(contributionId, request, CurrentUserId, ct));
}
