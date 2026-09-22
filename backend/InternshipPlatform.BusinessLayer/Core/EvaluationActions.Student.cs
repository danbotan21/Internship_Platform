using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Core;

// The student's side: published criteria, own evaluations, finalized results.
public partial class EvaluationActions
{
    internal async Task<ServiceResult<IReadOnlyList<EvaluationListItemDto>>> GetStudentEvaluationsExecution(
        Guid studentId,
        CancellationToken ct)
    {
        if (await FindMemberWithRoleAsync(studentId, InternshipMemberRole.Student, ct) is null)
        {
            return Fail<IReadOnlyList<EvaluationListItemDto>>(StudentRequired, ServiceErrorType.Forbidden);
        }

        var members = await LoadMembersAsync(ct);
        var evaluations = await EvaluationGraph(tracking: false)
            .Where(item => item.StudentId == studentId)
            .OrderBy(item => item.Type)
            .ToListAsync(ct);

        return Ok<IReadOnlyList<EvaluationListItemDto>>(evaluations
            .Select(item => MapListItem(item, members, forStudent: true))
            .ToList());
    }

    internal async Task<ServiceResult<EvaluationDetailsDto>> GetStudentEvaluationExecution(
        Guid evaluationId,
        Guid studentId,
        CancellationToken ct)
    {
        var evaluation = await EvaluationGraph(tracking: false)
            .FirstOrDefaultAsync(item => item.Id == evaluationId && item.StudentId == studentId, ct);
        if (evaluation is null)
        {
            return Fail<EvaluationDetailsDto>("Evaluation not found.", ServiceErrorType.NotFound);
        }

        var members = await LoadMembersAsync(ct);
        var previous = await FindPreviousFinalizedAsync(evaluation, ct);
        return Ok(MapDetails(evaluation, previous, members, forStudent: true));
    }

    internal async Task<ServiceResult<StudentCriteriaDto>> GetStudentCriteriaExecution(
        Guid studentId,
        CancellationToken ct)
    {
        var student = await FindMemberWithRoleAsync(studentId, InternshipMemberRole.Student, ct);
        if (student is null)
        {
            return Fail<StudentCriteriaDto>(StudentRequired, ServiceErrorType.Forbidden);
        }

        var mentor = student.MentorId is { } mentorId ? await Directory.FindMemberAsync(mentorId, ct) : null;
        var rubric = student.MentorId is { } id ? await FindPublishedAsync(id, ct) : null;

        return Ok(new StudentCriteriaDto
        {
            MentorName = mentor?.FullName,
            RubricVersionNumber = rubric?.VersionNumber,
            RubricTitle = rubric?.Title,
            PublishedAtUtc = rubric?.PublishedAtUtc,
            Criteria = rubric?.Criteria
                .Where(item => item.IsVisibleToStudents)
                .OrderBy(item => item.Position)
                .Select(MapCriterion)
                .ToList() ?? []
        });
    }

    internal async Task<ServiceResult<EvaluationDetailsDto>> AcknowledgeEvaluationExecution(
        Guid evaluationId,
        AcknowledgeEvaluationRequest request,
        Guid studentId,
        CancellationToken ct)
    {
        var evaluation = await Context.Evaluations
            .FirstOrDefaultAsync(item => item.Id == evaluationId && item.StudentId == studentId, ct);
        if (evaluation is null)
        {
            return Fail<EvaluationDetailsDto>("Evaluation not found.", ServiceErrorType.NotFound);
        }

        if (evaluation.Status != EvaluationStatus.Finalized)
        {
            return Fail<EvaluationDetailsDto>(
                "You can acknowledge an evaluation once it is finalized.",
                ServiceErrorType.Conflict);
        }

        if (evaluation.AcknowledgedAtUtc is not null)
        {
            return Fail<EvaluationDetailsDto>("You already acknowledged this evaluation.", ServiceErrorType.Conflict);
        }

        evaluation.AcknowledgedAtUtc = DateTimeOffset.UtcNow;
        evaluation.StudentResponse = TrimOrNull(request.Response);
        await Context.SaveChangesAsync(ct);
        return await GetStudentEvaluationExecution(evaluationId, studentId, ct);
    }
}
