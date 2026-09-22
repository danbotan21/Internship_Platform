using InternshipPlatform.Domain;

namespace InternshipPlatform.BusinessLayer.Progress;

public record MilestoneDto(
    Guid Id,
    string Title,
    string Description,
    DateOnly DueDate,
    int Order,
    bool RequiresReview,
    MilestoneStatus Status,
    DateTime? CompletedAt,
    string? ReviewedByName,
    bool NeedsReview);

public record TaskLogEntryDto(Guid Id, string Description, decimal Hours, DateOnly Date, DateTime CreatedAt);

public record FeedbackDto(
    Guid Id,
    string SupervisorName,
    int Punctuality,
    int Initiative,
    int SkillGrowth,
    string? Comments,
    DateTime CreatedAt);

public record StudentProgressDto(
    Guid StudentId,
    string StudentName,
    List<MilestoneDto> Milestones,
    int MilestonesCompleted,
    int MilestonesTotal,
    decimal CompletionPercent,
    decimal HoursLogged,
    decimal TargetHours,
    List<TaskLogEntryDto> TaskLog,
    List<FeedbackDto> Feedback,
    bool CertificateEligible);

public record StudentSummaryDto(
    Guid StudentId,
    string StudentName,
    decimal CompletionPercent,
    bool BelowThreshold,
    DateOnly? LastActivityDate,
    bool HasMilestoneNeedingReview);

public record LogTaskRequest(string Description, decimal Hours, DateOnly Date);

public record UpdateMilestoneRequest(MilestoneStatus Status);

public record SubmitFeedbackRequest(int Punctuality, int Initiative, int SkillGrowth, string? Comments);
