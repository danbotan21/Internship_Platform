using System.Text.RegularExpressions;
using InternshipPlatform.Domain;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Enums;
using InternshipPlatform.Domain.Models.Application;
using InternshipPlatform.Domain.Models.Common;

namespace InternshipPlatform.BusinessLayer.Opportunity;

public class ApplicationLogic(ApplicationActions actions) : IApplicationLogic
{
    // ─── Student ─────────────────────────────────────────────────────────────

    public async Task<ApiResponse<bool>> ApplyAsync(
        Guid opportunityId, Guid studentId,
        SubmitApplicationDto dto, IReadOnlyList<UploadedFile> files)
    {
        var oppStatus = await actions.GetOpportunityStatusAsync(opportunityId);
        if (oppStatus is null)
            return ApiResponse<bool>.Fail("Opportunity not found.");

        if (oppStatus == OpportunityStatus.Closed)
            return ApiResponse<bool>.Fail("Applications for this opportunity are closed.");

        if (oppStatus == OpportunityStatus.Draft)
            return ApiResponse<bool>.Fail("This opportunity is not published.");

        if (await actions.HasAppliedAsync(opportunityId, studentId))
            return ApiResponse<bool>.Fail("You have already applied for this opportunity.");

        var resumeFile = files.FirstOrDefault(f => f.Name.Equals("resume", StringComparison.OrdinalIgnoreCase))
            ?? files.FirstOrDefault();

        if (resumeFile is null)
            return ApiResponse<bool>.Fail("Resume file is required.");

        var resumePath = await SaveFileAsync(resumeFile, opportunityId, studentId);
        string? coverPath = null;
        var additionalPaths = new List<string>();

        var cover = files.FirstOrDefault(f => f.Name == "coverLetter");
        if (cover is not null)
            coverPath = await SaveFileAsync(cover, opportunityId, studentId);

        foreach (var extra in files.Where(f => f.Name == "additionalFiles"))
            additionalPaths.Add(await SaveFileAsync(extra, opportunityId, studentId));

        var application = new Application
        {
            Id = Guid.NewGuid(),
            OpportunityId = opportunityId,
            StudentId = studentId,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PhoneCountryCode = dto.PhoneCountryCode,
            PhoneNumber = dto.PhoneNumber,
            EducationLevel = dto.EducationLevel,
            FieldOfStudy = dto.FieldOfStudy,
            ExpectedGraduation = dto.ExpectedGraduation,
            Availability = dto.Availability,
            Motivation = dto.Motivation,
            ResumePath = resumePath,
            CoverLetterPath = coverPath,
            AdditionalFilePaths = additionalPaths,
            Status = ApplicationStatus.Pending,
            AppliedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await actions.CreateAsync(application);
        return ApiResponse<bool>.Ok(true, "Application submitted successfully.");
    }

    public async Task<ApiResponse<List<ApplicationListItemDto>>> GetStudentApplicationsAsync(Guid studentId)
    {
        var apps = await actions.GetByStudentIdAsync(studentId);
        return ApiResponse<List<ApplicationListItemDto>>.Ok(apps.Select(MapToListItem).ToList());
    }

    public async Task<ApiResponse<ApplicationDetailDto>> GetStudentApplicationByIdAsync(Guid applicationId, Guid studentId)
    {
        var app = await actions.GetByIdAsync(applicationId);
        if (app is null || app.StudentId != studentId)
            return ApiResponse<ApplicationDetailDto>.Fail("Application not found.");
        return ApiResponse<ApplicationDetailDto>.Ok(MapToDetail(app));
    }

    // ─── Mentor ───────────────────────────────────────────────────────────────

    public async Task<ApiResponse<List<ApplicationDetailDto>>> GetApplicationsByOpportunityAsync(Guid opportunityId, Guid mentorId)
    {
        var apps = await actions.GetByOpportunityIdAsync(opportunityId);
        return ApiResponse<List<ApplicationDetailDto>>.Ok(apps.Select(MapToDetail).ToList());
    }

    public async Task<ApiResponse<ApplicationDetailDto>> GetApplicationForReviewAsync(Guid applicationId, Guid mentorId)
    {
        var app = await actions.GetByIdAsync(applicationId);
        if (app is null) return ApiResponse<ApplicationDetailDto>.Fail("Application not found.");
        return ApiResponse<ApplicationDetailDto>.Ok(MapToDetail(app));
    }

    public async Task<ApiResponse<bool>> ReviewApplicationAsync(Guid applicationId, Guid mentorId, ReviewApplicationDto dto)
    {
        var app = await actions.GetByIdAsync(applicationId);
        if (app is null) return ApiResponse<bool>.Fail("Application not found.");

        if (!Enum.TryParse<ApplicationStatus>(dto.Status, out var status))
            return ApiResponse<bool>.Fail($"Invalid status '{dto.Status}'.");

        app.Status = status;
        app.ReviewFeedback = dto.Feedback;
        app.ReviewedAt = DateTime.UtcNow;

        await actions.UpdateAsync(app);
        return ApiResponse<bool>.Ok(true);
    }

    // ─── Documents ────────────────────────────────────────────────────────────

    public Task<(Stream stream, string contentType, string fileName)> DownloadDocumentAsync(
        Guid documentId, Guid requestingUserId)
        => DownloadApplicationFileAsync(documentId, requestingUserId);

    public async Task<(Stream stream, string contentType, string fileName)> DownloadApplicationFileAsync(
        Guid applicationId, Guid requestingUserId, string? fileType = null, string? fileName = null)
    {
        var app = await actions.GetByIdAsync(applicationId);
        if (app is null)
        {
            // Fallback for direct document ID check
            var root = GetUploadsRoot();
            var directFile = Path.Combine(root, applicationId.ToString());
            if (File.Exists(directFile))
            {
                var s = File.OpenRead(directFile);
                var fn = Path.GetFileName(directFile);
                return (s, GetContentType(fn), StripGuidPrefix(fn));
            }
            throw new FileNotFoundException("Application not found.");
        }

        // Authorization check: student who applied, mentor for this opportunity, or any mentor/admin
        var isStudent = app.StudentId == requestingUserId;
        var isOpportunityMentor = app.Opportunity != null && app.Opportunity.MentorId == requestingUserId;

        if (!isStudent && !isOpportunityMentor)
        {
            var requestingUser = await actions.GetUserByIdAsync(requestingUserId);
            var isMentorOrAdmin = requestingUser?.Role is UserRole.Mentor or UserRole.Admin;
            if (!isMentorOrAdmin)
            {
                throw new UnauthorizedAccessException("You are not authorized to download files for this application.");
            }
        }

        string? targetPath = null;
        var normalizedType = fileType?.Trim().ToLowerInvariant();
        var normalizedFileName = string.IsNullOrWhiteSpace(fileName) ? null : Uri.UnescapeDataString(fileName.Trim());

        if (normalizedType == "resume")
        {
            targetPath = app.ResumePath;
        }
        else if (normalizedType is "coverletter" or "cover_letter" or "cover")
        {
            targetPath = app.CoverLetterPath;
        }
        else if (!string.IsNullOrEmpty(normalizedFileName))
        {
            if (!string.IsNullOrEmpty(app.ResumePath) && (
                Path.GetFileName(app.ResumePath).Equals(normalizedFileName, StringComparison.OrdinalIgnoreCase) ||
                StripGuidPrefix(Path.GetFileName(app.ResumePath)).Equals(normalizedFileName, StringComparison.OrdinalIgnoreCase) ||
                Path.GetFileName(app.ResumePath).EndsWith(normalizedFileName, StringComparison.OrdinalIgnoreCase)))
            {
                targetPath = app.ResumePath;
            }
            else if (!string.IsNullOrEmpty(app.CoverLetterPath) && (
                Path.GetFileName(app.CoverLetterPath).Equals(normalizedFileName, StringComparison.OrdinalIgnoreCase) ||
                StripGuidPrefix(Path.GetFileName(app.CoverLetterPath)).Equals(normalizedFileName, StringComparison.OrdinalIgnoreCase) ||
                Path.GetFileName(app.CoverLetterPath).EndsWith(normalizedFileName, StringComparison.OrdinalIgnoreCase)))
            {
                targetPath = app.CoverLetterPath;
            }
            else if (app.AdditionalFilePaths != null)
            {
                targetPath = app.AdditionalFilePaths.FirstOrDefault(p =>
                    Path.GetFileName(p).Equals(normalizedFileName, StringComparison.OrdinalIgnoreCase) ||
                    StripGuidPrefix(Path.GetFileName(p)).Equals(normalizedFileName, StringComparison.OrdinalIgnoreCase) ||
                    Path.GetFileName(p).EndsWith(normalizedFileName, StringComparison.OrdinalIgnoreCase));
            }
        }

        // Fallback default: Resume -> CoverLetter -> Additional
        targetPath ??= app.ResumePath ?? app.CoverLetterPath ?? app.AdditionalFilePaths?.FirstOrDefault();

        if (string.IsNullOrEmpty(targetPath))
        {
            throw new FileNotFoundException("No document file attached to this application.");
        }

        var resolvedPath = ResolvePhysicalPath(targetPath);
        if (resolvedPath is null || !File.Exists(resolvedPath))
        {
            throw new FileNotFoundException($"File '{Path.GetFileName(targetPath)}' was not found on server.");
        }

        var stream = File.OpenRead(resolvedPath);
        var diskFileName = Path.GetFileName(resolvedPath);
        var cleanFileName = StripGuidPrefix(diskFileName);
        var contentType = GetContentType(cleanFileName);

        return (stream, contentType, cleanFileName);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private string GetUploadsRoot()
    {
        var current = Directory.GetCurrentDirectory();
        var candidate = Path.Combine(current, "uploads");
        if (Directory.Exists(candidate)) return candidate;

        var parent = Path.Combine(current, "..", "uploads");
        if (Directory.Exists(parent)) return Path.GetFullPath(parent);

        var inApi = Path.Combine(current, "InternshipPlatform.Api", "uploads");
        if (Directory.Exists(inApi)) return Path.GetFullPath(inApi);

        var inApiUpper = Path.Combine(current, "InternshipPlatform.API", "uploads");
        if (Directory.Exists(inApiUpper)) return Path.GetFullPath(inApiUpper);

        return candidate;
    }

    private string? ResolvePhysicalPath(string path)
    {
        if (File.Exists(path)) return path;

        var rel = Path.Combine(Directory.GetCurrentDirectory(), path.TrimStart('/', '\\'));
        if (File.Exists(rel)) return rel;

        var root = GetUploadsRoot();
        var fileName = Path.GetFileName(path);

        var inRoot = Path.Combine(root, path.TrimStart('/', '\\'));
        if (File.Exists(inRoot)) return inRoot;

        if (Directory.Exists(root))
        {
            var match = Directory.GetFiles(root, fileName, SearchOption.AllDirectories).FirstOrDefault();
            if (match != null && File.Exists(match)) return match;
        }

        var parentUploads = Path.Combine(Directory.GetCurrentDirectory(), "..", "uploads");
        if (Directory.Exists(parentUploads))
        {
            var match = Directory.GetFiles(parentUploads, fileName, SearchOption.AllDirectories).FirstOrDefault();
            if (match != null && File.Exists(match)) return match;
        }

        return null;
    }

    private static string StripGuidPrefix(string fileName)
    {
        if (string.IsNullOrEmpty(fileName)) return fileName;
        return Regex.Replace(
            fileName,
            @"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}_",
            string.Empty);
    }

    private static string GetContentType(string fileName)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        return ext switch
        {
            ".pdf" => "application/pdf",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".doc" => "application/msword",
            ".rtf" => "application/rtf",
            ".txt" => "text/plain",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".svg" => "image/svg+xml",
            ".zip" => "application/zip",
            ".rar" => "application/x-rar-compressed",
            ".7z" => "application/x-7z-compressed",
            _ => "application/octet-stream"
        };
    }

    private async Task<string> SaveFileAsync(UploadedFile file, Guid opportunityId, Guid studentId)
    {
        var root = GetUploadsRoot();
        var dir = Path.Combine(root, opportunityId.ToString(), studentId.ToString());
        Directory.CreateDirectory(dir);
        var safeFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var path = Path.Combine(dir, safeFileName);
        await using var fs = File.Create(path);
        await file.Stream.CopyToAsync(fs);
        return path;
    }

    private static ApplicationListItemDto MapToListItem(Application a) => new()
    {
        Id = a.Id,
        OpportunityId = a.OpportunityId,
        OpportunityTitle = a.Opportunity?.Title ?? string.Empty,
        Company = a.Opportunity?.Company ?? string.Empty,
        Status = a.Status.ToString(),
        AppliedAt = a.AppliedAt,
        UpdatedAt = a.UpdatedAt
    };

    private static ApplicationDetailDto MapToDetail(Application a) => new()
    {
        Id = a.Id,
        OpportunityId = a.OpportunityId,
        OpportunityTitle = a.Opportunity?.Title ?? string.Empty,
        Company = a.Opportunity?.Company ?? string.Empty,
        FirstName = a.FirstName,
        LastName = a.LastName,
        Email = a.Email,
        PhoneCountryCode = a.PhoneCountryCode,
        PhoneNumber = a.PhoneNumber,
        EducationLevel = a.EducationLevel,
        FieldOfStudy = a.FieldOfStudy,
        ExpectedGraduation = a.ExpectedGraduation,
        Availability = a.Availability,
        Motivation = a.Motivation,
        ResumePath = a.ResumePath,
        CoverLetterPath = a.CoverLetterPath,
        AdditionalFilePaths = a.AdditionalFilePaths,
        Status = a.Status.ToString(),
        ReviewFeedback = a.ReviewFeedback,
        ReviewedAt = a.ReviewedAt,
        AppliedAt = a.AppliedAt
    };
}
