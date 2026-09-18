using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Core;

public partial class ContributionActions
{
    internal async Task<ServiceResult<ContributionDetailsDto>> SubmitExecution(
        Guid contributionId,
        SubmitContributionRequest request,
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
            return Failure("The contribution is already awaiting mentor review.", ServiceErrorType.Conflict);
        }

        var wasChangesRequested = contribution.Status == ContributionStatus.ChangesRequested;
        var now = DateTimeOffset.UtcNow;
        var (revision, _) = EnsureEditableRevision(contribution, now);
        if (!string.IsNullOrWhiteSpace(request.RevisionNote))
        {
            revision.RevisionNote = request.RevisionNote.Trim();
        }

        var validationError = ValidateForSubmission(revision, wasChangesRequested);
        if (validationError is not null)
        {
            return Failure(validationError, ServiceErrorType.Validation);
        }

        revision.SubmittedAtUtc = now;
        revision.UpdatedAtUtc = now;
        contribution.Status = ContributionStatus.Submitted;
        contribution.SubmittedAtUtc = now;
        contribution.UpdatedAtUtc = now;

        await Context.SaveChangesAsync(ct);
        return Success(MapDetails(contribution));
    }

    internal async Task<IReadOnlyList<ContributionListItemDto>> GetReviewQueueExecution(
        string? search,
        ContributionCategory? category,
        CancellationToken ct)
    {
        var query = ContributionGraph(tracking: false)
            .Where(item => item.Status == ContributionStatus.Submitted);

        query = ApplyListFilters(
            query,
            search,
            ContributionStatus.Submitted,
            category);

        var contributions = await query
            .OrderBy(item => item.SubmittedAtUtc)
            .ToListAsync(ct);

        return contributions.Select(MapListItem).ToList();
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> GetMentorContributionExecution(
        Guid contributionId,
        CancellationToken ct)
    {
        var contribution = await ContributionGraph(tracking: false)
            .FirstOrDefaultAsync(
                item => item.Id == contributionId &&
                    item.Status != ContributionStatus.Draft,
                ct);

        return contribution is null
            ? Failure("Contribution not found.", ServiceErrorType.NotFound)
            : Success(MapDetails(contribution));
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> RequestChangesExecution(
        Guid contributionId,
        RequestContributionChangesRequest request,
        Guid mentorId,
        CancellationToken ct)
    {
        if (mentorId == Guid.Empty)
        {
            return Failure("A mentor identifier is required.", ServiceErrorType.Validation);
        }

        if (string.IsNullOrWhiteSpace(request.Feedback))
        {
            return Failure("Mentor feedback is required.", ServiceErrorType.Validation);
        }

        var contribution = await ContributionGraph(tracking: true)
            .FirstOrDefaultAsync(item => item.Id == contributionId, ct);
        if (contribution is null || contribution.Status == ContributionStatus.Draft)
        {
            return Failure("Contribution not found.", ServiceErrorType.NotFound);
        }

        if (contribution.Status != ContributionStatus.Submitted)
        {
            return Failure(
                "Changes can only be requested for a submitted contribution.",
                ServiceErrorType.Conflict);
        }

        var revision = GetCurrentRevision(contribution);
        if (revision.SubmittedAtUtc is null)
        {
            return Failure("The current revision has not been submitted.", ServiceErrorType.Conflict);
        }

        if (revision.Reviews.Count != 0)
        {
            return Failure(
                "Changes have already been requested for this revision.",
                ServiceErrorType.Conflict);
        }

        var now = DateTimeOffset.UtcNow;
        var review = new ContributionReview
        {
            Id = Guid.NewGuid(),
            MentorId = mentorId,
            Feedback = request.Feedback.Trim(),
            ChangesRequestedAtUtc = now
        };
        revision.Reviews.Add(review);
        Context.ContributionReviews.Add(review);
        contribution.Status = ContributionStatus.ChangesRequested;
        contribution.UpdatedAtUtc = now;

        await Context.SaveChangesAsync(ct);
        return Success(MapDetails(contribution));
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> ValidateExecution(
        Guid contributionId,
        ValidateContributionRequest request,
        Guid mentorId,
        CancellationToken ct)
    {
        if (mentorId == Guid.Empty)
        {
            return Failure("A mentor identifier is required.", ServiceErrorType.Validation);
        }

        var contribution = await ContributionGraph(tracking: true)
            .FirstOrDefaultAsync(item => item.Id == contributionId, ct);
        if (contribution is null || contribution.Status == ContributionStatus.Draft)
        {
            return Failure("Contribution not found.", ServiceErrorType.NotFound);
        }

        if (contribution.Status != ContributionStatus.Submitted)
        {
            return Failure(
                "A decision can only be recorded for a submitted contribution.",
                ServiceErrorType.Conflict);
        }

        var revision = GetCurrentRevision(contribution);
        if (revision.SubmittedAtUtc is null)
        {
            return Failure("The current revision has not been submitted.", ServiceErrorType.Conflict);
        }

        if (revision.Reviews.Count != 0 || revision.Decisions.Count != 0)
        {
            return Failure(
                "A review decision has already been recorded for this revision.",
                ServiceErrorType.Conflict);
        }

        if (contribution.Collaborators.Any(item =>
                item.Status == ContributionCollaboratorStatus.Disputed))
        {
            return Failure(
                "Resolve all disputed collaborator attributions before validating the contribution.",
                ServiceErrorType.Conflict);
        }

        var now = DateTimeOffset.UtcNow;
        var decision = new ContributionDecision
        {
            Id = Guid.NewGuid(),
            ContributionRevisionId = revision.Id,
            MentorId = mentorId,
            Decision = ContributionDecisionType.Validated,
            Note = TrimOrNull(request.Note),
            DecidedAtUtc = now
        };

        revision.Decisions.Add(decision);
        Context.ContributionDecisions.Add(decision);
        contribution.Status = ContributionStatus.Validated;
        contribution.UpdatedAtUtc = now;

        await Context.SaveChangesAsync(ct);
        return Success(MapDetails(contribution));
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> RejectExecution(
        Guid contributionId,
        RejectContributionRequest request,
        Guid mentorId,
        CancellationToken ct)
    {
        if (mentorId == Guid.Empty)
        {
            return Failure("A mentor identifier is required.", ServiceErrorType.Validation);
        }

        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            return Failure("A rejection reason is required.", ServiceErrorType.Validation);
        }

        if (string.IsNullOrWhiteSpace(request.Feedback))
        {
            return Failure("Mentor explanation is required.", ServiceErrorType.Validation);
        }

        var contribution = await ContributionGraph(tracking: true)
            .FirstOrDefaultAsync(item => item.Id == contributionId, ct);
        if (contribution is null || contribution.Status == ContributionStatus.Draft)
        {
            return Failure("Contribution not found.", ServiceErrorType.NotFound);
        }

        if (contribution.Status != ContributionStatus.Submitted)
        {
            return Failure(
                "A decision can only be recorded for a submitted contribution.",
                ServiceErrorType.Conflict);
        }

        var revision = GetCurrentRevision(contribution);
        if (revision.SubmittedAtUtc is null)
        {
            return Failure("The current revision has not been submitted.", ServiceErrorType.Conflict);
        }

        if (revision.Reviews.Count != 0 || revision.Decisions.Count != 0)
        {
            return Failure(
                "A review decision has already been recorded for this revision.",
                ServiceErrorType.Conflict);
        }

        var now = DateTimeOffset.UtcNow;
        var decision = new ContributionDecision
        {
            Id = Guid.NewGuid(),
            ContributionRevisionId = revision.Id,
            MentorId = mentorId,
            Decision = ContributionDecisionType.Rejected,
            Reason = request.Reason.Trim(),
            Note = request.Feedback.Trim(),
            DecidedAtUtc = now
        };

        revision.Decisions.Add(decision);
        Context.ContributionDecisions.Add(decision);
        contribution.Status = ContributionStatus.Rejected;
        contribution.UpdatedAtUtc = now;

        await Context.SaveChangesAsync(ct);
        return Success(MapDetails(contribution));
    }

    private static string? ValidateForSubmission(
        ContributionRevision revision,
        bool isResubmission)
    {
        var missing = new List<string>();
        if (string.IsNullOrWhiteSpace(revision.Title)) missing.Add("title");
        if (string.IsNullOrWhiteSpace(revision.WorkPeriod)) missing.Add("work period");
        if (string.IsNullOrWhiteSpace(revision.Description)) missing.Add("description");
        if (string.IsNullOrWhiteSpace(revision.OwnRole)) missing.Add("student role");
        if (revision.Evidence.Count == 0) missing.Add("evidence");
        if (isResubmission && string.IsNullOrWhiteSpace(revision.RevisionNote))
        {
            missing.Add("revision note");
        }

        return missing.Count == 0
            ? null
            : $"Complete the following fields before submission: {string.Join(", ", missing)}.";
    }
}
