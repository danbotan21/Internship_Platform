using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;

namespace InternshipPlatform.BusinessLayer.Core;

public partial class EvaluationActions
{
    private static RubricVersionDto MapVersion(EvaluationRubricVersion version, int usedByEvaluations) =>
        new()
        {
            Id = version.Id,
            VersionNumber = version.VersionNumber,
            Title = version.Title,
            Status = version.Status,
            ChangeNote = version.ChangeNote,
            CreatedAtUtc = version.CreatedAtUtc,
            UpdatedAtUtc = version.UpdatedAtUtc,
            PublishedAtUtc = version.PublishedAtUtc,
            ArchivedAtUtc = version.ArchivedAtUtc,
            TotalWeight = version.Criteria.Sum(item => item.Weight),
            UsedByEvaluations = usedByEvaluations,
            Criteria = version.Criteria.OrderBy(item => item.Position).Select(MapCriterion).ToList(),
            PublishChecks = version.Status == RubricVersionStatus.Draft ? BuildPublishChecks(version) : []
        };

    private static RubricCriterionDto MapCriterion(EvaluationCriterion criterion) =>
        new()
        {
            Id = criterion.Id,
            Position = criterion.Position,
            Name = criterion.Name,
            Description = criterion.Description,
            Guidance = criterion.Guidance,
            Weight = criterion.Weight,
            ScaleMax = criterion.ScaleMax,
            RatingStep = criterion.RatingStep,
            IsVisibleToStudents = criterion.IsVisibleToStudents
        };

    // Students only see progress and the score once the evaluation is finalized.
    private static EvaluationListItemDto MapListItem(
        Evaluation evaluation,
        IReadOnlyDictionary<Guid, InternshipMemberDto> members,
        bool forStudent)
    {
        var resultsVisible = !forStudent || evaluation.Status == EvaluationStatus.Finalized;
        return new EvaluationListItemDto
        {
            Id = evaluation.Id,
            Student = MemberOrUnknown(members, evaluation.StudentId),
            MentorName = members.TryGetValue(evaluation.MentorId, out var mentor) ? mentor.FullName : null,
            Type = evaluation.Type,
            PeriodStart = evaluation.PeriodStart,
            PeriodEnd = evaluation.PeriodEnd,
            Status = evaluation.Status,
            RubricVersionNumber = evaluation.RubricVersion.VersionNumber,
            CriteriaScored = resultsVisible ? evaluation.Scores.Count(item => item.Rating is not null) : 0,
            CriteriaTotal = evaluation.RubricVersion.Criteria.Count,
            FinalScore = resultsVisible ? evaluation.FinalScore : null,
            UpdatedAtUtc = evaluation.UpdatedAtUtc,
            FinalizedAtUtc = evaluation.FinalizedAtUtc,
            AcknowledgedAtUtc = evaluation.AcknowledgedAtUtc,
            IsUpcoming = IsUpcoming(evaluation),
            IsDueSoon = IsDueSoon(evaluation),
            IsOverdue = IsOverdue(evaluation)
        };
    }

    private static EvaluationDetailsDto MapDetails(
        Evaluation evaluation,
        Evaluation? previous,
        IReadOnlyDictionary<Guid, InternshipMemberDto> members,
        bool forStudent)
    {
        var resultsVisible = !forStudent || evaluation.Status == EvaluationStatus.Finalized;
        var scores = evaluation.Scores.ToDictionary(item => item.CriterionId);
        var previousScores = previous is null
            ? new Dictionary<string, (decimal Rating, int ScaleMax)>(StringComparer.OrdinalIgnoreCase)
            : previous.RubricVersion.Criteria
                .Where(item => previous.Scores.Any(score => score.CriterionId == item.Id && score.Rating is not null))
                .GroupBy(item => item.Name, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(
                    group => group.Key,
                    group => (Rating: previous.Scores.First(score => score.CriterionId == group.First().Id).Rating!.Value,
                        ScaleMax: group.First().ScaleMax),
                    StringComparer.OrdinalIgnoreCase);

        var criteria = evaluation.RubricVersion.Criteria
            .Where(item => resultsVisible || item.IsVisibleToStudents)
            .OrderBy(item => item.Position)
            .Select(item =>
            {
                var score = scores.GetValueOrDefault(item.Id);
                var hasPrevious = previousScores.TryGetValue(item.Name, out var earlier);
                return new EvaluationCriterionScoreDto
                {
                    CriterionId = item.Id,
                    Name = item.Name,
                    Description = item.Description,
                    Guidance = item.Guidance,
                    Weight = item.Weight,
                    ScaleMax = item.ScaleMax,
                    RatingStep = item.RatingStep,
                    Rating = resultsVisible ? score?.Rating : null,
                    Comment = resultsVisible ? score?.Comment : null,
                    WeightedPoints = resultsVisible && score?.Rating is { } rating ? WeightedPoints(item, rating) : null,
                    PreviousRating = resultsVisible && hasPrevious ? earlier.Rating : null,
                    PreviousScaleMax = resultsVisible && hasPrevious ? earlier.ScaleMax : null
                };
            })
            .ToList();

        var rated = evaluation.RubricVersion.Criteria
            .Where(item => scores.GetValueOrDefault(item.Id)?.Rating is not null)
            .ToList();

        return new EvaluationDetailsDto
        {
            Id = evaluation.Id,
            Student = MemberOrUnknown(members, evaluation.StudentId),
            Mentor = MemberOrUnknown(members, evaluation.MentorId),
            Type = evaluation.Type,
            PeriodStart = evaluation.PeriodStart,
            PeriodEnd = evaluation.PeriodEnd,
            Status = evaluation.Status,
            RubricVersionId = evaluation.RubricVersionId,
            RubricVersionNumber = evaluation.RubricVersion.VersionNumber,
            RubricTitle = evaluation.RubricVersion.Title,
            ResultsVisible = resultsVisible,
            IsUpcoming = IsUpcoming(evaluation),
            Criteria = criteria,
            Feedback = resultsVisible
                ? new EvaluationFeedbackDto
                {
                    Strengths = evaluation.Strengths,
                    AreasForImprovement = evaluation.AreasForImprovement,
                    NextSteps = evaluation.NextSteps,
                    OverallComment = evaluation.OverallComment
                }
                : new EvaluationFeedbackDto(),
            CriteriaScored = resultsVisible ? rated.Count : 0,
            CriteriaTotal = evaluation.RubricVersion.Criteria.Count,
            ProvisionalPoints = resultsVisible ? CalculateScore(evaluation) : 0,
            ProvisionalMaxPoints = resultsVisible ? rated.Sum(item => item.Weight) : 0,
            FinalScore = resultsVisible ? evaluation.FinalScore : null,
            PreviousFinalScore = resultsVisible ? previous?.FinalScore : null,
            PreviousType = resultsVisible ? previous?.Type : null,
            Checks = forStudent ? [] : BuildEvaluationChecks(evaluation),
            CreatedAtUtc = evaluation.CreatedAtUtc,
            UpdatedAtUtc = evaluation.UpdatedAtUtc,
            ReadyForReviewAtUtc = evaluation.ReadyForReviewAtUtc,
            FinalizedAtUtc = evaluation.FinalizedAtUtc,
            AcknowledgedAtUtc = evaluation.AcknowledgedAtUtc,
            StudentResponse = evaluation.StudentResponse
        };
    }
}
