using InternshipPlatform.Domain.Models;

namespace InternshipPlatform.BusinessLayer.Interfaces;

public sealed record EvidenceFileContent(Stream Content, string ContentType, string FileName);

public interface IContributionAction
{
    // ---- Student: contributions -------------------------------------------
    Task<ServiceResult<IReadOnlyList<ContributionListItemDto>>> GetStudentContributionsAsync(
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> GetStudentContributionAsync(
        Guid contributionId,
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> CreateDraftAsync(
        SaveContributionDraftRequest request,
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> UpdateDraftAsync(
        Guid contributionId,
        SaveContributionDraftRequest request,
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<bool>> DeleteDraftAsync(
        Guid contributionId,
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> SubmitAsync(
        Guid contributionId,
        SubmitContributionRequest request,
        Guid studentId,
        CancellationToken ct = default);

    // ---- Student: evidence ------------------------------------------------
    Task<ServiceResult<ContributionDetailsDto>> AddLinkEvidenceAsync(
        Guid contributionId,
        AddContributionLinkRequest request,
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> AddFileEvidenceAsync(
        Guid contributionId,
        Guid studentId,
        string caption,
        string originalFileName,
        long fileSizeBytes,
        Stream content,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> AddGitHubEvidenceAsync(
        Guid contributionId,
        AddGitHubEvidenceRequest request,
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> RemoveEvidenceAsync(
        Guid contributionId,
        Guid evidenceId,
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<EvidenceFileContent>> OpenEvidenceFileAsync(
        Guid evidenceId,
        Guid actorId,
        CancellationToken ct = default);

    Task<ServiceResult<IReadOnlyList<GitHubLiveStatusDto>>> GetLiveGitHubStatusAsync(
        Guid contributionId,
        Guid actorId,
        CancellationToken ct = default);

    // ---- Student: GitHub picker -------------------------------------------
    Task<ServiceResult<IReadOnlyList<GitHubRepositoryOptionDto>>> GetGitHubRepositoriesAsync(
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<IReadOnlyList<GitHubCommitOptionDto>>> GetGitHubCommitsAsync(
        Guid studentId,
        string repository,
        string branch,
        CancellationToken ct = default);

    Task<ServiceResult<IReadOnlyList<GitHubPullRequestOptionDto>>> GetGitHubPullRequestsAsync(
        Guid studentId,
        string repository,
        CancellationToken ct = default);

    // ---- Student: collaborators -------------------------------------------
    Task<ServiceResult<IReadOnlyList<InternshipMemberDto>>> GetTeamMembersAsync(
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> AddCollaboratorAsync(
        Guid contributionId,
        AddContributionCollaboratorRequest request,
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> UpdateCollaboratorAsync(
        Guid contributionId,
        Guid collaboratorId,
        UpdateContributionCollaboratorRequest request,
        Guid studentId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> RemoveCollaboratorAsync(
        Guid contributionId,
        Guid collaboratorId,
        Guid studentId,
        CancellationToken ct = default);

    // ---- Collaborator -----------------------------------------------------
    Task<ServiceResult<IReadOnlyList<ContributionListItemDto>>> GetAttributedContributionsAsync(
        Guid userId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> GetAttributedContributionAsync(
        Guid contributionId,
        Guid userId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> ConfirmParticipationAsync(
        Guid contributionId,
        Guid userId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> DisputeParticipationAsync(
        Guid contributionId,
        Guid userId,
        DisputeContributionParticipationRequest request,
        CancellationToken ct = default);

    // ---- Mentor -----------------------------------------------------------
    Task<ServiceResult<IReadOnlyList<ContributionListItemDto>>> GetMentorContributionsAsync(
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> GetMentorContributionAsync(
        Guid contributionId,
        Guid mentorId,
        CancellationToken ct = default);

    Task<ServiceResult<ContributionDetailsDto>> ReviewAsync(
        Guid contributionId,
        ReviewContributionRequest request,
        Guid mentorId,
        CancellationToken ct = default);
}
