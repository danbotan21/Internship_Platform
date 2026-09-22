using InternshipPlatform.Domain.Models;

namespace InternshipPlatform.BusinessLayer.Interfaces;

public interface IEvaluationAction
{
    // ---- Mentor: rubric -----------------------------------------------------
    Task<ServiceResult<MentorRubricDto>> GetRubricAsync(Guid mentorId, CancellationToken ct = default);

    Task<ServiceResult<IReadOnlyList<RubricVersionSummaryDto>>> GetRubricHistoryAsync(
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<RubricVersionDto>> GetRubricVersionAsync(
        Guid versionId,
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<MentorRubricDto>> CreateRubricDraftAsync(
        CreateRubricDraftRequest request,
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<MentorRubricDto>> UpdateRubricDraftAsync(
        UpdateRubricDraftRequest request,
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<MentorRubricDto>> DiscardRubricDraftAsync(Guid mentorId, CancellationToken ct = default);

    Task<ServiceResult<MentorRubricDto>> AddCriterionAsync(
        SaveRubricCriterionRequest request,
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<MentorRubricDto>> UpdateCriterionAsync(
        Guid criterionId,
        SaveRubricCriterionRequest request,
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<MentorRubricDto>> MoveCriterionAsync(
        Guid criterionId,
        MoveRubricCriterionRequest request,
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<MentorRubricDto>> RemoveCriterionAsync(
        Guid criterionId,
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<MentorRubricDto>> PublishRubricDraftAsync(Guid mentorId, CancellationToken ct = default);

    // ---- Mentor: evaluations ------------------------------------------------
    Task<ServiceResult<IReadOnlyList<EvaluationListItemDto>>> GetMentorEvaluationsAsync(
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<IReadOnlyList<StudentEvaluationOverviewDto>>> GetMentorStudentsAsync(
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<EvaluationDetailsDto>> CreateEvaluationAsync(
        CreateEvaluationRequest request,
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<EvaluationDetailsDto>> GetMentorEvaluationAsync(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<EvaluationDetailsDto>> SaveEvaluationAsync(
        Guid evaluationId,
        SaveEvaluationRequest request,
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<EvaluationDetailsDto>> MarkReadyForReviewAsync(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<EvaluationDetailsDto>> ReopenEvaluationAsync(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<EvaluationDetailsDto>> FinalizeEvaluationAsync(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<bool>> DeleteEvaluationAsync(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<EvaluationContextDto>> GetEvaluationContextAsync(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct = default);

    // ---- Student ------------------------------------------------------------
    Task<ServiceResult<IReadOnlyList<EvaluationListItemDto>>> GetStudentEvaluationsAsync(
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<EvaluationDetailsDto>> GetStudentEvaluationAsync(
        Guid evaluationId,
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<StudentCriteriaDto>> GetStudentCriteriaAsync(
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<EvaluationDetailsDto>> AcknowledgeEvaluationAsync(
        Guid evaluationId,
        AcknowledgeEvaluationRequest request,
        Guid studentId,
        CancellationToken ct = default);
}
