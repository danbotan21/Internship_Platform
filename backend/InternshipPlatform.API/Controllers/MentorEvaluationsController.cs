using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

// Mentor endpoints: evaluations of assigned students, from draft to finalized.
[ApiController]
[Authorize(Roles = "Mentor,Company")]
[Route("api/evaluations/mentor")]
public sealed class MentorEvaluationsController : EvaluationControllerBase
{
    private readonly IEvaluationAction _evaluationAction;

    public MentorEvaluationsController(IEvaluationAction evaluationAction)
    {
        _evaluationAction = evaluationAction;
    }

    [HttpGet]
    public async Task<IActionResult> GetEvaluations(CancellationToken ct) =>
        ToActionResult(await _evaluationAction.GetMentorEvaluationsAsync(CurrentUserId, ct));

    [HttpGet("students")]
    public async Task<IActionResult> GetStudents(CancellationToken ct) =>
        ToActionResult(await _evaluationAction.GetMentorStudentsAsync(CurrentUserId, ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEvaluationRequest request, CancellationToken ct)
    {
        var result = await _evaluationAction.CreateEvaluationAsync(request, CurrentUserId, ct);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetEvaluation), new { evaluationId = result.Data!.Id }, result.Data)
            : ToActionResult(result);
    }

    [HttpGet("{evaluationId:guid}")]
    public async Task<IActionResult> GetEvaluation(Guid evaluationId, CancellationToken ct) =>
        ToActionResult(await _evaluationAction.GetMentorEvaluationAsync(evaluationId, CurrentUserId, ct));

    [HttpPut("{evaluationId:guid}")]
    public async Task<IActionResult> Save(
        Guid evaluationId,
        [FromBody] SaveEvaluationRequest request,
        CancellationToken ct) =>
        ToActionResult(await _evaluationAction.SaveEvaluationAsync(evaluationId, request, CurrentUserId, ct));

    [HttpDelete("{evaluationId:guid}")]
    public async Task<IActionResult> Delete(Guid evaluationId, CancellationToken ct)
    {
        var result = await _evaluationAction.DeleteEvaluationAsync(evaluationId, CurrentUserId, ct);
        return result.IsSuccess ? NoContent() : ToActionResult(result);
    }

    [HttpPost("{evaluationId:guid}/ready")]
    public async Task<IActionResult> MarkReady(Guid evaluationId, CancellationToken ct) =>
        ToActionResult(await _evaluationAction.MarkReadyForReviewAsync(evaluationId, CurrentUserId, ct));

    [HttpPost("{evaluationId:guid}/reopen")]
    public async Task<IActionResult> Reopen(Guid evaluationId, CancellationToken ct) =>
        ToActionResult(await _evaluationAction.ReopenEvaluationAsync(evaluationId, CurrentUserId, ct));

    [HttpPost("{evaluationId:guid}/finalize")]
    public async Task<IActionResult> Finalize(Guid evaluationId, CancellationToken ct) =>
        ToActionResult(await _evaluationAction.FinalizeEvaluationAsync(evaluationId, CurrentUserId, ct));

    [HttpGet("{evaluationId:guid}/context")]
    public async Task<IActionResult> GetContext(Guid evaluationId, CancellationToken ct) =>
        ToActionResult(await _evaluationAction.GetEvaluationContextAsync(evaluationId, CurrentUserId, ct));
}
