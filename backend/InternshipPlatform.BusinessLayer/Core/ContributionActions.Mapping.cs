using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;

namespace InternshipPlatform.BusinessLayer.Core;

public partial class ContributionActions
{
    private static ContributionListItemDto MapListItem(
        Contribution contribution,
        IReadOnlyDictionary<Guid, InternshipMemberDto> members)
    {
        var revision = GetCurrentRevision(contribution);
        var student = MemberOrUnknown(members, contribution.StudentId);
        var latestReview = contribution.Revisions
            .SelectMany(item => item.Reviews)
            .OrderByDescending(review => review.ReviewedAtUtc)
            .FirstOrDefault();

        return new ContributionListItemDto
        {
            Id = contribution.Id,
            Student = student,
            Title = revision.Title,
            Category = revision.Category,
            Status = contribution.Status,
            WorkStartDate = revision.WorkStartDate,
            WorkEndDate = revision.WorkEndDate,
            CurrentRevisionNumber = contribution.CurrentRevisionNumber,
            UpdatedAtUtc = contribution.UpdatedAtUtc,
            SubmittedAtUtc = contribution.SubmittedAtUtc,
            Evidence = new EvidenceSummaryDto
            {
                Commits = revision.Evidence.Count(item => item.Type == EvidenceType.GitHubCommit),
                PullRequests = revision.Evidence.Count(item => item.Type == EvidenceType.GitHubPullRequest),
                Images = revision.Evidence.Count(item => item.Type == EvidenceType.Image),
                Documents = revision.Evidence.Count(item => item.Type == EvidenceType.Document),
                Links = revision.Evidence.Count(item => item.Type == EvidenceType.Link),
                Additions = revision.Evidence.Sum(item => item.GitHubAdditions ?? 0),
                Deletions = revision.Evidence.Sum(item => item.GitHubDeletions ?? 0)
            },
            CollaboratorCount = contribution.Collaborators.Count,
            PendingCollaboratorCount = contribution.Collaborators.Count(item =>
                item.Status == ContributionCollaboratorStatus.PendingConfirmation),
            DisputedCollaboratorCount = contribution.Collaborators.Count(item =>
                item.Status == ContributionCollaboratorStatus.Disputed),
            WarningCount = revision.Evidence.Sum(item =>
                BuildSignals(item, revision, student, contribution.Collaborators.ToList(), members)
                    .Count(signal => signal.Status is VerificationSignalStatus.Warning or VerificationSignalStatus.Failed)),
            LatestOutcome = latestReview?.Outcome
        };
    }

    private static ContributionDetailsDto MapDetails(
        Contribution contribution,
        IReadOnlyDictionary<Guid, InternshipMemberDto> members)
    {
        var current = GetCurrentRevision(contribution);
        var student = MemberOrUnknown(members, contribution.StudentId);
        var collaborators = contribution.Collaborators.ToList();
        var evidenceNames = contribution.Revisions
            .SelectMany(revision => revision.Evidence)
            .ToDictionary(evidence => evidence.Id, evidence => evidence.Name);

        return new ContributionDetailsDto
        {
            Id = contribution.Id,
            Student = student,
            Status = contribution.Status,
            CurrentRevisionNumber = contribution.CurrentRevisionNumber,
            CreatedAtUtc = contribution.CreatedAtUtc,
            UpdatedAtUtc = contribution.UpdatedAtUtc,
            SubmittedAtUtc = contribution.SubmittedAtUtc,
            CurrentRevision = MapRevision(current, student, collaborators, members),
            Collaborators = collaborators
                .OrderBy(item => item.AddedAtUtc)
                .Select(item => MapCollaborator(item, members))
                .ToList(),
            Reviews = contribution.Revisions
                .SelectMany(revision => revision.Reviews.Select(review =>
                    MapReview(review, revision.RevisionNumber, members, evidenceNames)))
                .OrderByDescending(review => review.ReviewedAtUtc)
                .ToList(),
            History = MapHistory(contribution, members),
            SubmissionChecks = BuildSubmissionChecks(contribution, student),
            Comparison = CompareWithPreviousRevision(contribution),
            SuggestedCollaborators = IsClosed(contribution.Status)
                ? []
                : SuggestCollaborators(contribution, student, members),
            ChangeRequestsUsed = CountChangeRequests(contribution),
            ChangeRequestsLimit = MaximumChangeRequests
        };
    }

    private static ContributionRevisionDto MapRevision(
        ContributionRevision revision,
        InternshipMemberDto student,
        IReadOnlyCollection<ContributionCollaborator> collaborators,
        IReadOnlyDictionary<Guid, InternshipMemberDto> members) =>
        new()
        {
            Id = revision.Id,
            RevisionNumber = revision.RevisionNumber,
            Title = revision.Title,
            Category = revision.Category,
            WorkStartDate = revision.WorkStartDate,
            WorkEndDate = revision.WorkEndDate,
            Description = revision.Description,
            OwnRole = revision.OwnRole,
            LinkedIssue = revision.LinkedIssueNumber is { } number
                ? new LinkedIssueDto
                {
                    Repository = revision.LinkedIssueRepository!,
                    Number = number,
                    Title = revision.LinkedIssueTitle,
                    State = revision.LinkedIssueState,
                    Url = $"https://github.com/{revision.LinkedIssueRepository}/issues/{number}"
                }
                : null,
            RevisionNote = revision.RevisionNote,
            SubmittedAtUtc = revision.SubmittedAtUtc,
            Evidence = revision.Evidence
                .OrderBy(item => item.CreatedAtUtc)
                .Select(item => MapEvidence(item, revision, student, collaborators, members))
                .ToList()
        };

