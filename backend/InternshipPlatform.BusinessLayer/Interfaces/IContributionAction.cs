using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;

namespace InternshipPlatform.BusinessLayer.Interfaces;

public interface IContributionAction
{
    Task<ServiceResult<ContributionDetailsDto>> CreateDraftAsync(
        SaveContributionDraftRequest request,
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> UpdateDraftAsync(
        Guid contributionId,
        SaveContributionDraftRequest request,
        Guid studentId,
        CancellationToken ct = default);

    Task<IReadOnlyList<ContributionListItemDto>> GetStudentContributionsAsync(
        Guid studentId,
        string? search,
        ContributionStatus? status,
        ContributionCategory? category,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> GetStudentContributionAsync(
        Guid contributionId,
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> AddLinkEvidenceAsync(
        Guid contributionId,
        AddContributionLinkRequest request,
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> AddFileEvidenceAsync(
        Guid contributionId,
        Guid studentId,
        string evidenceName,
        string originalFileName,
        string contentType,
        long fileSizeBytes,
        Stream content,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> RemoveEvidenceAsync(
        Guid contributionId,
        Guid evidenceId,
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> SubmitAsync(
        Guid contributionId,
        SubmitContributionRequest request,
        Guid studentId,
        CancellationToken ct = default);

    Task<IReadOnlyList<ContributionListItemDto>> GetReviewQueueAsync(
        string? search,
        ContributionCategory? category,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> GetMentorContributionAsync(
        Guid contributionId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> RequestChangesAsync(
        Guid contributionId,
        RequestContributionChangesRequest request,
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> ValidateAsync(
        Guid contributionId,
        ValidateContributionRequest request,
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> RejectAsync(
        Guid contributionId,
        RejectContributionRequest request,
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> AddCollaboratorAsync(
        Guid contributionId,
        AddContributionCollaboratorRequest request,
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> UpdateCollaboratorRoleAsync(
        Guid contributionId,
        Guid collaboratorId,
        UpdateContributionCollaboratorRoleRequest request,
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> ConfirmParticipationAsync(
        Guid contributionId,
        Guid collaboratorId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> DisputeParticipationAsync(
        Guid contributionId,
        Guid collaboratorId,
        DisputeContributionParticipationRequest request,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> ResolveAttributionAsync(
        Guid contributionId,
        Guid collaboratorId,
        ResolveContributionAttributionRequest request,
        Guid studentId,
        CancellationToken ct = default);
}
