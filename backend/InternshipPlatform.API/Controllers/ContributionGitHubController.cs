using InternshipPlatform.BusinessLayer.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

// What the student can pick from when attaching GitHub evidence.
[ApiController]
[Route("api/contributions/github")]
public sealed class ContributionGitHubController : ContributionControllerBase
{
    private readonly IContributionAction _contributionAction;

    public ContributionGitHubController(IContributionAction contributionAction)
    {
        _contributionAction = contributionAction;
    }

    [HttpGet("repositories")]
    public async Task<IActionResult> GetRepositories(CancellationToken ct) =>
        ToActionResult(await _contributionAction.GetGitHubRepositoriesAsync(CurrentUserId, ct));

    [HttpGet("commits")]
    public async Task<IActionResult> GetCommits(
        [FromQuery] string repository,
        [FromQuery] string branch,
        CancellationToken ct) =>
        ToActionResult(await _contributionAction.GetGitHubCommitsAsync(CurrentUserId, repository, branch, ct));

    [HttpGet("pull-requests")]
    public async Task<IActionResult> GetPullRequests(
        [FromQuery] string repository,
        CancellationToken ct) =>
        ToActionResult(await _contributionAction.GetGitHubPullRequestsAsync(CurrentUserId, repository, ct));
}
