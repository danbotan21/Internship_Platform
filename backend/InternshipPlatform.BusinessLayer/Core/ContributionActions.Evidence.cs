using System.Text.Json;
using System.Text.RegularExpressions;
using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Core;

public partial class ContributionActions
{
    private const long MaximumImageBytes = 3 * 1024 * 1024;
    private const long MaximumDocumentBytes = 5 * 1024 * 1024;
    private const int MaximumEvidencePerRevision = 20;
    private const int MinimumCaptionLength = 10;

    private enum GitHubUrlKind
    {
        Commit,
        PullRequest,
        Issue
    }

    private sealed record GitHubUrlReference(string Repository, GitHubUrlKind Kind, string Reference);

    // Snapshot details stored as jsonb on GitHub evidence.
    private sealed record GitHubDetails(
        IReadOnlyList<GitHubFileDto> Files,
        IReadOnlyList<GitHubCommitDto> Commits,
        IReadOnlyList<string> CoAuthorEmails,
        DateTimeOffset? MergedAtUtc);

    private static readonly JsonSerializerOptions DetailsJsonOptions = new(JsonSerializerDefaults.Web);

    // ---- Links ------------------------------------------------------------------
    internal async Task<ServiceResult<ContributionDetailsDto>> AddLinkEvidenceExecution(
        Guid contributionId,
        AddContributionLinkRequest request,
        Guid studentId,
        CancellationToken ct)
    {
        var name = request.Name.Trim();
        var url = request.Url.Trim();
        var caption = request.Caption.Trim();
        if (name.Length < 3)
        {
            return Failure("Give the link a name of at least 3 characters.", ServiceErrorType.Validation);
        }

        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            return Failure("The link must be a valid HTTP or HTTPS URL.", ServiceErrorType.Validation);
        }

        if (ParseGitHubUrl(url) is { Kind: GitHubUrlKind.Commit or GitHubUrlKind.PullRequest })
        {
            return Failure(
                "Commits and pull requests must be added with \"Add from GitHub\" so they can be verified.",
                ServiceErrorType.Validation);
        }

        if (caption.Length < MinimumCaptionLength)
        {
            return Failure(
                "Explain what the link proves (at least 10 characters).",
                ServiceErrorType.Validation);
        }

        var (contribution, error) = await LoadEditableForEvidenceAsync(contributionId, studentId, ct);
        if (error is not null)
        {
            return error;
        }

        var now = DateTimeOffset.UtcNow;
        var (revision, _) = EnsureEditableRevision(contribution!, now);
        if (revision.Evidence.Any(item => item.Type == EvidenceType.Link &&
                string.Equals(item.ExternalUrl, url, StringComparison.OrdinalIgnoreCase)))
        {
            return Failure("This link is already attached.", ServiceErrorType.Conflict);
        }

        AddEvidence(contribution!, revision, new ContributionEvidence
        {
            Id = Guid.NewGuid(),
            Type = EvidenceType.Link,
            Name = name,
            Caption = caption,
            ExternalUrl = url,
            CreatedAtUtc = now
        }, now);

