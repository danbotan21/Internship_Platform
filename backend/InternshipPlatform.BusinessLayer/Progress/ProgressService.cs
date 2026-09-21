using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Progress;

public class ProgressService(AppDbContext db, ProgramSettings settings) : IProgressService
{
    public async Task<StudentProgressDto> GetStudentProgressAsync(Guid studentId)
    {
        var student = await db.Users.SingleOrDefaultAsync(u => u.Id == studentId && u.Role == UserRole.Student)
            ?? throw new StudentNotFoundException();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var milestones = await db.Milestones
            .Where(m => m.StudentUserId == studentId)
            .Include(m => m.ReviewedByUser)
            .OrderBy(m => m.Order)
            .ToListAsync();

        var taskLog = await db.TaskLogEntries
            .Where(t => t.StudentUserId == studentId)
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync();

        var feedback = await db.SupervisorFeedback
            .Where(f => f.StudentUserId == studentId)
            .Include(f => f.SupervisorUser)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        var milestoneDtos = milestones.Select(m => ToDto(m, today)).ToList();
        var total = milestoneDtos.Count;
        var completed = milestoneDtos.Count(m => m.Status == MilestoneStatus.Completed);
        var percent = total == 0 ? 0 : Math.Round(completed * 100m / total, 0);
        var hoursLogged = taskLog.Sum(t => t.Hours);

        return new StudentProgressDto(
            student.Id,
            student.FullName,
            milestoneDtos,
            completed,
            total,
            percent,
            hoursLogged,
            settings.TargetHours,
            taskLog.Select(t => new TaskLogEntryDto(t.Id, t.Description, t.Hours, t.Date, t.CreatedAt)).ToList(),
            feedback.Select(f => new FeedbackDto(f.Id, f.SupervisorUser.FullName, f.Punctuality, f.Initiative, f.SkillGrowth, f.Comments, f.CreatedAt)).ToList(),
            total > 0 && completed == total);
    }

    public async Task<List<StudentSummaryDto>> GetStudentSummariesAsync()
    {
        var students = await db.Users.Where(u => u.Role == UserRole.Student).ToListAsync();
        var studentIds = students.Select(s => s.Id).ToList();

        var milestones = await db.Milestones
            .Where(m => studentIds.Contains(m.StudentUserId))
            .ToListAsync();

        var lastActivity = await db.TaskLogEntries
            .Where(t => studentIds.Contains(t.StudentUserId))
            .GroupBy(t => t.StudentUserId)
            .Select(g => new { StudentUserId = g.Key, LastDate = g.Max(t => t.Date) })
            .ToListAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        return students
            .Select(s =>
            {
                var studentMilestones = milestones.Where(m => m.StudentUserId == s.Id).ToList();
                var total = studentMilestones.Count;
                var completed = studentMilestones.Count(m => m.Status == MilestoneStatus.Completed);
                var percent = total == 0 ? 0 : Math.Round(completed * 100m / total, 0);
                var needsReview = studentMilestones.Any(m =>
                    m.RequiresReview && m.Status == MilestoneStatus.Pending && m.DueDate <= today);
                var lastDate = lastActivity.FirstOrDefault(l => l.StudentUserId == s.Id)?.LastDate;

                return new StudentSummaryDto(s.Id, s.FullName, percent, percent < settings.LowProgressThresholdPercent, lastDate, needsReview);
            })
            .OrderBy(s => s.StudentName)
            .ToList();
    }

    public async Task<TaskLogEntryDto> LogTaskAsync(Guid studentId, LogTaskRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Description))
        {
            throw new InvalidTaskLogException("Task description is required.");
        }

        if (request.Hours <= 0 || request.Hours > 24)
        {
            throw new InvalidTaskLogException("Hours must be between 0 and 24.");
        }

        var entry = new TaskLogEntry
        {
            Id = Guid.NewGuid(),
            StudentUserId = studentId,
            Description = request.Description.Trim(),
            Hours = request.Hours,
            Date = request.Date,
            CreatedAt = DateTime.UtcNow,
        };

        db.TaskLogEntries.Add(entry);
        await db.SaveChangesAsync();

        return new TaskLogEntryDto(entry.Id, entry.Description, entry.Hours, entry.Date, entry.CreatedAt);
    }

    public async Task<MilestoneDto> UpdateMilestoneAsync(Guid milestoneId, Guid actingUserId, UpdateMilestoneRequest request)
    {
        var milestone = await db.Milestones.SingleOrDefaultAsync(m => m.Id == milestoneId)
            ?? throw new MilestoneNotFoundException();

        if (milestone.StudentUserId != actingUserId || request.Status == MilestoneStatus.Flagged)
        {
            throw new MilestonePermissionException();
        }

        milestone.Status = request.Status;
        milestone.CompletedAt = request.Status == MilestoneStatus.Completed ? DateTime.UtcNow : null;

        await db.SaveChangesAsync();

        return ToDto(milestone, DateOnly.FromDateTime(DateTime.UtcNow));
    }

    public async Task<FeedbackDto> SubmitFeedbackAsync(Guid studentId, Guid supervisorId, SubmitFeedbackRequest request)
    {
        if (request.Punctuality is < 1 or > 5 || request.Initiative is < 1 or > 5 || request.SkillGrowth is < 1 or > 5)
        {
            throw new InvalidRatingException();
        }

        var studentExists = await db.Users.AnyAsync(u => u.Id == studentId && u.Role == UserRole.Student);
        if (!studentExists)
        {
            throw new StudentNotFoundException();
        }

        var supervisor = await db.Users.FindAsync(supervisorId) ?? throw new StudentNotFoundException();

        var feedback = new SupervisorFeedback
        {
            Id = Guid.NewGuid(),
            StudentUserId = studentId,
            SupervisorUserId = supervisorId,
            Punctuality = request.Punctuality,
            Initiative = request.Initiative,
            SkillGrowth = request.SkillGrowth,
            Comments = string.IsNullOrWhiteSpace(request.Comments) ? null : request.Comments.Trim(),
            CreatedAt = DateTime.UtcNow,
        };

        db.SupervisorFeedback.Add(feedback);
        await db.SaveChangesAsync();

        return new FeedbackDto(feedback.Id, supervisor.FullName, feedback.Punctuality, feedback.Initiative, feedback.SkillGrowth, feedback.Comments, feedback.CreatedAt);
    }

    private static MilestoneDto ToDto(Milestone m, DateOnly today) => new(
        m.Id,
        m.Title,
        m.Description,
        m.DueDate,
        m.Order,
        m.RequiresReview,
        m.Status,
        m.CompletedAt,
        m.ReviewedByUser?.FullName,
        m.RequiresReview && m.Status == MilestoneStatus.Pending && m.DueDate <= today);
}
