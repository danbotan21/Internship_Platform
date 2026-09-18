using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Core;

public partial class ContributionActions
{
    internal async Task<ServiceResult<IReadOnlyList<ContributionListItemDto>>> GetStudentContributionsExecution(
        Guid studentId,
        CancellationToken ct)
    {
        if (await FindMemberWithRoleAsync(studentId, InternshipMemberRole.Student, ct) is null)
        {
            return Fail<IReadOnlyList<ContributionListItemDto>>(StudentRequired, ServiceErrorType.Forbidden);
        }

        var contributions = await ContributionGraph(tracking: false)
            .Where(item => item.StudentId == studentId)
            .OrderByDescending(item => item.UpdatedAtUtc)
            .ToListAsync(ct);

        var members = await LoadMembersAsync(ct);
        return ServiceResult<IReadOnlyList<ContributionListItemDto>>.Success(
            contributions.Select(item => MapListItem(item, members)).ToList());
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> GetStudentContributionExecution(
        Guid contributionId,
        Guid studentId,
        CancellationToken ct)
    {
        var contribution = await ContributionGraph(tracking: false)
            .FirstOrDefaultAsync(
                item => item.Id == contributionId && item.StudentId == studentId,
                ct);

        return contribution is null
            ? Failure("Contribution not found.", ServiceErrorType.NotFound)
            : await DetailsAsync(contribution, ct);
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> CreateDraftExecution(
        SaveContributionDraftRequest request,
        Guid studentId,
        CancellationToken ct)
    {
        if (await FindMemberWithRoleAsync(studentId, InternshipMemberRole.Student, ct) is null)
        {
            return Failure(StudentRequired, ServiceErrorType.Forbidden);
        }

        var now = DateTimeOffset.UtcNow;
        var contribution = new Contribution
        {
            Id = Guid.NewGuid(),
            StudentId = studentId,
            Status = ContributionStatus.Draft,
            CurrentRevisionNumber = 1,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        var revision = new ContributionRevision
        {
            Id = Guid.NewGuid(),
            RevisionNumber = 1,
            CreatedAtUtc = now
        };
        var error = await ApplyDraftAsync(revision, request, now, ct);
        if (error is not null)
        {
            return Failure(error.Value.Message, error.Value.Type);
        }

        contribution.Revisions.Add(revision);
        Context.Contributions.Add(contribution);
        await Context.SaveChangesAsync(ct);

        return await DetailsAsync(contribution, ct);
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> UpdateDraftExecution(
        Guid contributionId,
        SaveContributionDraftRequest request,
        Guid studentId,
        CancellationToken ct)
    {
        var contribution = await FindOwnedContributionAsync(contributionId, studentId, ct);
        if (contribution is null)
        {
            return Failure("Contribution not found.", ServiceErrorType.NotFound);
        }

        if (!IsEditable(contribution.Status))
        {
            return Failure(
                "A submitted contribution is read-only while it is in mentor review.",
                ServiceErrorType.Conflict);
        }

        var now = DateTimeOffset.UtcNow;
        var (revision, _) = EnsureEditableRevision(contribution, now);
        var error = await ApplyDraftAsync(revision, request, now, ct);
        if (error is not null)
        {
            return Failure(error.Value.Message, error.Value.Type);
        }

        ApplyFeedbackResponses(contribution, request.FeedbackResponses, now);
        contribution.UpdatedAtUtc = now;

        await Context.SaveChangesAsync(ct);
        return await DetailsAsync(contribution, ct);
    }

    internal async Task<ServiceResult<bool>> DeleteDraftExecution(
        Guid contributionId,
        Guid studentId,
        CancellationToken ct)
    {
        var contribution = await FindOwnedContributionAsync(contributionId, studentId, ct);
        if (contribution is null)
        {
            return Fail<bool>("Contribution not found.", ServiceErrorType.NotFound);
        }

        if (contribution.Status != ContributionStatus.Draft ||
            contribution.Revisions.Any(revision => revision.SubmittedAtUtc != null))
        {
            return Fail<bool>(
                "Only a draft that was never submitted can be deleted.",
                ServiceErrorType.Conflict);
        }

        var storagePaths = contribution.Revisions
            .SelectMany(revision => revision.Evidence)
            .Select(evidence => evidence.StoragePath)
            .OfType<string>()
            .Distinct()
            .ToList();

        Context.Contributions.Remove(contribution);
        await Context.SaveChangesAsync(ct);
        await DeleteUnreferencedFilesAsync(storagePaths, ct);

        return ServiceResult<bool>.Success(true);
    }

    private async Task<(string Message, ServiceErrorType Type)?> ApplyDraftAsync(
        ContributionRevision revision,
        SaveContributionDraftRequest request,
        DateTimeOffset now,
        CancellationToken ct)
    {
        if (request.WorkStartDate is { } start &&
            request.WorkEndDate is { } end &&
            end < start)
        {
            return ("The work period cannot end before it starts.", ServiceErrorType.Validation);
        }

        var today = DateOnly.FromDateTime(now.UtcDateTime);
        if (request.WorkStartDate > today || request.WorkEndDate > today)
        {
            return ("The work period cannot be in the future.", ServiceErrorType.Validation);
        }

        var issueError = await ApplyLinkedIssueAsync(revision, request.LinkedIssueUrl, ct);
        if (issueError is not null)
        {
            return issueError;
        }

        revision.Title = request.Title.Trim();
        revision.Category = request.Category;
        revision.WorkStartDate = request.WorkStartDate;
        revision.WorkEndDate = request.WorkEndDate;
        revision.Description = request.Description.Trim();
        revision.OwnRole = request.OwnRole.Trim();
        revision.RevisionNote = TrimOrNull(request.RevisionNote);
        revision.UpdatedAtUtc = now;
        return null;
    }

    private async Task<(string Message, ServiceErrorType Type)?> ApplyLinkedIssueAsync(
        ContributionRevision revision,
        string? issueUrl,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(issueUrl))
        {
            revision.LinkedIssueRepository = null;
            revision.LinkedIssueNumber = null;
            revision.LinkedIssueTitle = null;
            revision.LinkedIssueState = null;
            return null;
        }

        var reference = ParseGitHubUrl(issueUrl);
        if (reference is not { Kind: GitHubUrlKind.Issue })
        {
            return ("The linked task must be a GitHub issue URL, e.g. https://github.com/owner/repo/issues/12.",
                ServiceErrorType.Validation);
        }

        var repository = FindAllowedRepository(reference.Repository);
        if (repository is null)
        {
            return (NotTeamRepositoryMessage(reference.Repository), ServiceErrorType.Validation);
        }

        var number = int.Parse(reference.Reference);
        if (revision.LinkedIssueRepository == repository && revision.LinkedIssueNumber == number)
        {
            return null;
        }

        try
        {
            var issue = await GitHub.GetIssueAsync(repository, number, ct);
            revision.LinkedIssueRepository = repository;
            revision.LinkedIssueNumber = number;
            revision.LinkedIssueTitle = Truncate(issue.Title, 300);
            revision.LinkedIssueState = issue.State;
            return null;
        }
        catch (GitHubUnavailableException ex)
        {
            return (ex.Message, ServiceErrorType.ExternalService);
        }
    }

    private static void ApplyFeedbackResponses(
        Contribution contribution,
        IEnumerable<FeedbackResponseInput> responses,
        DateTimeOffset now)
    {
        var changeRequest = GetOpenChangeRequest(contribution);
        if (changeRequest is null)
        {
            return;
        }

        foreach (var input in responses)
        {
            var item = changeRequest.FeedbackItems.FirstOrDefault(feedback => feedback.Id == input.FeedbackItemId);
            if (item is null)
            {
                continue;
            }

            var response = TrimOrNull(input.Response);
            if (response == item.Response)
            {
                continue;
            }

            item.Response = response;
            item.RespondedAtUtc = response is null ? null : now;
        }
    }

    private static string Truncate(string value, int maxLength) =>
        value.Length <= maxLength ? value : value[..(maxLength - 1)] + "…";
}
