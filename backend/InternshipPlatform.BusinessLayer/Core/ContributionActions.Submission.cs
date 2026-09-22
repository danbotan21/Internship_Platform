using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;

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

        var members = await LoadMembersAsync(ct);
        var student = MemberOrUnknown(members, studentId);
        var now = DateTimeOffset.UtcNow;
        var (revision, _) = EnsureEditableRevision(contribution, now);
        if (!string.IsNullOrWhiteSpace(request.RevisionNote))
        {
            revision.RevisionNote = request.RevisionNote.Trim();
        }

        // The backend is the single source of truth for what blocks submission.
        var failed = BuildSubmissionChecks(contribution, student)
            .Where(check => !check.Passed)
            .ToList();
        if (failed.Count != 0)
        {
            return Failure(
                "The contribution is not ready: " +
                string.Join("; ", failed.Select(check => check.Label)) + ".",
                ServiceErrorType.Validation);
        }

        revision.SubmittedAtUtc = now;
        revision.UpdatedAtUtc = now;
        contribution.Status = ContributionStatus.Submitted;
        contribution.SubmittedAtUtc = now;
        contribution.UpdatedAtUtc = now;

        await Context.SaveChangesAsync(ct);
        return Success(MapDetails(contribution, members));
    }
}
