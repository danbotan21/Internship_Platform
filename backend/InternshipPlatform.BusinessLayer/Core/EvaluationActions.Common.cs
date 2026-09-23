using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Core;

public partial class EvaluationActions
{
    private const string MentorRequired = "Only a mentor can manage evaluations.";
    private const string StudentRequired = "Only a student of the internship can view their evaluations.";

    private IQueryable<Evaluation> EvaluationGraph(bool tracking)
    {
        IQueryable<Evaluation> query = Context.Evaluations;
        if (!tracking)
        {
            query = query.AsNoTracking();
        }

        return query
            .Include(item => item.RubricVersion)
                .ThenInclude(version => version.Criteria)
            .Include(item => item.Scores)
            .AsSplitQuery();
    }

    // The mentor's evaluation of one of their own students.
    private async Task<(Evaluation? Evaluation, Dictionary<Guid, InternshipMemberDto> Members)>
        FindMentorEvaluationAsync(Guid evaluationId, Guid mentorId, bool tracking, CancellationToken ct)
    {
        var members = await LoadMembersAsync(ct);
        var evaluation = await EvaluationGraph(tracking)
            .FirstOrDefaultAsync(item => item.Id == evaluationId, ct);
        return evaluation is null || !IsMentorOf(members, mentorId, evaluation.StudentId)
            ? (null, members)
            : (evaluation, members);
    }

    // ---- Directory helpers (shared implementation in InternshipMembers) -----
    private Task<Dictionary<Guid, InternshipMemberDto>> LoadMembersAsync(CancellationToken ct) =>
        InternshipMembers.LoadAsync(Directory, ct);

    private Task<InternshipMemberDto?> FindMemberWithRoleAsync(
        Guid userId,
        InternshipMemberRole role,
        CancellationToken ct) =>
        InternshipMembers.FindWithRoleAsync(Directory, userId, role, ct);

    private static InternshipMemberDto MemberOrUnknown(
        IReadOnlyDictionary<Guid, InternshipMemberDto> members,
        Guid userId) =>
        InternshipMembers.OrUnknown(members, userId);

    private static bool IsMentorOf(
        IReadOnlyDictionary<Guid, InternshipMemberDto> members,
        Guid mentorId,
        Guid studentId) =>
        InternshipMembers.IsMentorOf(members, mentorId, studentId);

    private static string? TrimOrNull(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static ServiceResult<T> Ok<T>(T data) => ServiceResult<T>.Success(data);

    private static ServiceResult<T> Fail<T>(string error, ServiceErrorType errorType) =>
        ServiceResult<T>.Fail(error, errorType);
}
