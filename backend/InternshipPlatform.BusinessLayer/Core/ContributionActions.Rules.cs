using System.Text.RegularExpressions;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;

namespace InternshipPlatform.BusinessLayer.Core;

// Business rules shared by submission, mapping and review.
public partial class ContributionActions
{
    private const int MaximumChangeRequests = 3;
    private const int MinimumTitleLength = 5;
    private const int MinimumDescriptionLength = 50;
    private const int MinimumOwnRoleLength = 15;
    private const int MinimumRevisionNoteLength = 10;
    private const int MinimumFeedbackResponseLength = 10;
    private const int MaximumWorkPeriodDays = 62;

    private static bool IsMentorOf(
        IReadOnlyDictionary<Guid, InternshipMemberDto> members,
        Guid mentorId,
        Guid studentId) =>
        members.TryGetValue(studentId, out var student) &&
        student.MentorId == mentorId &&
        members.TryGetValue(mentorId, out var mentor) &&
        mentor.Role == InternshipMemberRole.Mentor;

    // ---- Evidence requirements per category -------------------------------------
    private static string EvidenceRequirementLabel(ContributionCategory category) => category switch
    {
        ContributionCategory.Development => "At least one commit or pull request authored by you",
        ContributionCategory.Testing => "A commit / pull request authored by you or a test report (PDF)",
        ContributionCategory.UiUxDesign => "A screenshot or a design link (e.g. Figma)",
        ContributionCategory.Documentation => "A document (PDF) or a commit authored by you",
        ContributionCategory.Research => "A document (PDF) or a reference link",
        _ => "At least one screenshot, document or GitHub item"
    };

    private static bool SatisfiesEvidenceRequirement(
        ContributionCategory category,
        IEnumerable<ContributionEvidence> evidence,
        InternshipMemberDto student)
    {
        bool AuthoredGitHub(ContributionEvidence item) =>
            item.Type is EvidenceType.GitHubCommit or EvidenceType.GitHubPullRequest &&
            IsAuthoredBy(item, student.GitHubUsername);

        return category switch
        {
            ContributionCategory.Development => evidence.Any(AuthoredGitHub),
            ContributionCategory.Testing => evidence.Any(item =>
                AuthoredGitHub(item) || item.Type == EvidenceType.Document),
            ContributionCategory.UiUxDesign => evidence.Any(item =>
                item.Type is EvidenceType.Image or EvidenceType.Link),
            ContributionCategory.Documentation => evidence.Any(item =>
                AuthoredGitHub(item) || item.Type == EvidenceType.Document),
            ContributionCategory.Research => evidence.Any(item =>
                item.Type is EvidenceType.Document or EvidenceType.Link),
            _ => evidence.Any(item => item.Type != EvidenceType.Link)
        };
    }

    private static bool IsAuthoredBy(ContributionEvidence evidence, string? gitHubUsername) =>
        !string.IsNullOrWhiteSpace(gitHubUsername) &&
        string.Equals(evidence.GitHubAuthorLogin, gitHubUsername, StringComparison.OrdinalIgnoreCase);

