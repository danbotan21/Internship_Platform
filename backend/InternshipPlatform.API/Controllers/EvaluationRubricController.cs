using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

// Mentor endpoints for the versioned evaluation rubric.
[ApiController]
[Authorize(Roles = "Mentor,Company")]
[Route("api/evaluations/rubric")]
public sealed class EvaluationRubricController : EvaluationControllerBase
{
    private readonly IEvaluationAction _evaluationAction;

    public EvaluationRubricController(IEvaluationAction evaluationAction)
    {
        _evaluationAction = evaluationAction;
    }

    [HttpGet]
    public async Task<IActionResult> GetRubric(CancellationToken ct) =>
        ToActionResult(await _evaluationAction.GetRubricAsync(CurrentUserId, ct));

    [HttpGet("versions")]
    public async Task<IActionResult> GetHistory(CancellationToken ct) =>
        ToActionResult(await _evaluationAction.GetRubricHistoryAsync(CurrentUserId, ct));

    [HttpGet("versions/{versionId:guid}")]
    public async Task<IActionResult> GetVersion(Guid versionId, CancellationToken ct) =>
        ToActionResult(await _evaluationAction.GetRubricVersionAsync(versionId, CurrentUserId, ct));

    [HttpPost("draft")]
    public async Task<IActionResult> CreateDraft([FromBody] CreateRubricDraftRequest request, CancellationToken ct) =>
        ToActionResult(await _evaluationAction.CreateRubricDraftAsync(request, CurrentUserId, ct));

    [HttpPut("draft")]
    public async Task<IActionResult> UpdateDraft([FromBody] UpdateRubricDraftRequest request, CancellationToken ct) =>
        ToActionResult(await _evaluationAction.UpdateRubricDraftAsync(request, CurrentUserId, ct));

    [HttpDelete("draft")]
    public async Task<IActionResult> DiscardDraft(CancellationToken ct) =>
        ToActionResult(await _evaluationAction.DiscardRubricDraftAsync(CurrentUserId, ct));

    [HttpPost("draft/criteria")]
    public async Task<IActionResult> AddCriterion([FromBody] SaveRubricCriterionRequest request, CancellationToken ct) =>
        ToActionResult(await _evaluationAction.AddCriterionAsync(request, CurrentUserId, ct));

    [HttpPut("draft/criteria/{criterionId:guid}")]
    public async Task<IActionResult> UpdateCriterion(
        Guid criterionId,
        [FromBody] SaveRubricCriterionRequest request,
        CancellationToken ct) =>
        ToActionResult(await _evaluationAction.UpdateCriterionAsync(criterionId, request, CurrentUserId, ct));

    [HttpPost("draft/criteria/{criterionId:guid}/move")]
    public async Task<IActionResult> MoveCriterion(
        Guid criterionId,
        [FromBody] MoveRubricCriterionRequest request,
        CancellationToken ct) =>
        ToActionResult(await _evaluationAction.MoveCriterionAsync(criterionId, request, CurrentUserId, ct));

    [HttpDelete("draft/criteria/{criterionId:guid}")]
    public async Task<IActionResult> RemoveCriterion(Guid criterionId, CancellationToken ct) =>
        ToActionResult(await _evaluationAction.RemoveCriterionAsync(criterionId, CurrentUserId, ct));

    [HttpPost("draft/publish")]
    public async Task<IActionResult> Publish(CancellationToken ct) =>
        ToActionResult(await _evaluationAction.PublishRubricDraftAsync(CurrentUserId, ct));
}
