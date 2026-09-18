using System.Net.Mail;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Core;

public partial class ContributionActions
{
    private const int MaximumCollaboratorNameLength = 200;
    private const int MaximumCollaboratorEmailLength = 320;
    private const int MaximumCollaboratorRoleLength = 500;
    private const int MaximumAttributionNoteLength = 2000;

    internal async Task<ServiceResult<ContributionDetailsDto>> AddCollaboratorExecution(
        Guid contributionId,
        AddContributionCollaboratorRequest request,
        Guid studentId,
        CancellationToken ct)
    {
        if (studentId == Guid.Empty)
        {
            return Failure("A student identifier is required.", ServiceErrorType.Validation);
        }

        var name = request.Name.Trim();
        var email = request.Email.Trim();
        var role = request.Role.Trim();
        var validationError = ValidateCollaboratorInput(name, email, role);
        if (validationError is not null)
        {
            return Failure(validationError, ServiceErrorType.Validation);
        }

        var contribution = await FindOwnedContributionAsync(contributionId, studentId, ct);
        if (contribution is null)
        {
            return Failure("Contribution not found.", ServiceErrorType.NotFound);
        }

        if (!IsEditable(contribution.Status))
        {
            return Failure(
                "Collaborators can only be changed while the contribution is editable.",
                ServiceErrorType.Conflict);
        }

        var normalizedEmail = NormalizeEmail(email);
        if (contribution.Collaborators.Any(item => item.NormalizedEmail == normalizedEmail))
        {
            return Failure(
                "This email is already listed as a collaborator.",
                ServiceErrorType.Conflict);
        }

        var now = DateTimeOffset.UtcNow;
        var collaborator = new ContributionCollaborator
        {
            Id = Guid.NewGuid(),
            Name = name,
            Email = email,
            NormalizedEmail = normalizedEmail,
            Role = role,
            Status = ContributionCollaboratorStatus.PendingConfirmation,
            AddedAtUtc = now,
            UpdatedAtUtc = now
        };
        contribution.Collaborators.Add(collaborator);
        Context.ContributionCollaborators.Add(collaborator);
        contribution.UpdatedAtUtc = now;

        await Context.SaveChangesAsync(ct);
        return Success(MapDetails(contribution));
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> UpdateCollaboratorRoleExecution(
        Guid contributionId,
        Guid collaboratorId,
        UpdateContributionCollaboratorRoleRequest request,
        Guid studentId,
        CancellationToken ct)
    {
        if (studentId == Guid.Empty || collaboratorId == Guid.Empty)
        {
            return Failure("A valid student and collaborator identifier are required.", ServiceErrorType.Validation);
        }

        var role = request.Role.Trim();
        if (string.IsNullOrWhiteSpace(role))
        {
            return Failure("A collaborator role is required.", ServiceErrorType.Validation);
        }

        if (role.Length > MaximumCollaboratorRoleLength)
        {
            return Failure("The collaborator role cannot exceed 500 characters.", ServiceErrorType.Validation);
        }

        var contribution = await FindOwnedContributionAsync(contributionId, studentId, ct);
        if (contribution is null)
        {
            return Failure("Contribution not found.", ServiceErrorType.NotFound);
        }

        if (!IsEditable(contribution.Status))
        {
            return Failure(
                "Collaborator roles can only be changed while the contribution is editable.",
                ServiceErrorType.Conflict);
        }

        var collaborator = contribution.Collaborators.FirstOrDefault(item => item.Id == collaboratorId);
        if (collaborator is null)
        {
            return Failure("Collaborator not found.", ServiceErrorType.NotFound);
        }

        var now = DateTimeOffset.UtcNow;
        collaborator.Role = role;
        collaborator.UpdatedAtUtc = now;
        contribution.UpdatedAtUtc = now;

        await Context.SaveChangesAsync(ct);
        return Success(MapDetails(contribution));
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> ConfirmParticipationExecution(
        Guid contributionId,
        Guid collaboratorId,
        CancellationToken ct)
    {
        var result = await FindCollaboratorForParticipationAsync(contributionId, collaboratorId, ct);
        if (!result.IsSuccess)
        {
            return result.ErrorType == ServiceErrorType.NotFound
                ? Failure(result.Error!, ServiceErrorType.NotFound)
                : Failure(result.Error!, result.ErrorType!.Value);
        }

        var (contribution, collaborator) = result.Data!;
        if (collaborator.Status is ContributionCollaboratorStatus.Resolved)
        {
            return Failure(
                "This attribution was already resolved by the contribution author.",
                ServiceErrorType.Conflict);
        }

        if (collaborator.Status is ContributionCollaboratorStatus.Confirmed)
        {
            return Failure(
                "Participation has already been confirmed.",
                ServiceErrorType.Conflict);
        }

        var now = DateTimeOffset.UtcNow;
        collaborator.Status = ContributionCollaboratorStatus.Confirmed;
        collaborator.DisputeReason = null;
        collaborator.ResolutionNote = null;
        collaborator.ConfirmedAtUtc = now;
        collaborator.DisputedAtUtc = null;
        collaborator.ResolvedAtUtc = null;
        collaborator.UpdatedAtUtc = now;
        contribution.UpdatedAtUtc = now;

        await Context.SaveChangesAsync(ct);
        return Success(MapDetails(contribution));
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> DisputeParticipationExecution(
        Guid contributionId,
        Guid collaboratorId,
        DisputeContributionParticipationRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            return Failure("A dispute reason is required.", ServiceErrorType.Validation);
        }

        var reason = request.Reason.Trim();
        if (reason.Length > MaximumAttributionNoteLength)
        {
            return Failure("The dispute reason cannot exceed 2000 characters.", ServiceErrorType.Validation);
        }

        var result = await FindCollaboratorForParticipationAsync(contributionId, collaboratorId, ct);
        if (!result.IsSuccess)
        {
            return result.ErrorType == ServiceErrorType.NotFound
                ? Failure(result.Error!, ServiceErrorType.NotFound)
                : Failure(result.Error!, result.ErrorType!.Value);
        }

        var (contribution, collaborator) = result.Data!;
        if (collaborator.Status is ContributionCollaboratorStatus.Resolved)
        {
            return Failure(
                "This attribution was already resolved by the contribution author.",
                ServiceErrorType.Conflict);
        }

        var now = DateTimeOffset.UtcNow;
        collaborator.Status = ContributionCollaboratorStatus.Disputed;
        collaborator.DisputeReason = reason;
        collaborator.ResolutionNote = null;
        collaborator.ConfirmedAtUtc = null;
        collaborator.DisputedAtUtc = now;
        collaborator.ResolvedAtUtc = null;
        collaborator.UpdatedAtUtc = now;
        contribution.UpdatedAtUtc = now;

        await Context.SaveChangesAsync(ct);
        return Success(MapDetails(contribution));
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> ResolveAttributionExecution(
        Guid contributionId,
        Guid collaboratorId,
        ResolveContributionAttributionRequest request,
        Guid studentId,
        CancellationToken ct)
    {
        if (studentId == Guid.Empty || collaboratorId == Guid.Empty)
        {
            return Failure("A valid student and collaborator identifier are required.", ServiceErrorType.Validation);
        }

        if (string.IsNullOrWhiteSpace(request.Note))
        {
            return Failure("A resolution note is required.", ServiceErrorType.Validation);
        }

        var note = request.Note.Trim();
        if (note.Length > MaximumAttributionNoteLength)
        {
            return Failure("The resolution note cannot exceed 2000 characters.", ServiceErrorType.Validation);
        }

        var contribution = await FindOwnedContributionAsync(contributionId, studentId, ct);
        if (contribution is null)
        {
            return Failure("Contribution not found.", ServiceErrorType.NotFound);
        }

        if (contribution.Status is ContributionStatus.Draft or ContributionStatus.Validated or ContributionStatus.Rejected)
        {
            return Failure(
                "Attribution can only be resolved for an active submitted contribution.",
                ServiceErrorType.Conflict);
        }

        var collaborator = contribution.Collaborators.FirstOrDefault(item => item.Id == collaboratorId);
        if (collaborator is null)
        {
            return Failure("Collaborator not found.", ServiceErrorType.NotFound);
        }

        if (collaborator.Status != ContributionCollaboratorStatus.Disputed)
        {
            return Failure(
                "Only a disputed attribution can be resolved.",
                ServiceErrorType.Conflict);
        }

        var now = DateTimeOffset.UtcNow;
        collaborator.Status = ContributionCollaboratorStatus.Resolved;
        collaborator.ResolutionNote = note;
        collaborator.ResolvedAtUtc = now;
        collaborator.UpdatedAtUtc = now;
        contribution.UpdatedAtUtc = now;

        await Context.SaveChangesAsync(ct);
        return Success(MapDetails(contribution));
    }

    private async Task<ServiceResult<(Contribution Contribution, ContributionCollaborator Collaborator)>>
        FindCollaboratorForParticipationAsync(
            Guid contributionId,
            Guid collaboratorId,
            CancellationToken ct)
    {
        if (collaboratorId == Guid.Empty)
        {
            return ServiceResult<(Contribution Contribution, ContributionCollaborator Collaborator)>.Fail(
                "A valid collaborator identifier is required.",
                ServiceErrorType.Validation);
        }

        var contribution = await ContributionGraph(tracking: true)
            .FirstOrDefaultAsync(
                item => item.Id == contributionId && item.Status != ContributionStatus.Draft,
                ct);
        if (contribution is null)
        {
            return ServiceResult<(Contribution Contribution, ContributionCollaborator Collaborator)>.Fail(
                "Contribution not found.",
                ServiceErrorType.NotFound);
        }

        if (contribution.Status is ContributionStatus.Validated or ContributionStatus.Rejected)
        {
            return ServiceResult<(Contribution Contribution, ContributionCollaborator Collaborator)>.Fail(
                "Participation is read-only after a mentor decision.",
                ServiceErrorType.Conflict);
        }

        var collaborator = contribution.Collaborators
            .FirstOrDefault(item => item.Id == collaboratorId);
        if (collaborator is null)
        {
            return ServiceResult<(Contribution Contribution, ContributionCollaborator Collaborator)>.Fail(
                "Collaborator not found.",
                ServiceErrorType.NotFound);
        }

        return ServiceResult<(Contribution Contribution, ContributionCollaborator Collaborator)>.Success(
            (contribution, collaborator));
    }

    private static string? ValidateCollaboratorInput(string name, string email, string role)
    {
        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(role))
        {
            return "Collaborator name, email and role are required.";
        }

        if (name.Length > MaximumCollaboratorNameLength)
        {
            return "The collaborator name cannot exceed 200 characters.";
        }

        if (email.Length > MaximumCollaboratorEmailLength)
        {
            return "The collaborator email cannot exceed 320 characters.";
        }

        if (role.Length > MaximumCollaboratorRoleLength)
        {
            return "The collaborator role cannot exceed 500 characters.";
        }

        try
        {
            var address = new MailAddress(email);
            if (!string.Equals(address.Address, email, StringComparison.OrdinalIgnoreCase))
            {
                return "Enter a valid collaborator email address.";
            }
        }
        catch (FormatException)
        {
            return "Enter a valid collaborator email address.";
        }

        return null;
    }

    private static string NormalizeEmail(string email) => email.ToUpperInvariant();
}
