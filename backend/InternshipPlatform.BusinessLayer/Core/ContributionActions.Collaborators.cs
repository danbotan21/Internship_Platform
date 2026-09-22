using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;

namespace InternshipPlatform.BusinessLayer.Core;

public partial class ContributionActions
{
    private const int MinimumRoleDescriptionLength = 10;
    private const int MaximumRoleDescriptionLength = 300;
    private const int MinimumAttributionNoteLength = 10;
    private const int MaximumCollaborators = 10;

    // Students of the same mentor, i.e. the people who can share a contribution.
    internal async Task<ServiceResult<IReadOnlyList<InternshipMemberDto>>> GetTeamMembersExecution(
        Guid studentId,
        CancellationToken ct)
    {
        var student = await FindMemberWithRoleAsync(studentId, InternshipMemberRole.Student, ct);
        if (student is null)
        {
            return Fail<IReadOnlyList<InternshipMemberDto>>(StudentRequired, ServiceErrorType.Forbidden);
        }

        var members = await Directory.GetMembersAsync(ct);
        return ServiceResult<IReadOnlyList<InternshipMemberDto>>.Success(members
            .Where(member => IsTeammate(student, member))
            .OrderBy(member => member.FullName)
            .ToList());
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> AddCollaboratorExecution(
        Guid contributionId,
        AddContributionCollaboratorRequest request,
        Guid studentId,
        CancellationToken ct)
    {
        var roleError = ValidateCollaboratorRole(request.Area, request.RoleDescription);
        if (roleError is not null)
        {
            return Failure(roleError, ServiceErrorType.Validation);
        }

        var contribution = await FindOwnedContributionAsync(contributionId, studentId, ct);
        if (contribution is null)
        {
            return Failure("Contribution not found.", ServiceErrorType.NotFound);
        }

        if (!IsEditable(contribution.Status))
        {
            return Failure(
                "Collaborators can only be added while the contribution is editable.",
                ServiceErrorType.Conflict);
        }

        var members = await LoadMembersAsync(ct);
        var student = MemberOrUnknown(members, studentId);
        if (!members.TryGetValue(request.UserId, out var member) || !IsTeammate(student, member))
        {
            return Failure(
                "Collaborators must be students of your internship team.",
                ServiceErrorType.Validation);
        }

        if (contribution.Collaborators.Any(item => item.UserId == member.UserId))
        {
            return Failure($"{member.FullName} is already a collaborator.", ServiceErrorType.Conflict);
        }

        if (contribution.Collaborators.Count >= MaximumCollaborators)
        {
            return Failure(
                $"A contribution can have at most {MaximumCollaborators} collaborators.",
                ServiceErrorType.Validation);
        }

        var now = DateTimeOffset.UtcNow;
        var collaborator = new ContributionCollaborator
        {
            Id = Guid.NewGuid(),
            UserId = member.UserId,
            Name = member.FullName,
            Email = member.Email,
            Area = request.Area,
            RoleDescription = request.RoleDescription.Trim(),
            Status = ContributionCollaboratorStatus.PendingConfirmation,
            AddedAtUtc = now,
            UpdatedAtUtc = now
        };
        contribution.Collaborators.Add(collaborator);
        Context.ContributionCollaborators.Add(collaborator);
        contribution.UpdatedAtUtc = now;

        await Context.SaveChangesAsync(ct);
        return Success(MapDetails(contribution, members));
    }

    // Changing what a collaborator did always asks them to confirm again.
    // Answering a dispute is allowed even while the contribution is in review.
    internal async Task<ServiceResult<ContributionDetailsDto>> UpdateCollaboratorExecution(
        Guid contributionId,
        Guid collaboratorId,
        UpdateContributionCollaboratorRequest request,
        Guid studentId,
        CancellationToken ct)
    {
        var roleError = ValidateCollaboratorRole(request.Area, request.RoleDescription);
        if (roleError is not null)
        {
            return Failure(roleError, ServiceErrorType.Validation);
        }

        var contribution = await FindOwnedContributionAsync(contributionId, studentId, ct);
        var collaborator = contribution?.Collaborators.FirstOrDefault(item => item.Id == collaboratorId);
        if (contribution is null || collaborator is null)
        {
            return Failure("Collaborator not found.", ServiceErrorType.NotFound);
        }

        var isDisputed = collaborator.Status == ContributionCollaboratorStatus.Disputed;
        if (!IsEditable(contribution.Status) && !(isDisputed && !IsClosed(contribution.Status)))
        {
            return Failure(
                "Collaborators can only be changed while the contribution is editable or to answer a dispute.",
                ServiceErrorType.Conflict);
        }

        var resolutionNote = TrimOrNull(request.ResolutionNote);
        if (isDisputed && (resolutionNote?.Length ?? 0) < MinimumAttributionNoteLength)
        {
            return Failure(
                $"Explain to {collaborator.Name} how you addressed the dispute (at least {MinimumAttributionNoteLength} characters).",
                ServiceErrorType.Validation);
        }

        var roleDescription = request.RoleDescription.Trim();
        if (!isDisputed &&
            collaborator.Area == request.Area &&
            collaborator.RoleDescription == roleDescription)
        {
            return await DetailsAsync(contribution, ct);
        }

        var now = DateTimeOffset.UtcNow;
        if (isDisputed && IsEditable(contribution.Status))
        {
            // The teammate reviews a new contribution version after their dispute.
            EnsureEditableRevision(contribution, now, forceNew: true);
        }

        collaborator.Area = request.Area;
        collaborator.RoleDescription = roleDescription;
        collaborator.Status = ContributionCollaboratorStatus.PendingConfirmation;
        collaborator.ConfirmedAtUtc = null;
        collaborator.UpdatedAtUtc = now;
        if (isDisputed)
        {
            collaborator.ResolutionNote = resolutionNote;
            collaborator.ResolvedAtUtc = now;
        }
        else
        {
            collaborator.ResolutionNote = null;
        }

        contribution.UpdatedAtUtc = now;
        await Context.SaveChangesAsync(ct);
        return await DetailsAsync(contribution, ct);
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> RemoveCollaboratorExecution(
        Guid contributionId,
        Guid collaboratorId,
        Guid studentId,
        CancellationToken ct)
    {
        var contribution = await FindOwnedContributionAsync(contributionId, studentId, ct);
        var collaborator = contribution?.Collaborators.FirstOrDefault(item => item.Id == collaboratorId);
        if (contribution is null || collaborator is null)
        {
            return Failure("Collaborator not found.", ServiceErrorType.NotFound);
        }

        var isDisputed = collaborator.Status == ContributionCollaboratorStatus.Disputed;
        if (!IsEditable(contribution.Status) && !(isDisputed && !IsClosed(contribution.Status)))
        {
            return Failure(
                "Collaborators can only be removed while the contribution is editable or when they dispute it.",
                ServiceErrorType.Conflict);
        }

        contribution.Collaborators.Remove(collaborator);
        Context.ContributionCollaborators.Remove(collaborator);
        contribution.UpdatedAtUtc = DateTimeOffset.UtcNow;

        await Context.SaveChangesAsync(ct);
        return await DetailsAsync(contribution, ct);
    }

    private static bool IsTeammate(InternshipMemberDto student, InternshipMemberDto member) =>
        member.Role == InternshipMemberRole.Student &&
        member.UserId != student.UserId &&
        member.MentorId is not null &&
        member.MentorId == student.MentorId;

    private static string? ValidateCollaboratorRole(ContributionCategory area, string roleDescription)
    {
        if (!Enum.IsDefined(area))
        {
            return "Choose the collaborator's area of work.";
        }

        var length = roleDescription.Trim().Length;
        return length < MinimumRoleDescriptionLength || length > MaximumRoleDescriptionLength
            ? $"Describe what the collaborator did ({MinimumRoleDescriptionLength} to {MaximumRoleDescriptionLength} characters)."
            : null;
    }
}
