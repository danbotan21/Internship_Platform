using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;

namespace InternshipPlatform.BusinessLayer.Core;

public partial class ContributionActions
{
    private static ContributionListItemDto MapListItem(Contribution contribution)
    {
        var revision = GetCurrentRevision(contribution);
        return new ContributionListItemDto
        {
            Id = contribution.Id,
            StudentId = contribution.StudentId,
            Title = revision.Title,
            Category = revision.Category,
            WorkPeriod = revision.WorkPeriod,
            Status = contribution.Status,
            EvidenceCount = revision.Evidence.Count,
            CurrentRevisionNumber = contribution.CurrentRevisionNumber,
            UpdatedAtUtc = contribution.UpdatedAtUtc,
            SubmittedAtUtc = contribution.SubmittedAtUtc
        };
    }

    private static ContributionDetailsDto MapDetails(Contribution contribution)
    {
        var current = GetCurrentRevision(contribution);
        var latestReview = contribution.Revisions
            .SelectMany(revision => revision.Reviews)
            .OrderByDescending(review => review.ChangesRequestedAtUtc)
            .FirstOrDefault();

        var history = contribution.Revisions
            .SelectMany(revision =>
            {
                var events = new List<ContributionHistoryEventDto>();
                if (revision.SubmittedAtUtc.HasValue)
                {
                    events.Add(new ContributionHistoryEventDto
                    {
                        Id = revision.Id,
                        Type = revision.RevisionNumber == 1
                            ? ContributionHistoryEventType.Submitted
                            : ContributionHistoryEventType.Resubmitted,
                        RevisionNumber = revision.RevisionNumber,
                        OccurredAtUtc = revision.SubmittedAtUtc.Value,
                        Note = revision.RevisionNote
                    });
                }

                events.AddRange(revision.Reviews.Select(review =>
                    new ContributionHistoryEventDto
                    {
                        Id = review.Id,
                        Type = ContributionHistoryEventType.ChangesRequested,
                        RevisionNumber = revision.RevisionNumber,
                        OccurredAtUtc = review.ChangesRequestedAtUtc,
                        Note = review.Feedback
                    }));
                return events;
            })
            .OrderBy(item => item.OccurredAtUtc)
            .ToList();

        return new ContributionDetailsDto
        {
            Id = contribution.Id,
            StudentId = contribution.StudentId,
            Status = contribution.Status,
            CurrentRevisionNumber = contribution.CurrentRevisionNumber,
            CreatedAtUtc = contribution.CreatedAtUtc,
            UpdatedAtUtc = contribution.UpdatedAtUtc,
            SubmittedAtUtc = contribution.SubmittedAtUtc,
            CurrentRevision = MapRevision(current),
            LatestReview = latestReview is null ? null : MapReview(latestReview),
            History = history
        };
    }

    private static ContributionRevisionDto MapRevision(ContributionRevision revision) =>
        new()
        {
            Id = revision.Id,
            RevisionNumber = revision.RevisionNumber,
            Title = revision.Title,
            Category = revision.Category,
            WorkPeriod = revision.WorkPeriod,
            Description = revision.Description,
            OwnRole = revision.OwnRole,
            LinkedTaskReference = revision.LinkedTaskReference,
            EvidenceNote = revision.EvidenceNote,
            RevisionNote = revision.RevisionNote,
            SubmittedAtUtc = revision.SubmittedAtUtc,
            Evidence = revision.Evidence
                .OrderBy(item => item.CreatedAtUtc)
                .Select(MapEvidence)
                .ToList(),
            Reviews = revision.Reviews
                .OrderBy(item => item.ChangesRequestedAtUtc)
                .Select(MapReview)
                .ToList()
        };

    private static ContributionEvidenceDto MapEvidence(ContributionEvidence evidence) =>
        new()
        {
            Id = evidence.Id,
            Type = evidence.Type,
            Name = evidence.Name,
            Url = evidence.ExternalUrl ?? evidence.StoragePath ?? string.Empty,
            OriginalFileName = evidence.OriginalFileName,
            ContentType = evidence.ContentType,
            FileSizeBytes = evidence.FileSizeBytes
        };

    private static ContributionReviewDto MapReview(ContributionReview review) =>
        new()
        {
            Id = review.Id,
            MentorId = review.MentorId,
            Feedback = review.Feedback,
            ChangesRequestedAtUtc = review.ChangesRequestedAtUtc
        };
}