    // ---- Submission checklist -------------------------------------------------------
    private static IReadOnlyList<SubmissionCheckDto> BuildSubmissionChecks(
        Contribution contribution,
        InternshipMemberDto student)
    {
        if (!IsEditable(contribution.Status))
        {
            return [];
        }

        var revision = GetCurrentRevision(contribution);
        var checks = new List<SubmissionCheckDto>
        {
            Check("mentor", "A mentor is assigned to the internship",
                student.MentorId is not null,
                "Assign a mentor before submitting the contribution."),
            Check("title", "Title describes the delivered work",
                revision.Title.Trim().Length >= MinimumTitleLength,
                $"At least {MinimumTitleLength} characters."),
            Check("description", "Description explains what was done and how",
                revision.Description.Trim().Length >= MinimumDescriptionLength,
                $"At least {MinimumDescriptionLength} characters ({revision.Description.Trim().Length} now)."),
            Check("ownRole", "Your personal role is described",
                revision.OwnRole.Trim().Length >= MinimumOwnRoleLength,
                $"At least {MinimumOwnRoleLength} characters."),
            Check("workPeriod", "Work period is complete and valid",
                IsValidWorkPeriod(revision),
                $"Start and end dates, not in the future, at most {MaximumWorkPeriodDays} days."),
            Check("evidence", EvidenceRequirementLabel(revision.Category),
                SatisfiesEvidenceRequirement(revision.Category, revision.Evidence, student),
                string.IsNullOrWhiteSpace(student.GitHubUsername) &&
                revision.Category is ContributionCategory.Development
                    ? "Your profile has no GitHub account linked."
                    : null),
            Check("collaborators", "Every collaborator confirmed their participation",
                contribution.Collaborators.All(item =>
                    item.Status == ContributionCollaboratorStatus.Confirmed),
                "Wait for pending collaborators; answer disputes and ask them to confirm again.")
        };

        var changeRequest = GetOpenChangeRequest(contribution);
        if (changeRequest is not null)
        {
            var unanswered = changeRequest.FeedbackItems.Count(item =>
                (item.Response?.Trim().Length ?? 0) < MinimumFeedbackResponseLength);
            checks.Add(Check("feedback", "Every feedback point from the mentor is answered",
                unanswered == 0,
                unanswered == 0 ? null : $"{unanswered} point(s) still need an answer."));
            checks.Add(Check("revisionNote", "Revision note summarises what changed",
                (revision.RevisionNote?.Trim().Length ?? 0) >= MinimumRevisionNoteLength,
                $"At least {MinimumRevisionNoteLength} characters."));
            // While the reviewed revision is still current nothing was edited yet.
            var changed = revision.SubmittedAtUtc is null &&
                (CompareWithPreviousRevision(contribution)?.HasChanges ?? true);
            checks.Add(Check("changed", "The contribution changed since the reviewed revision",
                changed,
                "Resubmitting identical content is not allowed."));
        }

        return checks;
    }

    private static SubmissionCheckDto Check(string code, string label, bool passed, string? detail) =>
        new() { Code = code, Label = label, Passed = passed, Detail = passed ? null : detail };

