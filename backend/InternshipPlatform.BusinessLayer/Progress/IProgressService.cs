namespace InternshipPlatform.BusinessLayer.Progress;

public interface IProgressService
{
    Task<StudentProgressDto> GetStudentProgressAsync(Guid studentId);
    Task<List<StudentSummaryDto>> GetStudentSummariesAsync();
    Task<TaskLogEntryDto> LogTaskAsync(Guid studentId, LogTaskRequest request);
    Task<MilestoneDto> UpdateMilestoneAsync(Guid milestoneId, Guid actingUserId, UpdateMilestoneRequest request);
    Task<FeedbackDto> SubmitFeedbackAsync(Guid studentId, Guid supervisorId, SubmitFeedbackRequest request);
}

public class StudentNotFoundException() : Exception("Student not found.");
public class MilestoneNotFoundException() : Exception("Milestone not found.");
public class MilestonePermissionException() : Exception("You are not allowed to update this milestone.");
public class InvalidRatingException() : Exception("Ratings must be between 1 and 5.");
public class InvalidTaskLogException(string message) : Exception(message);
