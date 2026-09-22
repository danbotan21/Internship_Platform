using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Core;

// The mentor's side: create, score, review and finalize evaluations.
public partial class EvaluationActions
{
    internal async Task<ServiceResult<IReadOnlyList<EvaluationListItemDto>>> GetMentorEvaluationsExecution(
        Guid mentorId,
        CancellationToken ct)
    {
        if (await FindMemberWithRoleAsync(mentorId, InternshipMemberRole.Mentor, ct) is null)
        {
            return Fail<IReadOnlyList<EvaluationListItemDto>>(MentorRequired, ServiceErrorType.Forbidden);
        }

        var members = await LoadMembersAsync(ct);
        var studentIds = StudentsOf(members, mentorId);
        var evaluations = await EvaluationGraph(tracking: false)
            .Where(item => studentIds.Contains(item.StudentId))
            .ToListAsync(ct);

        return Ok<IReadOnlyList<EvaluationListItemDto>>(evaluations
            .OrderBy(item => item.Status == EvaluationStatus.Finalized ? 1 : 0)
            .ThenBy(item => item.PeriodEnd)
            .Select(item => MapListItem(item, members, forStudent: false))
            .ToList());
    }

    internal async Task<ServiceResult<IReadOnlyList<StudentEvaluationOverviewDto>>> GetMentorStudentsExecution(
        Guid mentorId,
        CancellationToken ct)
    {
        if (await FindMemberWithRoleAsync(mentorId, InternshipMemberRole.Mentor, ct) is null)
        {
            return Fail<IReadOnlyList<StudentEvaluationOverviewDto>>(MentorRequired, ServiceErrorType.Forbidden);
        }

        var members = await LoadMembersAsync(ct);
        var studentIds = StudentsOf(members, mentorId);
        var evaluations = await EvaluationGraph(tracking: false)
            .Where(item => studentIds.Contains(item.StudentId))
            .ToListAsync(ct);
        var validatedCounts = await Context.Contributions
            .AsNoTracking()
            .Where(item => studentIds.Contains(item.StudentId) && item.Status == ContributionStatus.Validated)
            .GroupBy(item => item.StudentId)
            .Select(group => new { group.Key, Count = group.Count() })
            .ToDictionaryAsync(item => item.Key, item => item.Count, ct);

        return Ok<IReadOnlyList<StudentEvaluationOverviewDto>>(studentIds
            .Select(studentId =>
            {
                var own = evaluations.Where(item => item.StudentId == studentId).OrderBy(item => item.Type).ToList();
                return new StudentEvaluationOverviewDto
                {
                    Student = MemberOrUnknown(members, studentId),
                    Evaluations = own.Select(item => MapListItem(item, members, forStudent: false)).ToList(),
                    MissingTypes = Enum.GetValues<EvaluationType>()
                        .Where(type => own.All(item => item.Type != type))
                        .ToList(),
                    ValidatedContributionCount = validatedCounts.GetValueOrDefault(studentId),
                    LatestFinalScore = own
                        .Where(item => item.Status == EvaluationStatus.Finalized)
                        .OrderByDescending(item => item.FinalizedAtUtc)
                        .FirstOrDefault()?.FinalScore
                };
            })
            .OrderBy(item => item.Student.FullName)
            .ToList());
    }

    internal async Task<ServiceResult<EvaluationDetailsDto>> CreateEvaluationExecution(
        CreateEvaluationRequest request,
        Guid mentorId,
        CancellationToken ct)
    {
        if (await FindMemberWithRoleAsync(mentorId, InternshipMemberRole.Mentor, ct) is null)
        {
            return Fail<EvaluationDetailsDto>(MentorRequired, ServiceErrorType.Forbidden);
        }

        var members = await LoadMembersAsync(ct);
        if (!IsMentorOf(members, mentorId, request.StudentId))
        {
            return Fail<EvaluationDetailsDto>(
                "You can only evaluate students assigned to you.",
                ServiceErrorType.Validation);
        }

        if (!Enum.IsDefined(request.Type))
        {
            return Fail<EvaluationDetailsDto>("Choose the evaluation type.", ServiceErrorType.Validation);
        }

        if (request.PeriodEnd < request.PeriodStart)
        {
            return Fail<EvaluationDetailsDto>("The period cannot end before it starts.", ServiceErrorType.Validation);
        }

        if (request.PeriodEnd.DayNumber - request.PeriodStart.DayNumber > MaximumPeriodDays)
        {
            return Fail<EvaluationDetailsDto>(
                $"An evaluation period can cover at most {MaximumPeriodDays} days.",
                ServiceErrorType.Validation);
        }

        var student = members[request.StudentId];
        if (await Context.Evaluations.AnyAsync(item => item.StudentId == request.StudentId && item.Type == request.Type, ct))
        {
            return Fail<EvaluationDetailsDto>(
                $"{student.FullName} already has a {TypeLabel(request.Type)} evaluation.",
                ServiceErrorType.Conflict);
        }

        var rubric = await FindPublishedAsync(mentorId, ct);
        if (rubric is null)
        {
            return Fail<EvaluationDetailsDto>(
                "Publish an evaluation rubric before creating evaluations.",
                ServiceErrorType.Conflict);
        }

        var now = DateTimeOffset.UtcNow;
        var evaluation = new Evaluation
        {
            Id = Guid.NewGuid(),
            StudentId = request.StudentId,
            MentorId = mentorId,
            RubricVersionId = rubric.Id,
            Type = request.Type,
            PeriodStart = request.PeriodStart,
            PeriodEnd = request.PeriodEnd,
            Status = EvaluationStatus.Draft,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };
        foreach (var criterion in rubric.Criteria)
        {
            evaluation.Scores.Add(new EvaluationScore
            {
                Id = Guid.NewGuid(),
                CriterionId = criterion.Id,
                UpdatedAtUtc = now
            });
        }

        Context.Evaluations.Add(evaluation);
        await Context.SaveChangesAsync(ct);
        return await MentorDetailsAsync(evaluation.Id, mentorId, ct);
    }