        await Context.SaveChangesAsync(ct);
        return await DetailsAsync(contribution!, ct);
    }

    // ---- Files ------------------------------------------------------------------
    internal async Task<ServiceResult<ContributionDetailsDto>> AddFileEvidenceExecution(
        Guid contributionId,
        Guid studentId,
        string caption,
        string originalFileName,
        long fileSizeBytes,
        Stream content,
        CancellationToken ct)
    {
        caption = caption.Trim();
        if (caption.Length < MinimumCaptionLength || caption.Length > 500)
        {
            return Failure(
                "Explain what the file shows (10 to 500 characters).",
                ServiceErrorType.Validation);
        }

        if (fileSizeBytes <= 0 || fileSizeBytes > MaximumDocumentBytes)
        {
            return Failure("The file must be smaller than 5 MB.", ServiceErrorType.Validation);
        }

        var (contribution, error) = await LoadEditableForEvidenceAsync(contributionId, studentId, ct);
        if (error is not null)
        {
            return error;
        }

        using var buffer = new MemoryStream();
        await content.CopyToAsync(buffer, ct);
        var fileType = DetectFileType(buffer.GetBuffer().AsSpan(0, (int)buffer.Length));
        if (fileType is null)
        {
            return Failure(
                "Only screenshots (PNG, JPEG, WebP, GIF) and PDF documents are accepted.",
                ServiceErrorType.Validation);
        }

        var (type, contentType, extension) = fileType.Value;
        if (type == EvidenceType.Image && buffer.Length > MaximumImageBytes)
        {
            return Failure("Screenshots must be smaller than 3 MB.", ServiceErrorType.Validation);
        }

        buffer.Position = 0;
        StoredContributionFile storedFile;
        try
        {
            storedFile = await FileStorage.SaveAsync(buffer, extension, ct);
        }
        catch (IOException)
        {
            return Failure("The file could not be stored.", ServiceErrorType.Unexpected);
        }

        var now = DateTimeOffset.UtcNow;
        var (revision, _) = EnsureEditableRevision(contribution!, now);
        var fileName = Path.GetFileName(originalFileName);
        AddEvidence(contribution!, revision, new ContributionEvidence
        {
            Id = Guid.NewGuid(),
            Type = type,
            Name = Truncate(string.IsNullOrWhiteSpace(fileName) ? $"Evidence{extension}" : fileName, 200),
            Caption = caption,
            StoragePath = storedFile.StoragePath,
            OriginalFileName = Truncate(string.IsNullOrWhiteSpace(fileName) ? $"evidence{extension}" : fileName, 255),
            ContentType = contentType,
            FileSizeBytes = buffer.Length,
            CreatedAtUtc = now
        }, now);

        try
        {
            await Context.SaveChangesAsync(ct);
        }
        catch
        {
            await FileStorage.DeleteAsync(storedFile.StoragePath, CancellationToken.None);
            throw;
        }

        return await DetailsAsync(contribution!, ct);
    }

    // ---- GitHub -----------------------------------------------------------------
    internal async Task<ServiceResult<ContributionDetailsDto>> AddGitHubEvidenceExecution(
        Guid contributionId,
        AddGitHubEvidenceRequest request,
        Guid studentId,
        CancellationToken ct)
    {
        var reference = ParseGitHubUrl(request.Url);
        if (reference is not { Kind: GitHubUrlKind.Commit or GitHubUrlKind.PullRequest })
        {
            return Failure(
                "Use the URL of a GitHub commit or pull request, e.g. https://github.com/owner/repo/commit/abc1234.",
                ServiceErrorType.Validation);
        }

        var repository = FindAllowedRepository(reference.Repository);
        if (repository is null)
        {
            return Failure(NotTeamRepositoryMessage(reference.Repository), ServiceErrorType.Validation);
        }

        var (contribution, error) = await LoadEditableForEvidenceAsync(contributionId, studentId, ct);
        if (error is not null)
        {
            return error;
        }

        var type = reference.Kind == GitHubUrlKind.Commit
            ? EvidenceType.GitHubCommit
            : EvidenceType.GitHubPullRequest;
        ContributionEvidence evidence;
        try
        {
            evidence = type == EvidenceType.GitHubCommit
                ? await CreateCommitEvidenceAsync(repository, reference.Reference, ct)
                : await CreatePullRequestEvidenceAsync(repository, int.Parse(reference.Reference), ct);
        }
        catch (GitHubUnavailableException ex)
        {
            return Failure(ex.Message, ServiceErrorType.ExternalService);
        }

        var now = DateTimeOffset.UtcNow;
        var (revision, _) = EnsureEditableRevision(contribution!, now);
        if (revision.Evidence.Any(item => item.Type == type &&
                item.GitHubRepository == evidence.GitHubRepository &&
                item.GitHubReference == evidence.GitHubReference))
        {
            return Failure("This GitHub item is already attached.", ServiceErrorType.Conflict);
        }

        evidence.CreatedAtUtc = now;
        AddEvidence(contribution!, revision, evidence, now);
        await Context.SaveChangesAsync(ct);
        return await DetailsAsync(contribution!, ct);
    }

    private async Task<ContributionEvidence> CreateCommitEvidenceAsync(
        string repository,
        string sha,
        CancellationToken ct)
    {
        var commit = await GitHub.GetCommitAsync(repository, sha, ct);
        var title = commit.Message.Split('\n', 2)[0].Trim();
        return new ContributionEvidence
        {
            Id = Guid.NewGuid(),
            Type = EvidenceType.GitHubCommit,
            Name = Truncate(string.IsNullOrWhiteSpace(title) ? commit.Sha[..7] : title, 200),
            ExternalUrl = commit.HtmlUrl,
            GitHubRepository = repository,
            GitHubReference = commit.Sha,
            GitHubAuthorLogin = commit.AuthorLogin,
            GitHubAuthoredAtUtc = commit.AuthoredAtUtc,
            GitHubAdditions = commit.Additions,
            GitHubDeletions = commit.Deletions,
            GitHubChangedFiles = commit.Files.Count,
            GitHubChecksConclusion = commit.ChecksConclusion,
            GitHubDetailsJson = JsonSerializer.Serialize(
                new GitHubDetails(commit.Files, [], commit.CoAuthorEmails, null),
                DetailsJsonOptions)
        };
    }

    private async Task<ContributionEvidence> CreatePullRequestEvidenceAsync(
        string repository,
        int number,
        CancellationToken ct)
    {
        var pullRequest = await GitHub.GetPullRequestAsync(repository, number, ct);
        return new ContributionEvidence
        {
            Id = Guid.NewGuid(),
            Type = EvidenceType.GitHubPullRequest,
            Name = Truncate($"#{pullRequest.Number} {pullRequest.Title}", 200),
            ExternalUrl = pullRequest.HtmlUrl,
            GitHubRepository = repository,
            GitHubReference = pullRequest.Number.ToString(),
            GitHubAuthorLogin = pullRequest.AuthorLogin,
            GitHubAuthoredAtUtc = pullRequest.CreatedAtUtc,
            GitHubAdditions = pullRequest.Additions,
            GitHubDeletions = pullRequest.Deletions,
            GitHubChangedFiles = pullRequest.ChangedFiles,
            GitHubState = pullRequest.State,
            GitHubChecksConclusion = pullRequest.ChecksConclusion,
            GitHubDetailsJson = JsonSerializer.Serialize(
                new GitHubDetails(pullRequest.Files, pullRequest.Commits, [], pullRequest.MergedAtUtc),
                DetailsJsonOptions)
        };
    }

    internal async Task<ServiceResult<IReadOnlyList<GitHubRepositoryOptionDto>>> GetGitHubRepositoriesExecution(
        Guid studentId,
        CancellationToken ct)
    {
        if (await FindMemberWithRoleAsync(studentId, InternshipMemberRole.Student, ct) is null)
        {
            return Fail<IReadOnlyList<GitHubRepositoryOptionDto>>(StudentRequired, ServiceErrorType.Forbidden);
        }

        try
        {
            var repositories = new List<GitHubRepositoryOptionDto>();
            foreach (var repository in GitHub.AllowedRepositories)
            {
                repositories.Add(await GitHub.GetRepositoryAsync(repository, ct));
            }

            return ServiceResult<IReadOnlyList<GitHubRepositoryOptionDto>>.Success(repositories);
        }
        catch (GitHubUnavailableException ex)
        {
            return Fail<IReadOnlyList<GitHubRepositoryOptionDto>>(ex.Message, ServiceErrorType.ExternalService);
        }
    }

    internal async Task<ServiceResult<IReadOnlyList<GitHubCommitOptionDto>>> GetGitHubCommitsExecution(
        Guid studentId,
        string repository,
        string branch,
        CancellationToken ct)
    {
        var (login, allowedRepository, error) = await ResolveGitHubPickerAsync(studentId, repository, ct);
        if (error is not null)
        {
            return Fail<IReadOnlyList<GitHubCommitOptionDto>>(error.Value.Message, error.Value.Type);
        }

        if (string.IsNullOrWhiteSpace(branch))
        {
            return Fail<IReadOnlyList<GitHubCommitOptionDto>>("Choose a branch.", ServiceErrorType.Validation);
        }

        try
        {
            var commits = await GitHub.GetCommitsByAuthorAsync(allowedRepository!, branch.Trim(), login!, ct);
            return ServiceResult<IReadOnlyList<GitHubCommitOptionDto>>.Success(commits);
        }
        catch (GitHubUnavailableException ex)
        {
            return Fail<IReadOnlyList<GitHubCommitOptionDto>>(ex.Message, ServiceErrorType.ExternalService);
        }
    }

    internal async Task<ServiceResult<IReadOnlyList<GitHubPullRequestOptionDto>>> GetGitHubPullRequestsExecution(
        Guid studentId,
        string repository,
        CancellationToken ct)
    {
        var (login, allowedRepository, error) = await ResolveGitHubPickerAsync(studentId, repository, ct);
        if (error is not null)
        {
            return Fail<IReadOnlyList<GitHubPullRequestOptionDto>>(error.Value.Message, error.Value.Type);
        }

        try
        {
            var pullRequests = await GitHub.GetPullRequestsByAuthorAsync(allowedRepository!, login!, ct);
            return ServiceResult<IReadOnlyList<GitHubPullRequestOptionDto>>.Success(pullRequests);
        }
        catch (GitHubUnavailableException ex)
        {
            return Fail<IReadOnlyList<GitHubPullRequestOptionDto>>(ex.Message, ServiceErrorType.ExternalService);
        }
    }

    private async Task<(string? Login, string? Repository, (string Message, ServiceErrorType Type)? Error)>
        ResolveGitHubPickerAsync(Guid studentId, string repository, CancellationToken ct)
    {
        var student = await FindMemberWithRoleAsync(studentId, InternshipMemberRole.Student, ct);
        if (student is null)
        {
            return (null, null, (StudentRequired, ServiceErrorType.Forbidden));
        }

        if (string.IsNullOrWhiteSpace(student.GitHubUsername))
        {
            return (null, null, (
                "Your profile has no GitHub account linked, so commits cannot be attributed to you.",
                ServiceErrorType.Validation));
        }

        var allowedRepository = FindAllowedRepository(repository);
        return allowedRepository is null
            ? (null, null, (NotTeamRepositoryMessage(repository), ServiceErrorType.Validation))
            : (student.GitHubUsername, allowedRepository, null);
    }

    internal async Task<ServiceResult<IReadOnlyList<GitHubLiveStatusDto>>> GetLiveGitHubStatusExecution(
        Guid contributionId,
        Guid actorId,
        CancellationToken ct)
    {
        var contribution = await ContributionGraph(tracking: false)
            .FirstOrDefaultAsync(item => item.Id == contributionId, ct);
        var members = await LoadMembersAsync(ct);
        if (contribution is null || !CanView(contribution, actorId, members))
        {
            return Fail<IReadOnlyList<GitHubLiveStatusDto>>("Contribution not found.", ServiceErrorType.NotFound);
        }

        var statuses = new List<GitHubLiveStatusDto>();
        foreach (var evidence in GetCurrentRevision(contribution).Evidence
                     .Where(item => item.GitHubRepository != null && item.GitHubReference != null))
        {
            var status = new GitHubLiveStatusDto
            {
                EvidenceId = evidence.Id,
                CheckedAtUtc = DateTimeOffset.UtcNow
            };
            try
            {
                if (evidence.Type == EvidenceType.GitHubPullRequest)
                {
                    var pullRequest = await GitHub.GetPullRequestAsync(
                        evidence.GitHubRepository!,
                        int.Parse(evidence.GitHubReference!),
                        ct);
                    status.State = pullRequest.State;
                    status.ChecksConclusion = pullRequest.ChecksConclusion;
                }
                else
                {
                    status.ChecksConclusion = await GitHub.GetChecksConclusionAsync(
                        evidence.GitHubRepository!,
                        evidence.GitHubReference!,
                        ct);
                }
            }
            catch (GitHubUnavailableException ex)
            {
                status.Error = ex.Message;
            }

            statuses.Add(status);
        }

        return ServiceResult<IReadOnlyList<GitHubLiveStatusDto>>.Success(statuses);
    }

    // ---- Removal & download -----------------------------------------------------
    internal async Task<ServiceResult<ContributionDetailsDto>> RemoveEvidenceExecution(
        Guid contributionId,
        Guid evidenceId,
        Guid studentId,
        CancellationToken ct)
    {
        var (contribution, error) = await LoadEditableForEvidenceAsync(contributionId, studentId, ct);
        if (error is not null)
        {
            return error;
        }

        var now = DateTimeOffset.UtcNow;
        var (revision, clonedEvidenceId) =
            EnsureEditableRevision(contribution!, now, evidenceId);
        var effectiveEvidenceId = clonedEvidenceId ?? evidenceId;
        var evidence = revision.Evidence.FirstOrDefault(item => item.Id == effectiveEvidenceId);
        if (evidence is null)
        {
            return Failure("Evidence not found.", ServiceErrorType.NotFound);
        }

        var storagePath = evidence.StoragePath;
        revision.Evidence.Remove(evidence);
        revision.UpdatedAtUtc = now;
        contribution!.UpdatedAtUtc = now;
        await Context.SaveChangesAsync(ct);

        if (storagePath is not null)
        {
            await DeleteUnreferencedFilesAsync([storagePath], ct);
        }

        return await DetailsAsync(contribution, ct);
    }

    internal async Task<ServiceResult<EvidenceFileContent>> OpenEvidenceFileExecution(
        Guid evidenceId,
        Guid actorId,
        CancellationToken ct)
    {
        var evidence = await Context.ContributionEvidence
            .AsNoTracking()
            .Include(item => item.ContributionRevision)
                .ThenInclude(revision => revision.Contribution)
                    .ThenInclude(contribution => contribution.Collaborators)
            .FirstOrDefaultAsync(item => item.Id == evidenceId, ct);
        var members = await LoadMembersAsync(ct);
        if (evidence?.StoragePath is null ||
            !CanView(evidence.ContributionRevision.Contribution, actorId, members))
        {
            return Fail<EvidenceFileContent>("File not found.", ServiceErrorType.NotFound);
        }

        var stream = FileStorage.OpenRead(evidence.StoragePath);
        return stream is null
            ? Fail<EvidenceFileContent>("The file is no longer available.", ServiceErrorType.NotFound)
            : ServiceResult<EvidenceFileContent>.Success(new EvidenceFileContent(
                stream,
                evidence.ContentType ?? "application/octet-stream",
                evidence.OriginalFileName ?? evidence.Name));
    }

    // Owner always; mentor of the student and listed collaborators once submitted.
    private static bool CanView(
        Contribution contribution,
        Guid actorId,
        IReadOnlyDictionary<Guid, InternshipMemberDto> members)
    {
        if (contribution.StudentId == actorId)
        {
            return true;
        }

        if (contribution.Status == ContributionStatus.Draft)
        {
            return false;
        }

        return IsMentorOf(members, actorId, contribution.StudentId) ||
            contribution.Collaborators.Any(item => item.UserId == actorId);
    }

    // ---- Helpers ----------------------------------------------------------------
    private async Task<(Contribution? Contribution, ServiceResult<ContributionDetailsDto>? Error)>
        LoadEditableForEvidenceAsync(Guid contributionId, Guid studentId, CancellationToken ct)
    {
        var contribution = await FindOwnedContributionAsync(contributionId, studentId, ct);
        if (contribution is null)
        {
            return (null, Failure("Contribution not found.", ServiceErrorType.NotFound));
        }

        if (!IsEditable(contribution.Status))
        {
            return (null, Failure(
                "Evidence cannot be changed while the contribution is in mentor review.",
                ServiceErrorType.Conflict));
        }

        if (GetCurrentRevision(contribution).Evidence.Count >= MaximumEvidencePerRevision)
        {
            return (null, Failure(
                $"A contribution can have at most {MaximumEvidencePerRevision} evidence items.",
                ServiceErrorType.Validation));
        }

        return (contribution, null);
    }

    private void AddEvidence(
        Contribution contribution,
        ContributionRevision revision,
        ContributionEvidence evidence,
        DateTimeOffset now)
    {
        revision.Evidence.Add(evidence);
        Context.ContributionEvidence.Add(evidence);
        revision.UpdatedAtUtc = now;
        contribution.UpdatedAtUtc = now;
    }

    private async Task DeleteUnreferencedFilesAsync(
        IEnumerable<string> storagePaths,
        CancellationToken ct)
    {
        foreach (var storagePath in storagePaths)
        {
            var stillReferenced = await Context.ContributionEvidence
                .AsNoTracking()
                .AnyAsync(item => item.StoragePath == storagePath, ct);
            if (!stillReferenced)
            {
                await FileStorage.DeleteAsync(storagePath, ct);
            }
        }
    }

    private static (EvidenceType Type, string ContentType, string Extension)? DetectFileType(
        ReadOnlySpan<byte> content)
    {
        if (content.StartsWith(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }))
        {
            return (EvidenceType.Image, "image/png", ".png");
        }

        if (content.StartsWith(new byte[] { 0xFF, 0xD8, 0xFF }))
        {
            return (EvidenceType.Image, "image/jpeg", ".jpg");
        }

        if (content.StartsWith("GIF87a"u8) || content.StartsWith("GIF89a"u8))
        {
            return (EvidenceType.Image, "image/gif", ".gif");
        }

        if (content.Length >= 12 && content.StartsWith("RIFF"u8) && content[8..12].SequenceEqual("WEBP"u8))
        {
            return (EvidenceType.Image, "image/webp", ".webp");
        }

        if (content.StartsWith("%PDF-"u8))
        {
            return (EvidenceType.Document, "application/pdf", ".pdf");
        }

        return null;
    }

    private static readonly Regex GitHubPathPattern = new(
        @"^/(?<owner>[\w.-]+)/(?<repo>[\w.-]+)/(?:(?<kind>commit)/(?<ref>[0-9a-f]{7,40})|(?<kind>pull)/(?<ref>\d+)(?:/commits/(?<sha>[0-9a-f]{7,40}))?|(?<kind>issues)/(?<ref>\d+))(?:/.*)?$",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static GitHubUrlReference? ParseGitHubUrl(string? url)
    {
        if (!Uri.TryCreate(url?.Trim(), UriKind.Absolute, out var uri) ||
            !(uri.Host.Equals("github.com", StringComparison.OrdinalIgnoreCase) ||
              uri.Host.Equals("www.github.com", StringComparison.OrdinalIgnoreCase)))
        {
            return null;
        }

        var match = GitHubPathPattern.Match(uri.AbsolutePath);
        if (!match.Success)
        {
            return null;
        }

        var repository = $"{match.Groups["owner"].Value}/{match.Groups["repo"].Value}";
        var kind = match.Groups["kind"].Value.ToLowerInvariant();
        if (match.Groups["sha"].Success)
        {
            return new GitHubUrlReference(repository, GitHubUrlKind.Commit, match.Groups["sha"].Value.ToLowerInvariant());
        }

        return kind switch
        {
            "commit" => new GitHubUrlReference(repository, GitHubUrlKind.Commit, match.Groups["ref"].Value.ToLowerInvariant()),
            "pull" => new GitHubUrlReference(repository, GitHubUrlKind.PullRequest, match.Groups["ref"].Value),
            _ => new GitHubUrlReference(repository, GitHubUrlKind.Issue, match.Groups["ref"].Value)
        };
    }

    private string? FindAllowedRepository(string repository) =>
        GitHub.AllowedRepositories.FirstOrDefault(item =>
            string.Equals(item, repository.Trim(), StringComparison.OrdinalIgnoreCase));

    private string NotTeamRepositoryMessage(string repository) =>
        $"\"{repository}\" is not a team repository. Allowed: {string.Join(", ", GitHub.AllowedRepositories)}.";

    private static GitHubDetails ReadGitHubDetails(ContributionEvidence evidence)
    {
        if (string.IsNullOrWhiteSpace(evidence.GitHubDetailsJson))
        {
            return new GitHubDetails([], [], [], null);
        }

        try
        {
            return JsonSerializer.Deserialize<GitHubDetails>(evidence.GitHubDetailsJson, DetailsJsonOptions)
                ?? new GitHubDetails([], [], [], null);
        }
        catch (JsonException)
        {
            return new GitHubDetails([], [], [], null);
        }
    }
}