    private static ContributionEvidenceDto MapEvidence(
        ContributionEvidence evidence,
        ContributionRevision revision,
        InternshipMemberDto student,
        IReadOnlyCollection<ContributionCollaborator> collaborators,
        IReadOnlyDictionary<Guid, InternshipMemberDto> members)
    {
        var isFile = evidence.Type is EvidenceType.Image or EvidenceType.Document;
        return new ContributionEvidenceDto
        {
            Id = evidence.Id,
            Type = evidence.Type,
            Name = evidence.Name,
            Caption = evidence.Caption,
            Url = isFile
                ? $"/api/contributions/evidence/{evidence.Id}/file"
                : evidence.ExternalUrl ?? string.Empty,
            OriginalFileName = evidence.OriginalFileName,
            ContentType = evidence.ContentType,
            FileSizeBytes = evidence.FileSizeBytes,
            GitHub = evidence.GitHubRepository is null ? null : MapGitHub(evidence),
            Signals = BuildSignals(evidence, revision, student, collaborators, members)
        };
    }

    private static GitHubEvidenceDto MapGitHub(ContributionEvidence evidence)
    {
        var details = ReadGitHubDetails(evidence);
        return new GitHubEvidenceDto
        {
            Repository = evidence.GitHubRepository!,
            Reference = evidence.GitHubReference!,
            AuthorLogin = evidence.GitHubAuthorLogin,
            AuthoredAtUtc = evidence.GitHubAuthoredAtUtc,
            Additions = evidence.GitHubAdditions ?? 0,
            Deletions = evidence.GitHubDeletions ?? 0,
            ChangedFiles = evidence.GitHubChangedFiles ?? 0,
            State = evidence.GitHubState,
            ChecksConclusion = evidence.GitHubChecksConclusion,
            Files = details.Files,
            Commits = details.Commits,
            CoAuthors = details.CoAuthorEmails
        };
    }

    private static ContributionReviewDto MapReview(
        ContributionReview review,
        int revisionNumber,
        IReadOnlyDictionary<Guid, InternshipMemberDto> members,
        IReadOnlyDictionary<Guid, string> evidenceNames) =>
        new()
        {
            Id = review.Id,
            RevisionNumber = revisionNumber,
            MentorId = review.MentorId,
            MentorName = members.TryGetValue(review.MentorId, out var mentor) ? mentor.FullName : null,
            Outcome = review.Outcome,
            Summary = review.Summary,
            RejectionReason = review.RejectionReason,
            ReviewedAtUtc = review.ReviewedAtUtc,
            Checks = review.Checks
                .OrderBy(check => check.Criterion)
                .Select(check => new ContributionReviewCheckDto
                {
                    Criterion = check.Criterion,
                    IsMet = check.IsMet,
                    Comment = check.Comment
                })
                .ToList(),
            FeedbackItems = review.FeedbackItems
                .OrderBy(item => item.Position)
                .Select(item => new ContributionFeedbackItemDto
                {
                    Id = item.Id,
                    Position = item.Position,
                    Message = item.Message,
                    EvidenceId = item.EvidenceId,
                    EvidenceName = item.EvidenceId is { } id && evidenceNames.TryGetValue(id, out var name)
                        ? name
                        : null,
                    Response = item.Response,
                    RespondedAtUtc = item.RespondedAtUtc
                })
                .ToList()
        };

    private static ContributionCollaboratorDto MapCollaborator(
        ContributionCollaborator collaborator,
        IReadOnlyDictionary<Guid, InternshipMemberDto> members) =>
        new()
        {
            Id = collaborator.Id,
            UserId = collaborator.UserId,
            Name = collaborator.Name,
            Email = collaborator.Email,
            GitHubUsername = members.TryGetValue(collaborator.UserId, out var member)
                ? member.GitHubUsername
                : null,
            Area = collaborator.Area,
            RoleDescription = collaborator.RoleDescription,
            Status = collaborator.Status,
            DisputeReason = collaborator.DisputeReason,
            ResolutionNote = collaborator.ResolutionNote,
            AddedAtUtc = collaborator.AddedAtUtc,
            UpdatedAtUtc = collaborator.UpdatedAtUtc,
            ConfirmedAtUtc = collaborator.ConfirmedAtUtc,
            DisputedAtUtc = collaborator.DisputedAtUtc
        };

    private static IReadOnlyCollection<ContributionHistoryEventDto> MapHistory(
        Contribution contribution,
        IReadOnlyDictionary<Guid, InternshipMemberDto> members)
    {
        var studentName = MemberOrUnknown(members, contribution.StudentId).FullName;
        return contribution.Revisions
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
                        ActorName = studentName,
                        Note = revision.RevisionNote
                    });
                }

                events.AddRange(revision.Reviews.Select(review => new ContributionHistoryEventDto
                {
                    Id = review.Id,
                    Type = review.Outcome switch
                    {
                        ContributionReviewOutcome.Validated => ContributionHistoryEventType.Validated,
                        ContributionReviewOutcome.Rejected => ContributionHistoryEventType.Rejected,
                        _ => ContributionHistoryEventType.ChangesRequested
                    },
                    RevisionNumber = revision.RevisionNumber,
                    OccurredAtUtc = review.ReviewedAtUtc,
                    ActorName = members.TryGetValue(review.MentorId, out var mentor) ? mentor.FullName : "Mentor",
                    Note = review.Summary
                }));
                return events;
            })
            .OrderBy(item => item.OccurredAtUtc)
            .ToList();
    }
}
