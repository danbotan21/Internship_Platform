using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Core;

// The collaborator's side: contributions they are listed on, confirm or dispute.
public partial class ContributionActions
{
    internal async Task<ServiceResult<IReadOnlyList<ContributionListItemDto>>> GetAttributedContributionsExecution(
        Guid userId,
        CancellationToken ct)
    {
        if (await FindMemberWithRoleAsync(userId, InternshipMemberRole.Student, ct) is null)
        {
            return Fail<IReadOnlyList<ContributionListItemDto>>(StudentRequired, ServiceErrorType.Forbidden);
        }

        var contributions = await ContributionGraph(tracking: false)
            .Where(item => item.Collaborators.Any(collaborator => collaborator.UserId == userId))
            .OrderByDescending(item => item.UpdatedAtUtc)
            .ToListAsync(ct);

        var members = await LoadMembersAsync(ct);
        return ServiceResult<IReadOnlyList<ContributionListItemDto>>.Success(contributions
            .Select(item =>
            {
                var listItem = MapListItem(item, members);
                var mine = item.Collaborators.First(collaborator => collaborator.UserId == userId);
                listItem.MyCollaboratorId = mine.Id;
                listItem.MyCollaboratorStatus = mine.Status;
                return listItem;
            })
            .ToList());
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> GetAttributedContributionExecution(
        Guid contributionId,
        Guid userId,
        CancellationToken ct)
    {
        var contribution = await ContributionGraph(tracking: false)
            .FirstOrDefaultAsync(item =>
                item.Id == contributionId &&
                item.Collaborators.Any(collaborator => collaborator.UserId == userId),
                ct);

        return contribution is null
            ? Failure("Contribution not found.", ServiceErrorType.NotFound)
            : await DetailsAsync(contribution, ct);
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> ConfirmParticipationExecution(
        Guid contributionId,
        Guid userId,
        CancellationToken ct)
    {
        var (contribution, collaborator, error) = await FindOwnParticipationAsync(contributionId, userId, ct);
        if (error is not null)
        {
            return error;
        }

        if (collaborator!.Status != ContributionCollaboratorStatus.PendingConfirmation)
        {
            return Failure("Only a pending attribution can be confirmed.", ServiceErrorType.Conflict);
        }

        var now = DateTimeOffset.UtcNow;
        collaborator.Status = ContributionCollaboratorStatus.Confirmed;
        collaborator.ConfirmedAtUtc = now;
        collaborator.UpdatedAtUtc = now;
        contribution!.UpdatedAtUtc = now;

        await Context.SaveChangesAsync(ct);
        return await DetailsAsync(contribution, ct);
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> DisputeParticipationExecution(
        Guid contributionId,
        Guid userId,
        DisputeContributionParticipationRequest request,
        CancellationToken ct)
    {
        var reason = request.Reason?.Trim() ?? string.Empty;
        if (reason.Length < MinimumAttributionNoteLength || reason.Length > 1000)
        {
            return Failure(
                $"Explain what is wrong with the attribution ({MinimumAttributionNoteLength} to 1000 characters).",
                ServiceErrorType.Validation);
        }

        var (contribution, collaborator, error) = await FindOwnParticipationAsync(contributionId, userId, ct);
        if (error is not null)
        {
            return error;
        }

        if (collaborator!.Status != ContributionCollaboratorStatus.PendingConfirmation)
        {
            return Failure("Only a pending attribution can be disputed.", ServiceErrorType.Conflict);
        }

        var now = DateTimeOffset.UtcNow;
        collaborator.Status = ContributionCollaboratorStatus.Disputed;
        collaborator.DisputeReason = reason;
        collaborator.ResolutionNote = null;
        collaborator.ConfirmedAtUtc = null;
        collaborator.DisputedAtUtc = now;
        collaborator.ResolvedAtUtc = null;
        collaborator.UpdatedAtUtc = now;
        contribution!.UpdatedAtUtc = now;

        await Context.SaveChangesAsync(ct);
        return await DetailsAsync(contribution, ct);
    }

    private async Task<(Contribution?, ContributionCollaborator?, ServiceResult<ContributionDetailsDto>?)>
        FindOwnParticipationAsync(Guid contributionId, Guid userId, CancellationToken ct)
    {
        var contribution = await ContributionGraph(tracking: true)
            .FirstOrDefaultAsync(
                item => item.Id == contributionId,
                ct);
        var collaborator = contribution?.Collaborators.FirstOrDefault(item => item.UserId == userId);
        if (contribution is null || collaborator is null)
        {
            return (null, null, Failure("Contribution not found.", ServiceErrorType.NotFound));
        }

        if (IsClosed(contribution.Status))
        {
            return (null, null, Failure(
                "Participation is read-only after the mentor's final decision.",
                ServiceErrorType.Conflict));
        }

        return (contribution, collaborator, null);
    }
}