    internal Task<ServiceResult<EvaluationDetailsDto>> GetMentorEvaluationExecution(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct) =>
        MentorDetailsAsync(evaluationId, mentorId, ct);

    internal async Task<ServiceResult<EvaluationDetailsDto>> SaveEvaluationExecution(
        Guid evaluationId,
        SaveEvaluationRequest request,
        Guid mentorId,
        CancellationToken ct)
    {
        var (evaluation, _) = await FindMentorEvaluationAsync(evaluationId, mentorId, tracking: true, ct);
        if (evaluation is null)
        {
            return Fail<EvaluationDetailsDto>("Evaluation not found.", ServiceErrorType.NotFound);
        }

        if (evaluation.Status != EvaluationStatus.Draft)
        {
            return Fail<EvaluationDetailsDto>(
                evaluation.Status == EvaluationStatus.Finalized
                    ? "A finalized evaluation is locked."
                    : "Move the evaluation back to draft before editing it.",
                ServiceErrorType.Conflict);
        }

        if (request.PeriodStart is not null || request.PeriodEnd is not null)
        {
            if (request.PeriodStart is not { } start || request.PeriodEnd is not { } end)
            {
                return Fail<EvaluationDetailsDto>(
                    "Send both the start and the end of the period.",
                    ServiceErrorType.Validation);
            }

            if (end < start)
            {
                return Fail<EvaluationDetailsDto>("The period cannot end before it starts.", ServiceErrorType.Validation);
            }

            if (end.DayNumber - start.DayNumber > MaximumPeriodDays)
            {
                return Fail<EvaluationDetailsDto>(
                    $"An evaluation period can cover at most {MaximumPeriodDays} days.",
                    ServiceErrorType.Validation);
            }

            evaluation.PeriodStart = start;
            evaluation.PeriodEnd = end;
        }

        var criteria = evaluation.RubricVersion.Criteria.ToDictionary(item => item.Id);
        var scores = evaluation.Scores.ToDictionary(item => item.CriterionId);
        var now = DateTimeOffset.UtcNow;
        foreach (var input in request.Scores)
        {
            if (!criteria.TryGetValue(input.CriterionId, out var criterion) ||
                !scores.TryGetValue(input.CriterionId, out var score))
            {
                return Fail<EvaluationDetailsDto>(
                    "A score refers to a criterion outside this evaluation's rubric.",
                    ServiceErrorType.Validation);
            }

            if (input.Rating is { } rating && ValidateRating(criterion, rating) is { } ratingError)
            {
                return Fail<EvaluationDetailsDto>(ratingError, ServiceErrorType.Validation);
            }

            var comment = TrimOrNull(input.Comment);
            if (score.Rating != input.Rating || score.Comment != comment)
            {
                score.Rating = input.Rating;
                score.Comment = comment;
                score.UpdatedAtUtc = now;
            }
        }

        evaluation.Strengths = TrimOrNull(request.Strengths);
        evaluation.AreasForImprovement = TrimOrNull(request.AreasForImprovement);
        evaluation.NextSteps = TrimOrNull(request.NextSteps);
        evaluation.OverallComment = TrimOrNull(request.OverallComment);
        evaluation.UpdatedAtUtc = now;

        await Context.SaveChangesAsync(ct);
        return await MentorDetailsAsync(evaluationId, mentorId, ct);
    }

