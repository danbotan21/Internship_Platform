using InternshipPlatform.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace InternshipPlatform.Domain.Models;

public sealed class SaveContributionDraftRequest
{
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public ContributionCategory Category { get; set; } =
        ContributionCategory.Development;

    public DateOnly? WorkStartDate { get; set; }

    public DateOnly? WorkEndDate { get; set; }

    [MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(500)]
    public string OwnRole { get; set; } = string.Empty;

    // GitHub issue URL of an allowed team repository.
    [MaxLength(500)]
    public string? LinkedIssueUrl { get; set; }

    [MaxLength(1000)]
    public string? RevisionNote { get; set; }

    // Answers to the mentor's feedback items when revising.
    public List<FeedbackResponseInput> FeedbackResponses { get; set; } = [];
}

public sealed class FeedbackResponseInput
{
    public Guid FeedbackItemId { get; set; }

    [MaxLength(1000)]
    public string Response { get; set; } = string.Empty;
}
