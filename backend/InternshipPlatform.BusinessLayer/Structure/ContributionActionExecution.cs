using InternshipPlatform.BusinessLayer.Core;
using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain.Models;

namespace InternshipPlatform.BusinessLayer.Structure;

public sealed class ContributionActionExecution : ContributionActions, IContributionAction
{
    public ContributionActionExecution(
        AppDbContext context,
        IContributionFileStorageAction fileStorage,
        IInternshipDirectoryAction directory,
        IGitHubAction gitHub)
        : base(context, fileStorage, directory, gitHub)
    {
    }

    // ---- Student: contributions -------------------------------------------
    public Task<ServiceResult<IReadOnlyList<ContributionListItemDto>>> GetStudentContributionsAsync(
        Guid studentId,
        CancellationToken ct = default) =>
        GetStudentContributionsExecution(studentId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> GetStudentContributionAsync(
        Guid contributionId,
        Guid studentId,
        CancellationToken ct = default) =>
        GetStudentContributionExecution(contributionId, studentId, ct);

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

    public Task<ServiceResult<bool>> DeleteDraftAsync(
        Guid contributionId,
        Guid studentId,
        CancellationToken ct = default) =>
        DeleteDraftExecution(contributionId, studentId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> SubmitAsync(
        Guid contributionId,
        SubmitContributionRequest request,
        Guid studentId,
        CancellationToken ct = default) =>
        SubmitExecution(contributionId, request, studentId, ct);

    // ---- Student: evidence ------------------------------------------------
    public Task<ServiceResult<ContributionDetailsDto>> AddLinkEvidenceAsync(
        Guid contributionId,
        AddContributionLinkRequest request,
        Guid studentId,
        CancellationToken ct = default) =>
        AddLinkEvidenceExecution(contributionId, request, studentId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> AddFileEvidenceAsync(
        Guid contributionId,
        Guid studentId,
        string caption,
        string originalFileName,
        long fileSizeBytes,
        Stream content,
        CancellationToken ct = default) =>
        AddFileEvidenceExecution(
            contributionId,
            studentId,
            caption,
            originalFileName,
            fileSizeBytes,
            content,
            ct);

    public Task<ServiceResult<ContributionDetailsDto>> AddGitHubEvidenceAsync(
        Guid contributionId,
        AddGitHubEvidenceRequest request,
        Guid studentId,
        CancellationToken ct = default) =>
        AddGitHubEvidenceExecution(contributionId, request, studentId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> RemoveEvidenceAsync(
        Guid contributionId,
        Guid evidenceId,
        Guid studentId,
        CancellationToken ct = default) =>
        RemoveEvidenceExecution(contributionId, evidenceId, studentId, ct);

    public Task<ServiceResult<EvidenceFileContent>> OpenEvidenceFileAsync(
        Guid evidenceId,
        Guid actorId,
        CancellationToken ct = default) =>
        OpenEvidenceFileExecution(evidenceId, actorId, ct);

    public Task<ServiceResult<IReadOnlyList<GitHubLiveStatusDto>>> GetLiveGitHubStatusAsync(
        Guid contributionId,
        Guid actorId,
        CancellationToken ct = default) =>
        GetLiveGitHubStatusExecution(contributionId, actorId, ct);

    // ---- Student: GitHub picker -------------------------------------------
    public Task<ServiceResult<IReadOnlyList<GitHubRepositoryOptionDto>>> GetGitHubRepositoriesAsync(
        Guid studentId,
        CancellationToken ct = default) =>
        GetGitHubRepositoriesExecution(studentId, ct);

    public Task<ServiceResult<IReadOnlyList<GitHubCommitOptionDto>>> GetGitHubCommitsAsync(
        Guid studentId,
        string repository,
        string branch,
        CancellationToken ct = default) =>
        GetGitHubCommitsExecution(studentId, repository, branch, ct);

    public Task<ServiceResult<IReadOnlyList<GitHubPullRequestOptionDto>>> GetGitHubPullRequestsAsync(
        Guid studentId,
        string repository,
        CancellationToken ct = default) =>
        GetGitHubPullRequestsExecution(studentId, repository, ct);

    // ---- Student: collaborators -------------------------------------------
    public Task<ServiceResult<IReadOnlyList<InternshipMemberDto>>> GetTeamMembersAsync(
        Guid studentId,
        CancellationToken ct = default) =>
        GetTeamMembersExecution(studentId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> AddCollaboratorAsync(
        Guid contributionId,
        AddContributionCollaboratorRequest request,
        Guid studentId,
        CancellationToken ct = default) =>
        AddCollaboratorExecution(contributionId, request, studentId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> UpdateCollaboratorAsync(
        Guid contributionId,
        Guid collaboratorId,
        UpdateContributionCollaboratorRequest request,
        Guid studentId,
        CancellationToken ct = default) =>
        UpdateCollaboratorExecution(contributionId, collaboratorId, request, studentId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> RemoveCollaboratorAsync(
        Guid contributionId,
        Guid collaboratorId,
        Guid studentId,
        CancellationToken ct = default) =>
        RemoveCollaboratorExecution(contributionId, collaboratorId, studentId, ct);

    // ---- Collaborator -----------------------------------------------------
    public Task<ServiceResult<IReadOnlyList<ContributionListItemDto>>> GetAttributedContributionsAsync(
        Guid userId,
        CancellationToken ct = default) =>
        GetAttributedContributionsExecution(userId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> GetAttributedContributionAsync(
        Guid contributionId,
        Guid userId,
        CancellationToken ct = default) =>
        GetAttributedContributionExecution(contributionId, userId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> ConfirmParticipationAsync(
        Guid contributionId,
        Guid userId,
        CancellationToken ct = default) =>
        ConfirmParticipationExecution(contributionId, userId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> DisputeParticipationAsync(
        Guid contributionId,
        Guid userId,
        DisputeContributionParticipationRequest request,
        CancellationToken ct = default) =>
        DisputeParticipationExecution(contributionId, userId, request, ct);

    // ---- Mentor -----------------------------------------------------------
    public Task<ServiceResult<IReadOnlyList<ContributionListItemDto>>> GetMentorContributionsAsync(
        Guid mentorId,
        CancellationToken ct = default) =>
        GetMentorContributionsExecution(mentorId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> GetMentorContributionAsync(
        Guid contributionId,
        Guid mentorId,
        CancellationToken ct = default) =>
        GetMentorContributionExecution(contributionId, mentorId, ct);

    public Task<ServiceResult<ContributionDetailsDto>> ReviewAsync(
        Guid contributionId,
        ReviewContributionRequest request,
        Guid mentorId,
        CancellationToken ct = default) =>
        ReviewExecution(contributionId, request, mentorId, ct);
}