    internal async Task<ServiceResult<EvaluationDetailsDto>> MarkReadyForReviewExecution(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct)
    {
        var (evaluation, _) = await FindMentorEvaluationAsync(evaluationId, mentorId, tracking: true, ct);
        if (evaluation is null)
        {
            return Fail<EvaluationDetailsDto>("Evaluation not found.", ServiceErrorType.NotFound);
        }

        if (evaluation.Status != EvaluationStatus.Draft)
        {
            return Fail<EvaluationDetailsDto>("Only a draft can move to review.", ServiceErrorType.Conflict);
        }

        var failed = BuildEvaluationChecks(evaluation).Where(check => !check.Passed).ToList();
        if (failed.Count != 0)
        {
            return Fail<EvaluationDetailsDto>(
                "Complete the evaluation first: " + string.Join("; ", failed.Select(check => check.Label)) + ".",
                ServiceErrorType.Validation);
        }

        var now = DateTimeOffset.UtcNow;
        evaluation.Status = EvaluationStatus.ReadyForReview;
        evaluation.ReadyForReviewAtUtc = now;
        evaluation.UpdatedAtUtc = now;
        await Context.SaveChangesAsync(ct);
        return await MentorDetailsAsync(evaluationId, mentorId, ct);
    }

    internal async Task<ServiceResult<EvaluationDetailsDto>> ReopenEvaluationExecution(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct)
    {
        var (evaluation, _) = await FindMentorEvaluationAsync(evaluationId, mentorId, tracking: true, ct);
        if (evaluation is null)
        {
            return Fail<EvaluationDetailsDto>("Evaluation not found.", ServiceErrorType.NotFound);
        }

        if (evaluation.Status != EvaluationStatus.ReadyForReview)
        {
            return Fail<EvaluationDetailsDto>(
                "Only an evaluation in review can go back to draft.",
                ServiceErrorType.Conflict);
        }

        evaluation.Status = EvaluationStatus.Draft;
        evaluation.ReadyForReviewAtUtc = null;
        evaluation.UpdatedAtUtc = DateTimeOffset.UtcNow;
        await Context.SaveChangesAsync(ct);
        return await MentorDetailsAsync(evaluationId, mentorId, ct);
    }

    internal async Task<ServiceResult<EvaluationDetailsDto>> FinalizeEvaluationExecution(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct)
    {
        var (evaluation, _) = await FindMentorEvaluationAsync(evaluationId, mentorId, tracking: true, ct);
        if (evaluation is null)
        {
            return Fail<EvaluationDetailsDto>("Evaluation not found.", ServiceErrorType.NotFound);
        }

        if (evaluation.Status != EvaluationStatus.ReadyForReview)
        {
            return Fail<EvaluationDetailsDto>(
                "Review the evaluation before finalizing it.",
                ServiceErrorType.Conflict);
        }

        if (BuildEvaluationChecks(evaluation).Any(check => !check.Passed))
        {
            return Fail<EvaluationDetailsDto>(
                "The evaluation is incomplete and cannot be finalized.",
                ServiceErrorType.Validation);
        }

        var now = DateTimeOffset.UtcNow;
        evaluation.FinalScore = CalculateScore(evaluation);
        evaluation.Status = EvaluationStatus.Finalized;
        evaluation.FinalizedAtUtc = now;
        evaluation.UpdatedAtUtc = now;
        await Context.SaveChangesAsync(ct);
        return await MentorDetailsAsync(evaluationId, mentorId, ct);
    }

    internal async Task<ServiceResult<bool>> DeleteEvaluationExecution(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct)
    {
        var (evaluation, _) = await FindMentorEvaluationAsync(evaluationId, mentorId, tracking: true, ct);
        if (evaluation is null)
        {
            return Fail<bool>("Evaluation not found.", ServiceErrorType.NotFound);
        }

        if (evaluation.Status != EvaluationStatus.Draft)
        {
            return Fail<bool>("Only a draft evaluation can be deleted.", ServiceErrorType.Conflict);
        }

        Context.Evaluations.Remove(evaluation);
        await Context.SaveChangesAsync(ct);
        return Ok(true);
    }

