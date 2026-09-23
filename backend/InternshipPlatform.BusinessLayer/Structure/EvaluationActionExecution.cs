using InternshipPlatform.BusinessLayer.Core;
using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain.Models;

namespace InternshipPlatform.BusinessLayer.Structure;

public sealed class EvaluationActionExecution : EvaluationActions, IEvaluationAction
{
    public EvaluationActionExecution(AppDbContext context, IInternshipDirectoryAction directory)
        : base(context, directory)
    {
    }

    // ---- Mentor: rubric -----------------------------------------------------
    public Task<ServiceResult<MentorRubricDto>> GetRubricAsync(Guid mentorId, CancellationToken ct = default) =>
        GetRubricExecution(mentorId, ct);

    public Task<ServiceResult<IReadOnlyList<RubricVersionSummaryDto>>> GetRubricHistoryAsync(
        Guid mentorId,
        CancellationToken ct = default) =>
        GetRubricHistoryExecution(mentorId, ct);

    public Task<ServiceResult<RubricVersionDto>> GetRubricVersionAsync(
        Guid versionId,
        Guid mentorId,
        CancellationToken ct = default) =>
        GetRubricVersionExecution(versionId, mentorId, ct);

    public Task<ServiceResult<MentorRubricDto>> CreateRubricDraftAsync(
        CreateRubricDraftRequest request,
        Guid mentorId,
        CancellationToken ct = default) =>
        CreateRubricDraftExecution(request, mentorId, ct);

    public Task<ServiceResult<MentorRubricDto>> UpdateRubricDraftAsync(
        UpdateRubricDraftRequest request,
        Guid mentorId,
        CancellationToken ct = default) =>
        UpdateRubricDraftExecution(request, mentorId, ct);

    public Task<ServiceResult<MentorRubricDto>> DiscardRubricDraftAsync(
        Guid mentorId,
        CancellationToken ct = default) =>
        DiscardRubricDraftExecution(mentorId, ct);

    public Task<ServiceResult<MentorRubricDto>> AddCriterionAsync(
        SaveRubricCriterionRequest request,
        Guid mentorId,
        CancellationToken ct = default) =>
        AddCriterionExecution(request, mentorId, ct);

    public Task<ServiceResult<MentorRubricDto>> UpdateCriterionAsync(
        Guid criterionId,
        SaveRubricCriterionRequest request,
        Guid mentorId,
        CancellationToken ct = default) =>
        UpdateCriterionExecution(criterionId, request, mentorId, ct);

    public Task<ServiceResult<MentorRubricDto>> MoveCriterionAsync(
        Guid criterionId,
        MoveRubricCriterionRequest request,
        Guid mentorId,
        CancellationToken ct = default) =>
        MoveCriterionExecution(criterionId, request, mentorId, ct);

    public Task<ServiceResult<MentorRubricDto>> RemoveCriterionAsync(
        Guid criterionId,
        Guid mentorId,
        CancellationToken ct = default) =>
        RemoveCriterionExecution(criterionId, mentorId, ct);

    public Task<ServiceResult<MentorRubricDto>> PublishRubricDraftAsync(
        Guid mentorId,
        CancellationToken ct = default) =>
        PublishRubricDraftExecution(mentorId, ct);

    // ---- Mentor: evaluations ------------------------------------------------
    public Task<ServiceResult<IReadOnlyList<EvaluationListItemDto>>> GetMentorEvaluationsAsync(
        Guid mentorId,
        CancellationToken ct = default) =>
        GetMentorEvaluationsExecution(mentorId, ct);

    public Task<ServiceResult<IReadOnlyList<StudentEvaluationOverviewDto>>> GetMentorStudentsAsync(
        Guid mentorId,
        CancellationToken ct = default) =>
        GetMentorStudentsExecution(mentorId, ct);

    public Task<ServiceResult<EvaluationDetailsDto>> CreateEvaluationAsync(
        CreateEvaluationRequest request,
        Guid mentorId,
        CancellationToken ct = default) =>
        CreateEvaluationExecution(request, mentorId, ct);

    public Task<ServiceResult<EvaluationDetailsDto>> GetMentorEvaluationAsync(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct = default) =>
        GetMentorEvaluationExecution(evaluationId, mentorId, ct);

    public Task<ServiceResult<EvaluationDetailsDto>> SaveEvaluationAsync(
        Guid evaluationId,
        SaveEvaluationRequest request,
        Guid mentorId,
        CancellationToken ct = default) =>
        SaveEvaluationExecution(evaluationId, request, mentorId, ct);

    public Task<ServiceResult<EvaluationDetailsDto>> MarkReadyForReviewAsync(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct = default) =>
        MarkReadyForReviewExecution(evaluationId, mentorId, ct);

    public Task<ServiceResult<EvaluationDetailsDto>> ReopenEvaluationAsync(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct = default) =>
        ReopenEvaluationExecution(evaluationId, mentorId, ct);

    public Task<ServiceResult<EvaluationDetailsDto>> FinalizeEvaluationAsync(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct = default) =>
        FinalizeEvaluationExecution(evaluationId, mentorId, ct);

    public Task<ServiceResult<bool>> DeleteEvaluationAsync(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct = default) =>
        DeleteEvaluationExecution(evaluationId, mentorId, ct);

    public Task<ServiceResult<EvaluationContextDto>> GetEvaluationContextAsync(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct = default) =>
        GetEvaluationContextExecution(evaluationId, mentorId, ct);

    // ---- Student ------------------------------------------------------------
    public Task<ServiceResult<IReadOnlyList<EvaluationListItemDto>>> GetStudentEvaluationsAsync(
        Guid studentId,
        CancellationToken ct = default) =>
        GetStudentEvaluationsExecution(studentId, ct);

    public Task<ServiceResult<EvaluationDetailsDto>> GetStudentEvaluationAsync(
        Guid evaluationId,
        Guid studentId,
        CancellationToken ct = default) =>
        GetStudentEvaluationExecution(evaluationId, studentId, ct);

    public Task<ServiceResult<StudentCriteriaDto>> GetStudentCriteriaAsync(
        Guid studentId,
        CancellationToken ct = default) =>
        GetStudentCriteriaExecution(studentId, ct);

    public Task<ServiceResult<EvaluationDetailsDto>> AcknowledgeEvaluationAsync(
        Guid evaluationId,
        AcknowledgeEvaluationRequest request,
        Guid studentId,
        CancellationToken ct = default) =>
        AcknowledgeEvaluationExecution(evaluationId, request, studentId, ct);
}