    private static bool IsValidWorkPeriod(ContributionRevision revision)
    {
        if (revision.WorkStartDate is not { } start || revision.WorkEndDate is not { } end)
        {
            return false;
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return end >= start &&
            end <= today &&
            end.DayNumber - start.DayNumber <= MaximumWorkPeriodDays;
    }

    // ---- Verification signals ----------------------------------------------------
    private static IReadOnlyList<VerificationSignalDto> BuildSignals(
        ContributionEvidence evidence,
        ContributionRevision revision,
        InternshipMemberDto student,
        IReadOnlyCollection<ContributionCollaborator> collaborators,
        IReadOnlyDictionary<Guid, InternshipMemberDto> members)
    {
        var signals = new List<VerificationSignalDto>();
        switch (evidence.Type)
        {
            case EvidenceType.GitHubCommit:
            case EvidenceType.GitHubPullRequest:
                signals.Add(Signal("repository", $"From team repository {evidence.GitHubRepository}",
                    VerificationSignalStatus.Passed));
                signals.Add(AuthorSignal(evidence, student, collaborators, members));
                signals.Add(PeriodSignal(evidence, revision));
                if (evidence.Type == EvidenceType.GitHubPullRequest)
                {
                    signals.Add(evidence.GitHubState switch
                    {
                        "merged" => Signal("state", "Pull request merged", VerificationSignalStatus.Passed),
                        "open" => Signal("state", "Pull request still open", VerificationSignalStatus.Info),
                        _ => Signal("state", "Pull request closed without merging", VerificationSignalStatus.Warning)
                    });
                }

                if (evidence.GitHubChecksConclusion is "success" or "failure" or "pending")
                {
                    signals.Add(evidence.GitHubChecksConclusion switch
                    {
                        "success" => Signal("checks", "CI checks passed", VerificationSignalStatus.Passed),
                        "failure" => Signal("checks", "CI checks failed", VerificationSignalStatus.Failed),
                        _ => Signal("checks", "CI checks were still running", VerificationSignalStatus.Info)
                    });
                }
                break;

            case EvidenceType.Image:
            case EvidenceType.Document:
                signals.Add(Signal("fileType",
                    $"File content verified as {(evidence.Type == EvidenceType.Image ? "image" : "PDF")}",
                    VerificationSignalStatus.Passed));
                break;

            default:
                var isDesignTool = Uri.TryCreate(evidence.ExternalUrl, UriKind.Absolute, out var uri) &&
                    (uri.Host.EndsWith("figma.com", StringComparison.OrdinalIgnoreCase) ||
                     uri.Host.EndsWith("miro.com", StringComparison.OrdinalIgnoreCase));
                signals.Add(isDesignTool
                    ? Signal("link", $"Design link on {uri!.Host} — open it to verify",
                        VerificationSignalStatus.Info)
                    : Signal("link", "External link — cannot be verified automatically",
                        VerificationSignalStatus.Warning));
                break;
        }

        return signals;
    }

    private static VerificationSignalDto AuthorSignal(
        ContributionEvidence evidence,
        InternshipMemberDto student,
        IReadOnlyCollection<ContributionCollaborator> collaborators,
        IReadOnlyDictionary<Guid, InternshipMemberDto> members)
    {
        var login = evidence.GitHubAuthorLogin;
        if (string.IsNullOrWhiteSpace(login))
        {
            return Signal("author", "Author is not linked to a GitHub account",
                VerificationSignalStatus.Warning);
        }

        if (IsAuthoredBy(evidence, student.GitHubUsername))
        {
            return Signal("author", $"Authored by the student (@{login})",
                VerificationSignalStatus.Passed);
        }

        var collaborator = collaborators.FirstOrDefault(item =>
            members.TryGetValue(item.UserId, out var member) &&
            string.Equals(member.GitHubUsername, login, StringComparison.OrdinalIgnoreCase));
        return collaborator is not null
            ? Signal("author", $"Authored by collaborator {collaborator.Name} (@{login})",
                VerificationSignalStatus.Info)
            : Signal("author", $"Authored by @{login}, who is not part of this contribution",
                VerificationSignalStatus.Warning);
    }

    private static VerificationSignalDto PeriodSignal(
        ContributionEvidence evidence,
        ContributionRevision revision)
    {
        if (revision.WorkStartDate is not { } start ||
            revision.WorkEndDate is not { } end ||
            evidence.GitHubAuthoredAtUtc is not { } authoredAt)
        {
            return Signal("period", "Work period not set — date could not be compared",
                VerificationSignalStatus.Info);
        }

        // One day of tolerance on each side for time zones.
        var from = start.AddDays(-1);
        var to = end.AddDays(1);
        var date = DateOnly.FromDateTime(authoredAt.UtcDateTime);
        var inPeriod = evidence.Type == EvidenceType.GitHubPullRequest
            ? date <= to && DateOnly.FromDateTime(
                (ReadGitHubDetails(evidence).MergedAtUtc ?? DateTimeOffset.UtcNow).UtcDateTime) >= from
            : date >= from && date <= to;

        return inPeriod
            ? Signal("period", "Dated within the declared work period", VerificationSignalStatus.Passed)
            : Signal("period", $"Dated {date:dd MMM yyyy}, outside the declared work period",
                VerificationSignalStatus.Warning);
    }

    private static VerificationSignalDto Signal(string code, string label, VerificationSignalStatus status) =>
        new() { Code = code, Label = label, Status = status };

    // ---- Revision comparison -----------------------------------------------------
    private static RevisionComparisonDto? CompareWithPreviousRevision(Contribution contribution)
    {
        var current = GetCurrentRevision(contribution);
        var previous = GetPreviousSubmittedRevision(contribution);
        if (previous is null)
        {
            return null;
        }

        var changes = new List<RevisionFieldChangeDto>();
        void Compare(string field, string? before, string? after)
        {
            if (!string.Equals(before?.Trim() ?? string.Empty, after?.Trim() ?? string.Empty, StringComparison.Ordinal))
            {
                changes.Add(new RevisionFieldChangeDto { Field = field, Before = before, After = after });
            }
        }

        Compare("Title", previous.Title, current.Title);
        Compare("Category", CategoryLabel(previous.Category), CategoryLabel(current.Category));
        Compare("Work period", FormatPeriod(previous), FormatPeriod(current));
        Compare("Description", previous.Description, current.Description);
        Compare("Your role", previous.OwnRole, current.OwnRole);
        Compare("Linked issue", FormatIssue(previous), FormatIssue(current));

        var previousKeys = previous.Evidence.GroupBy(EvidenceKey)
            .ToDictionary(group => group.Key, group => group.First().Name);
        var currentKeys = current.Evidence.GroupBy(EvidenceKey)
            .ToDictionary(group => group.Key, group => group.First().Name);

        return new RevisionComparisonDto
        {
            ComparedWithRevision = previous.RevisionNumber,
            FieldChanges = changes,
            EvidenceAdded = currentKeys.Where(item => !previousKeys.ContainsKey(item.Key))
                .Select(item => item.Value).ToList(),
            EvidenceRemoved = previousKeys.Where(item => !currentKeys.ContainsKey(item.Key))
                .Select(item => item.Value).ToList()
        };
    }

    private static string CategoryLabel(ContributionCategory category) => category switch
    {
        ContributionCategory.UiUxDesign => "UI / UX design",
        _ => category.ToString()
    };

    private static string EvidenceKey(ContributionEvidence evidence) =>
        $"{(int)evidence.Type}|{evidence.GitHubRepository}|{evidence.GitHubReference}|{evidence.StoragePath}|{evidence.ExternalUrl}|{evidence.Caption}";

    private static string? FormatPeriod(ContributionRevision revision) =>
        revision.WorkStartDate is null && revision.WorkEndDate is null
            ? null
            : $"{revision.WorkStartDate:yyyy-MM-dd} – {revision.WorkEndDate:yyyy-MM-dd}";

    private static string? FormatIssue(ContributionRevision revision) =>
        revision.LinkedIssueNumber is null
            ? null
            : $"{revision.LinkedIssueRepository}#{revision.LinkedIssueNumber}";

    // ---- Collaborator suggestions ------------------------------------------------
    private static readonly Regex NoReplyEmailPattern = new(
        @"^(?:\d+\+)?(?<login>[\w-]+)@users\.noreply\.github\.com$",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static IReadOnlyList<InternshipMemberDto> SuggestCollaborators(
        Contribution contribution,
        InternshipMemberDto student,
        IReadOnlyDictionary<Guid, InternshipMemberDto> members)
    {
        var logins = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var emails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var evidence in GetCurrentRevision(contribution).Evidence)
        {
            if (evidence.GitHubAuthorLogin is { } author)
            {
                logins.Add(author);
            }

            var details = ReadGitHubDetails(evidence);
            foreach (var commit in details.Commits)
            {
                if (commit.AuthorLogin is { } login)
                {
                    logins.Add(login);
                }
            }

            foreach (var email in details.CoAuthorEmails)
            {
                var match = NoReplyEmailPattern.Match(email);
                if (match.Success)
                {
                    logins.Add(match.Groups["login"].Value);
                }
                else
                {
                    emails.Add(email);
                }
            }
        }

        var listed = contribution.Collaborators.Select(item => item.UserId).ToHashSet();
        return members.Values
            .Where(member =>
                member.Role == InternshipMemberRole.Student &&
                member.UserId != student.UserId &&
                member.MentorId == student.MentorId &&
                !listed.Contains(member.UserId) &&
                ((member.GitHubUsername is { } login && logins.Contains(login)) ||
                 emails.Contains(member.Email)))
            .OrderBy(member => member.FullName)
            .ToList();
    }
}