    // Validated contributions from the evaluation period and earlier evaluations.
    internal async Task<ServiceResult<EvaluationContextDto>> GetEvaluationContextExecution(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct)
    {
        var (evaluation, members) = await FindMentorEvaluationAsync(evaluationId, mentorId, tracking: false, ct);
        if (evaluation is null)
        {
            return Fail<EvaluationContextDto>("Evaluation not found.", ServiceErrorType.NotFound);
        }

        var contributions = await Context.Contributions
            .AsNoTracking()
            .Include(item => item.Collaborators)
            .Include(item => item.Revisions).ThenInclude(revision => revision.Evidence)
            .Include(item => item.Revisions).ThenInclude(revision => revision.Reviews)
            .AsSplitQuery()
            .Where(item => item.StudentId == evaluation.StudentId && item.Status == ContributionStatus.Validated)
            .ToListAsync(ct);

        var inPeriod = contributions
            .Select(item => new
            {
                Contribution = item,
                Revision = item.Revisions.Single(revision => revision.RevisionNumber == item.CurrentRevisionNumber)
            })
            .Where(item =>
                item.Revision.WorkStartDate <= evaluation.PeriodEnd &&
                item.Revision.WorkEndDate >= evaluation.PeriodStart)
            .OrderByDescending(item => item.Revision.WorkEndDate)
            .Select(item => new EvaluationContextContributionDto
            {
                Id = item.Contribution.Id,
                Title = item.Revision.Title,
                Category = item.Revision.Category,
                WorkStartDate = item.Revision.WorkStartDate,
                WorkEndDate = item.Revision.WorkEndDate,
                ValidatedAtUtc = item.Revision.Reviews
                    .Where(review => review.Outcome == ContributionReviewOutcome.Validated)
                    .Select(review => (DateTimeOffset?)review.ReviewedAtUtc)
                    .FirstOrDefault(),
                Evidence = new EvidenceSummaryDto
                {
                    Commits = item.Revision.Evidence.Count(evidence => evidence.Type == EvidenceType.GitHubCommit),
                    PullRequests = item.Revision.Evidence.Count(evidence => evidence.Type == EvidenceType.GitHubPullRequest),
                    Images = item.Revision.Evidence.Count(evidence => evidence.Type == EvidenceType.Image),
                    Documents = item.Revision.Evidence.Count(evidence => evidence.Type == EvidenceType.Document),
                    Links = item.Revision.Evidence.Count(evidence => evidence.Type == EvidenceType.Link),
                    Additions = item.Revision.Evidence.Sum(evidence => evidence.GitHubAdditions ?? 0),
                    Deletions = item.Revision.Evidence.Sum(evidence => evidence.GitHubDeletions ?? 0)
                },
                CollaboratorCount = item.Contribution.Collaborators.Count
            })
            .ToList();

        var previous = await EvaluationGraph(tracking: false)
            .Where(item =>
                item.StudentId == evaluation.StudentId &&
                item.Id != evaluation.Id &&
                item.Status == EvaluationStatus.Finalized)
            .OrderByDescending(item => item.FinalizedAtUtc)
            .ToListAsync(ct);

        return Ok(new EvaluationContextDto
        {
            PeriodStart = evaluation.PeriodStart,
            PeriodEnd = evaluation.PeriodEnd,
            Contributions = inPeriod,
            PreviousEvaluations = previous.Select(item => MapListItem(item, members, forStudent: false)).ToList(),
            UnavailableSources = ["Practice reports", "Attendance"]
        });
    }

    private async Task<ServiceResult<EvaluationDetailsDto>> MentorDetailsAsync(
        Guid evaluationId,
        Guid mentorId,
        CancellationToken ct)
    {
        var (evaluation, members) = await FindMentorEvaluationAsync(evaluationId, mentorId, tracking: false, ct);
        if (evaluation is null)
        {
            return Fail<EvaluationDetailsDto>("Evaluation not found.", ServiceErrorType.NotFound);
        }

        var previous = await FindPreviousFinalizedAsync(evaluation, ct);
        return Ok(MapDetails(evaluation, previous, members, forStudent: false));
    }

    // The student's most recent finalized evaluation before this one, for comparison.
    private Task<Evaluation?> FindPreviousFinalizedAsync(Evaluation evaluation, CancellationToken ct) =>
        EvaluationGraph(tracking: false)
            .Where(item =>
                item.StudentId == evaluation.StudentId &&
                item.Id != evaluation.Id &&
                item.Status == EvaluationStatus.Finalized &&
                item.PeriodStart < evaluation.PeriodStart)
            .OrderByDescending(item => item.PeriodStart)
            .FirstOrDefaultAsync(ct);

    private static List<Guid> StudentsOf(IReadOnlyDictionary<Guid, InternshipMemberDto> members, Guid mentorId) =>
        members.Values
            .Where(member => member.Role == InternshipMemberRole.Student && member.MentorId == mentorId)
            .Select(member => member.UserId)
            .ToList();

    private static string TypeLabel(EvaluationType type) => type switch
    {
        EvaluationType.Initial => "initial",
        EvaluationType.MidTerm => "mid-term",
        _ => "final"
    };
}
