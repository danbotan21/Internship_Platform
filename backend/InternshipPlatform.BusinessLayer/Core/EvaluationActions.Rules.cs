using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;

namespace InternshipPlatform.BusinessLayer.Core;

// Rules shared by rubric management, scoring and finalization.
public partial class EvaluationActions
{
    private const int MaximumCriteria = 12;
    private const int MinimumCommentLength = 10;
    private const int MinimumFeedbackLength = 10;
    private const int MaximumPeriodDays = 180;
    private const int DueSoonDays = 7;

    private sealed record CriterionTemplate(
        string Name,
        string Description,
        string Guidance,
        int Weight);

    // Recommended starting point for a mentor's first rubric.
    private static readonly IReadOnlyList<CriterionTemplate> RecommendedCriteria =
    [
        new("Technical delivery",
            "Quality, correctness and completeness of the delivered internship work.",
            "1 = work often incomplete or incorrect · 3 = reliable work that meets the task · 5 = consistently excellent, well-structured work.",
            30),
        new("Problem solving",
            "Investigates issues independently and chooses effective solutions.",
            "1 = needs constant guidance · 3 = solves typical problems with some support · 5 = resolves complex blockers and explains trade-offs.",
            25),
        new("Collaboration",
            "Contributes to shared work, reviews and team ownership.",
            "1 = works in isolation · 3 = cooperates when asked · 5 = actively helps others and coordinates shared work.",
            20),
        new("Communication",
            "Clarity of progress updates, decisions and technical context.",
            "1 = progress is unclear · 3 = regular, understandable updates · 5 = proactive, precise communication of decisions and risks.",
            15),
        new("Professional reliability",
            "Consistency, ownership and follow-through on commitments.",
            "1 = misses commitments · 3 = dependable on agreed work · 5 = fully owns outcomes and anticipates needs.",
            10)
    ];

    // ---- Rubric ---------------------------------------------------------------
    private static IReadOnlyList<SubmissionCheckDto> BuildPublishChecks(EvaluationRubricVersion version)
    {
        var criteria = version.Criteria.ToList();
        var totalWeight = criteria.Sum(item => item.Weight);
        var duplicateNames = criteria
            .GroupBy(item => item.Name.Trim(), StringComparer.OrdinalIgnoreCase)
            .Any(group => group.Count() > 1);

        return
        [
            Check("criteria", "At least one criterion", criteria.Count > 0, "Add a criterion."),
            Check("weight", "Weights total exactly 100%", totalWeight == 100,
                $"Currently {totalWeight}% — adjust by {100 - totalWeight:+#;-#;0} points."),
            Check("names", "Criterion names are unique", !duplicateNames, "Rename the duplicated criteria."),
            Check("descriptions", "Every criterion has a description and student guidance",
                criteria.All(item => item.Description.Trim().Length > 0 && item.Guidance.Trim().Length > 0),
                "Complete the missing descriptions or guidance."),
            Check("visible", "At least one criterion is visible to students",
                criteria.Any(item => item.IsVisibleToStudents),
                "Students must know what they are evaluated on.")
        ];
    }

    private static string? ValidateCriterion(SaveRubricCriterionRequest request)
    {
        var name = request.Name.Trim();
        if (name.Length < 2 || name.Length > 100)
        {
            return "The criterion name must have 2 to 100 characters.";
        }

        if (request.Description.Trim().Length < 5)
        {
            return "Describe what the criterion measures (at least 5 characters).";
        }

        if (request.Guidance.Trim().Length < 10)
        {
            return "Add student-facing guidance describing low, good and excellent performance (at least 10 characters).";
        }

        if (request.Weight is < 1 or > 100)
        {
            return "The weight must be between 1% and 100%.";
        }

        if (request.ScaleMax is not (5 or 10))
        {
            return "The rating scale must be 1–5 or 1–10.";
        }

        return request.RatingStep is 0.5m or 1m
            ? null
            : "The rating step must be 0.5 or 1.";
    }

    // ---- Evaluation -------------------------------------------------------------
    private static IReadOnlyList<SubmissionCheckDto> BuildEvaluationChecks(Evaluation evaluation)
    {
        var criteria = evaluation.RubricVersion.Criteria.ToList();
        var scores = evaluation.Scores.ToDictionary(item => item.CriterionId);
        var unrated = criteria.Count(item => scores.GetValueOrDefault(item.Id)?.Rating is null);
        var uncommented = criteria.Count(item =>
            (scores.GetValueOrDefault(item.Id)?.Comment?.Trim().Length ?? 0) < MinimumCommentLength);

        return
        [
            Check("ratings", $"All {criteria.Count} criteria rated", unrated == 0,
                $"{unrated} criterion(s) still without a rating."),
            Check("comments", "Every criterion has a comment", uncommented == 0,
                $"{uncommented} comment(s) missing (at least {MinimumCommentLength} characters)."),
            Check("strengths", "Strengths recorded", IsFeedbackComplete(evaluation.Strengths),
                $"At least {MinimumFeedbackLength} characters."),
            Check("areas", "Areas for improvement recorded", IsFeedbackComplete(evaluation.AreasForImprovement),
                $"At least {MinimumFeedbackLength} characters."),
            Check("nextSteps", "Next steps recorded", IsFeedbackComplete(evaluation.NextSteps),
                $"At least {MinimumFeedbackLength} characters.")
        ];
    }

    private static bool IsFeedbackComplete(string? value) =>
        (value?.Trim().Length ?? 0) >= MinimumFeedbackLength;

    private static string? ValidateRating(EvaluationCriterion criterion, decimal rating)
    {
        if (rating < 1 || rating > criterion.ScaleMax)
        {
            return $"\"{criterion.Name}\" must be rated between 1 and {criterion.ScaleMax}.";
        }

        return (rating - 1) % criterion.RatingStep == 0
            ? null
            : $"\"{criterion.Name}\" is rated in steps of {criterion.RatingStep:0.#}.";
    }

    private static decimal WeightedPoints(EvaluationCriterion criterion, decimal rating) =>
        Math.Round(rating / criterion.ScaleMax * criterion.Weight, 2, MidpointRounding.AwayFromZero);

    // Total on the 100-point scale, from all rated criteria.
    private static decimal CalculateScore(Evaluation evaluation)
    {
        var scores = evaluation.Scores.ToDictionary(item => item.CriterionId);
        var total = evaluation.RubricVersion.Criteria
            .Where(item => scores.GetValueOrDefault(item.Id)?.Rating is not null)
            .Sum(item => WeightedPoints(item, scores[item.Id].Rating!.Value));
        return Math.Round(total, 1, MidpointRounding.AwayFromZero);
    }

    private static DateOnly Today => DateOnly.FromDateTime(DateTime.UtcNow);

    private static bool IsUpcoming(Evaluation evaluation) =>
        evaluation.Status != EvaluationStatus.Finalized && evaluation.PeriodStart > Today;

    private static bool IsDueSoon(Evaluation evaluation) =>
        evaluation.Status != EvaluationStatus.Finalized &&
        evaluation.PeriodEnd >= Today &&
        evaluation.PeriodEnd.DayNumber - Today.DayNumber <= DueSoonDays;

    private static bool IsOverdue(Evaluation evaluation) =>
        evaluation.Status != EvaluationStatus.Finalized && evaluation.PeriodEnd < Today;

    private static SubmissionCheckDto Check(string code, string label, bool passed, string? detail) =>
        new() { Code = code, Label = label, Passed = passed, Detail = passed ? null : detail };
}
