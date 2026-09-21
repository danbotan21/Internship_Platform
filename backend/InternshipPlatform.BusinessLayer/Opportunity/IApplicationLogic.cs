using InternshipPlatform.Domain;
using InternshipPlatform.Domain.Models.Common;
using InternshipPlatform.Domain.Models.Application;

namespace InternshipPlatform.BusinessLayer.Opportunity;

/// <summary>Lightweight file info passed from the controller to the business layer.</summary>
public record UploadedFile(string Name, string FileName, Stream Stream);

public interface IApplicationLogic
{
    // Student
    Task<ApiResponse<bool>> ApplyAsync(Guid opportunityId, Guid studentId, SubmitApplicationDto dto, IReadOnlyList<UploadedFile> files);
    Task<ApiResponse<List<ApplicationListItemDto>>> GetStudentApplicationsAsync(Guid studentId);
    Task<ApiResponse<ApplicationDetailDto>> GetStudentApplicationByIdAsync(Guid applicationId, Guid studentId);

    // Mentor
    Task<ApiResponse<List<ApplicationDetailDto>>> GetApplicationsByOpportunityAsync(Guid opportunityId, Guid mentorId);
    Task<ApiResponse<ApplicationDetailDto>> GetApplicationForReviewAsync(Guid applicationId, Guid mentorId);
    Task<ApiResponse<bool>> ReviewApplicationAsync(Guid applicationId, Guid mentorId, ReviewApplicationDto dto);

    // Documents
    Task<(Stream stream, string contentType, string fileName)> DownloadDocumentAsync(Guid documentId, Guid requestingUserId);
}
