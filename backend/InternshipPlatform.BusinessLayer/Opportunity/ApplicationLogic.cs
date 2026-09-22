using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models.Application;
using InternshipPlatform.Domain.Models.Common;

namespace InternshipPlatform.BusinessLayer.Opportunity;

public class ApplicationLogic(ApplicationActions actions) : IApplicationLogic
{
    private readonly string _uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

    // ─── Student ─────────────────────────────────────────────────────────────

    public async Task<ApiResponse<bool>> ApplyAsync(
        Guid opportunityId, Guid studentId,
        SubmitApplicationDto dto, IReadOnlyList<UploadedFile> files)
    {
        if (await actions.HasAppliedAsync(opportunityId, studentId))
            return ApiResponse<bool>.Fail("You have already applied for this opportunity.");

        var resumeFile = files.FirstOrDefault(f => f.Name == "resume")
            ?? throw new ArgumentException("Resume file is required.");

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
    {
        var filePath = Path.Combine(_uploadsRoot, documentId.ToString());
        if (!File.Exists(filePath))
            throw new FileNotFoundException("Document not found.");

        var stream = File.OpenRead(filePath);
        var fileName = Path.GetFileName(filePath);
        const string contentType = "application/octet-stream";
        return Task.FromResult<(Stream, string, string)>((stream, contentType, fileName));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private async Task<string> SaveFileAsync(UploadedFile file, Guid opportunityId, Guid studentId)
    {
        var dir = Path.Combine(_uploadsRoot, opportunityId.ToString(), studentId.ToString());
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
