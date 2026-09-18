using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.Domain.Models;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

// The author manages who shared the work and what each person did.
[ApiController]
[Route("api/contributions/{contributionId:guid}/collaborators")]
public sealed class ContributionCollaboratorsController : ContributionControllerBase
{
    private readonly IContributionAction _contributionAction;

    public ContributionCollaboratorsController(IContributionAction contributionAction)
    {
        _contributionAction = contributionAction;
    }

    [HttpPost]
    public async Task<IActionResult> AddCollaborator(
        Guid contributionId,
        [FromBody] AddContributionCollaboratorRequest request,
        CancellationToken ct) =>
        ToActionResult(await _contributionAction.AddCollaboratorAsync(contributionId, request, CurrentUserId, ct));

    [HttpPut("{collaboratorId:guid}")]
    public async Task<IActionResult> UpdateCollaborator(
        Guid contributionId,
        Guid collaboratorId,
        [FromBody] UpdateContributionCollaboratorRequest request,
        CancellationToken ct) =>
        ToActionResult(await _contributionAction.UpdateCollaboratorAsync(
            contributionId,
            collaboratorId,
            request,
            CurrentUserId,
            ct));

    [HttpDelete("{collaboratorId:guid}")]
    public async Task<IActionResult> RemoveCollaborator(
        Guid contributionId,
        Guid collaboratorId,
        CancellationToken ct) =>
        ToActionResult(await _contributionAction.RemoveCollaboratorAsync(
            contributionId,
            collaboratorId,
            CurrentUserId,
            ct));
}
