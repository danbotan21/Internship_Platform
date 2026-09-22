using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

// Student endpoints: criteria preview, own evaluations and finalized results.
[ApiController]
[Authorize(Roles = "Student")]
[Route("api/evaluations/student")]
public sealed class StudentEvaluationsController : EvaluationControllerBase
{
    private readonly IEvaluationAction _evaluationAction;

    public StudentEvaluationsController(IEvaluationAction evaluationAction)
    {
        _evaluationAction = evaluationAction;
    }

    [HttpGet]
    public async Task<IActionResult> GetEvaluations(CancellationToken ct) =>
        ToActionResult(await _evaluationAction.GetStudentEvaluationsAsync(CurrentUserId, ct));

    [HttpGet("criteria")]
    public async Task<IActionResult> GetCriteria(CancellationToken ct) =>
        ToActionResult(await _evaluationAction.GetStudentCriteriaAsync(CurrentUserId, ct));

    [HttpGet("{evaluationId:guid}")]
    public async Task<IActionResult> GetEvaluation(Guid evaluationId, CancellationToken ct) =>
        ToActionResult(await _evaluationAction.GetStudentEvaluationAsync(evaluationId, CurrentUserId, ct));

    [HttpPost("{evaluationId:guid}/acknowledge")]
    public async Task<IActionResult> Acknowledge(
        Guid evaluationId,
        [FromBody] AcknowledgeEvaluationRequest request,
        CancellationToken ct) =>
        ToActionResult(await _evaluationAction.AcknowledgeEvaluationAsync(evaluationId, request, CurrentUserId, ct));
}
