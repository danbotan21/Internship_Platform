using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Core;

public partial class ContributionActions
{
    private const int MinimumReviewSummaryLength = 20;
    private const int MinimumCriterionCommentLength = 10;
    private const int MinimumFeedbackItemLength = 10;
    private const int MaximumFeedbackItems = 10;

    internal async Task<ServiceResult<IReadOnlyList<ContributionListItemDto>>> GetMentorContributionsExecution(
        Guid mentorId,
        CancellationToken ct)
    {
        if (await FindMemberWithRoleAsync(mentorId, InternshipMemberRole.Mentor, ct) is null)
        {
            return Fail<IReadOnlyList<ContributionListItemDto>>(MentorRequired, ServiceErrorType.Forbidden);
        }

        var members = await LoadMembersAsync(ct);
        var studentIds = members.Values
            .Where(member => member.MentorId == mentorId)
            .Select(member => member.UserId)
            .ToList();

        // Mentors never see drafts.
        var contributions = await ContributionGraph(tracking: false)
            .Where(item => studentIds.Contains(item.StudentId) &&
                item.Status != ContributionStatus.Draft)
            .ToListAsync(ct);

        // Awaiting review first (oldest submission first), then the rest by activity.
        var awaitingReview = contributions
            .Where(item => item.Status == ContributionStatus.Submitted)
            .OrderBy(item => item.SubmittedAtUtc);
        var others = contributions
            .Where(item => item.Status != ContributionStatus.Submitted)
            .OrderByDescending(item => item.UpdatedAtUtc);

        return ServiceResult<IReadOnlyList<ContributionListItemDto>>.Success(awaitingReview
            .Concat(others)
            .Select(item => MapListItem(item, members))
            .ToList());
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> GetMentorContributionExecution(
        Guid contributionId,
        Guid mentorId,
        CancellationToken ct)
    {
        var contribution = await ContributionGraph(tracking: false)
            .FirstOrDefaultAsync(
                item => item.Id == contributionId && item.Status != ContributionStatus.Draft,
                ct);
        var members = await LoadMembersAsync(ct);

        return contribution is null || !IsMentorOf(members, mentorId, contribution.StudentId)
            ? Failure("Contribution not found.", ServiceErrorType.NotFound)
            : Success(MapDetails(contribution, members));
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> ReviewExecution(
        Guid contributionId,
        ReviewContributionRequest request,
        Guid mentorId,
        CancellationToken ct)
    {
        if (await FindMemberWithRoleAsync(mentorId, InternshipMemberRole.Mentor, ct) is null)
        {
            return Failure(MentorRequired, ServiceErrorType.Forbidden);
        }

        var inputError = ValidateReviewInput(request);
        if (inputError is not null)
        {
            return Failure(inputError, ServiceErrorType.Validation);
        }

        var contribution = await ContributionGraph(tracking: true)
            .FirstOrDefaultAsync(
                item => item.Id == contributionId && item.Status != ContributionStatus.Draft,
                ct);
        var members = await LoadMembersAsync(ct);
        if (contribution is null || !IsMentorOf(members, mentorId, contribution.StudentId))
        {
            return Failure("Contribution not found.", ServiceErrorType.NotFound);
        }

        var revision = GetCurrentRevision(contribution);
        if (contribution.Status != ContributionStatus.Submitted ||
            revision.SubmittedAtUtc is null ||
            revision.Reviews.Count != 0)
        {
            return Failure(
                "Only a submitted revision that has not been reviewed yet can receive a review.",
                ServiceErrorType.Conflict);
        }

        var outcomeError = ValidateOutcome(contribution, revision, request);
        if (outcomeError is not null)
        {
            return Failure(outcomeError, ServiceErrorType.Conflict);
        }

        var now = DateTimeOffset.UtcNow;
        var review = new ContributionReview
        {
            Id = Guid.NewGuid(),
            ContributionRevisionId = revision.Id,
            MentorId = mentorId,
            Outcome = request.Outcome,
            Summary = request.Summary.Trim(),
            RejectionReason = request.Outcome == ContributionReviewOutcome.Rejected
                ? request.RejectionReason
                : null,
            ReviewedAtUtc = now
        };

        foreach (var check in request.Checks.OrderBy(item => item.Criterion))
        {
            review.Checks.Add(new ContributionReviewCheck
            {
                Id = Guid.NewGuid(),
                Criterion = check.Criterion,
                IsMet = check.IsMet,
                Comment = TrimOrNull(check.Comment)
            });
        }

        if (request.Outcome == ContributionReviewOutcome.ChangesRequested)
        {
            var position = 1;
            foreach (var item in request.FeedbackItems)
            {
                review.FeedbackItems.Add(new ContributionFeedbackItem
                {
                    Id = Guid.NewGuid(),
                    Position = position++,
                    Message = item.Message.Trim(),
                    EvidenceId = item.EvidenceId
                });
            }
        }

        revision.Reviews.Add(review);
        Context.ContributionReviews.Add(review);
        contribution.Status = request.Outcome switch
        {
            ContributionReviewOutcome.Validated => ContributionStatus.Validated,
            ContributionReviewOutcome.Rejected => ContributionStatus.Rejected,
            _ => ContributionStatus.ChangesRequested
        };
        contribution.UpdatedAtUtc = now;

        await Context.SaveChangesAsync(ct);
        return Success(MapDetails(contribution, members));
    }

    private static string? ValidateReviewInput(ReviewContributionRequest request)
    {
        if (!Enum.IsDefined(request.Outcome))
        {
            return "Choose a review outcome.";
        }

        if (request.Summary.Trim().Length < MinimumReviewSummaryLength)
        {
            return $"Write a review summary of at least {MinimumReviewSummaryLength} characters.";
        }

        var criteria = Enum.GetValues<ContributionReviewCriterion>();
        if (request.Checks.Count != criteria.Length ||
            criteria.Any(criterion => request.Checks.Count(check => check.Criterion == criterion) != 1))
        {
            return "Assess every review criterion exactly once.";
        }

        if (request.Checks.Any(check =>
                !check.IsMet && (check.Comment?.Trim().Length ?? 0) < MinimumCriterionCommentLength))
        {
            return $"Explain every unmet criterion (at least {MinimumCriterionCommentLength} characters).";
        }

        var anyUnmet = request.Checks.Any(check => !check.IsMet);
        switch (request.Outcome)
        {
            case ContributionReviewOutcome.Validated when anyUnmet:
                return "A contribution can only be validated when every criterion is met.";

            case ContributionReviewOutcome.ChangesRequested:
                if (!anyUnmet)
                {
                    return "Mark at least one criterion as not met when requesting changes.";
                }

                if (request.FeedbackItems.Count == 0 || request.FeedbackItems.Count > MaximumFeedbackItems)
                {
                    return $"List between 1 and {MaximumFeedbackItems} concrete changes for the student.";
                }

                if (request.FeedbackItems.Any(item => item.Message.Trim().Length < MinimumFeedbackItemLength))
                {
                    return $"Each requested change needs at least {MinimumFeedbackItemLength} characters.";
                }

                break;

            case ContributionReviewOutcome.Rejected:
                if (!anyUnmet)
                {
                    return "Mark the criteria that are not met before rejecting.";
                }

                if (request.RejectionReason is null || !Enum.IsDefined(request.RejectionReason.Value))
                {
                    return "Choose a rejection reason.";
                }

                break;
        }

        return null;
    }

    private static string? ValidateOutcome(
        Contribution contribution,
        ContributionRevision revision,
        ReviewContributionRequest request)
    {
        if (request.Outcome == ContributionReviewOutcome.Validated &&
            contribution.Collaborators.Any(item => item.Status != ContributionCollaboratorStatus.Confirmed))
        {
            return "All collaborators must confirm their attribution before validation.";
        }

        if (request.Outcome == ContributionReviewOutcome.ChangesRequested)
        {
            if (CountChangeRequests(contribution) >= MaximumChangeRequests)
            {
                return $"Changes were already requested {MaximumChangeRequests} times. Validate or reject the contribution.";
            }

            var evidenceIds = revision.Evidence.Select(item => item.Id).ToHashSet();
            if (request.FeedbackItems.Any(item =>
                    item.EvidenceId is { } id && !evidenceIds.Contains(id)))
            {
                return "Feedback can only point at evidence of the reviewed revision.";
            }
        }

        return null;
    }

    private static int CountChangeRequests(Contribution contribution) =>
        contribution.Revisions
            .SelectMany(revision => revision.Reviews)
            .Count(review => review.Outcome == ContributionReviewOutcome.ChangesRequested);
}
