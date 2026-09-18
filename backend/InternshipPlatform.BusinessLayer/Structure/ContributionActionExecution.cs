using InternshipPlatform.BusinessLayer.Core;
using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;

namespace InternshipPlatform.BusinessLayer.Structure;

public sealed class ContributionActionExecution : ContributionActions, IContributionAction
{
    public ContributionActionExecution(
        AppDbContext context,
        IContributionFileStorageAction fileStorage)
        : base(context, fileStorage)
    {
    }

    public Task<ServiceResult<ContributionDetailsDto>> CreateDraftAsync(
        SaveContributionDraftRequest request,
        Guid studentId,
        CancellationToken ct = default) =>
        CreateDraftExecution(request, studentId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> UpdateDraftAsync(
        Guid contributionId,
        SaveContributionDraftRequest request,
        Guid studentId,
        CancellationToken ct = default) =>
        UpdateDraftExecution(contributionId, request, studentId, ct);

    public Task<IReadOnlyList<ContributionListItemDto>> GetStudentContributionsAsync(
        Guid studentId,
        string? search,
        ContributionStatus? status,
        ContributionCategory? category,
        CancellationToken ct = default) =>
        GetStudentContributionsExecution(studentId, search, status, category, ct);

    public Task<ServiceResult<ContributionDetailsDto>> GetStudentContributionAsync(
        Guid contributionId,
        Guid studentId,
        CancellationToken ct = default) =>
        GetStudentContributionExecution(contributionId, studentId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> AddLinkEvidenceAsync(
        Guid contributionId,
        AddContributionLinkRequest request,
        Guid studentId,
        CancellationToken ct = default) =>
        AddLinkEvidenceExecution(contributionId, request, studentId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> AddFileEvidenceAsync(
        Guid contributionId,
        Guid studentId,
        string evidenceName,
        string originalFileName,
        string contentType,
        long fileSizeBytes,
        Stream content,
        CancellationToken ct = default) =>
        AddFileEvidenceExecution(
            contributionId,
            studentId,
            evidenceName,
            originalFileName,
            contentType,
            fileSizeBytes,
            content,
            ct);

    public Task<ServiceResult<ContributionDetailsDto>> RemoveEvidenceAsync(
        Guid contributionId,
        Guid evidenceId,
        Guid studentId,
        CancellationToken ct = default) =>
        RemoveEvidenceExecution(contributionId, evidenceId, studentId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> SubmitAsync(
        Guid contributionId,
        SubmitContributionRequest request,
        Guid studentId,
        CancellationToken ct = default) =>
        SubmitExecution(contributionId, request, studentId, ct);

    public Task<IReadOnlyList<ContributionListItemDto>> GetReviewQueueAsync(
        string? search,
        ContributionCategory? category,
        CancellationToken ct = default) =>
        GetReviewQueueExecution(search, category, ct);

    public Task<ServiceResult<ContributionDetailsDto>> GetMentorContributionAsync(
        Guid contributionId,
        CancellationToken ct = default) =>
        GetMentorContributionExecution(contributionId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> RequestChangesAsync(
        Guid contributionId,
        RequestContributionChangesRequest request,
        Guid mentorId,
        CancellationToken ct = default) =>
        RequestChangesExecution(contributionId, request, mentorId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> ValidateAsync(
        Guid contributionId,
        ValidateContributionRequest request,
        Guid mentorId,
        CancellationToken ct = default) =>
        ValidateExecution(contributionId, request, mentorId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> RejectAsync(
        Guid contributionId,
        RejectContributionRequest request,
        Guid mentorId,
        CancellationToken ct = default) =>
        RejectExecution(contributionId, request, mentorId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> AddCollaboratorAsync(
        Guid contributionId,
        AddContributionCollaboratorRequest request,
        Guid studentId,
        CancellationToken ct = default) =>
        AddCollaboratorExecution(contributionId, request, studentId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> UpdateCollaboratorRoleAsync(
        Guid contributionId,
        Guid collaboratorId,
        UpdateContributionCollaboratorRoleRequest request,
        Guid studentId,
        CancellationToken ct = default) =>
        UpdateCollaboratorRoleExecution(
            contributionId,
            collaboratorId,
            request,
            studentId,
            ct);

    public Task<ServiceResult<ContributionDetailsDto>> ConfirmParticipationAsync(
        Guid contributionId,
        Guid collaboratorId,
        CancellationToken ct = default) =>
        ConfirmParticipationExecution(contributionId, collaboratorId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> DisputeParticipationAsync(
        Guid contributionId,
        Guid collaboratorId,
        DisputeContributionParticipationRequest request,
        CancellationToken ct = default) =>
        DisputeParticipationExecution(contributionId, collaboratorId, request, ct);

    public Task<ServiceResult<ContributionDetailsDto>> ResolveAttributionAsync(
        Guid contributionId,
        Guid collaboratorId,
        ResolveContributionAttributionRequest request,
        Guid studentId,
        CancellationToken ct = default) =>
        ResolveAttributionExecution(
            contributionId,
            collaboratorId,
            request,
            studentId,
            ct);
}
