using System.Text.Json.Serialization;
using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.BusinessLayer.Quizzes;

public class QuizDto
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int QuestionCount { get; set; }
    public int DurationMinutes { get; set; }
    public int PassingScore { get; set; }
    public QuizDifficulty Difficulty { get; set; }
    public bool IsCustom { get; set; }
    public Guid? MentorId { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<QuizQuestionDto>? Questions { get; set; }
}

public class QuizDetailDto : QuizDto
{
    public new List<QuizQuestionDto> Questions { get; set; } = new();
}

public class QuizOptionDto
{
    public string Id { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty; // 'A', 'B', 'C', 'D'
    public string Text { get; set; } = string.Empty;
}

public class QuizQuestionDto
{
    public Guid Id { get; set; }
    public string NumberLabel { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string QuestionText { get; set; } = string.Empty;
    public string? Hint { get; set; }
    public List<QuizOptionDto> Options { get; set; } = new();
    public string CorrectOptionId { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
}

public class CreateQuizDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int DurationMinutes { get; set; } = 15;
    public int PassingScore { get; set; } = 70;
    public QuizDifficulty Difficulty { get; set; } = QuizDifficulty.MEDIUM;
    public List<CreateQuizQuestionDto> Questions { get; set; } = new();
}

public class CreateQuizQuestionDto
{
    public string NumberLabel { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string QuestionText { get; set; } = string.Empty;
    public string? Hint { get; set; }
    public List<QuizOptionDto> Options { get; set; } = new();
    public string CorrectOptionId { get; set; } = string.Empty;
}

public class AntiCheatViolationDto
{
    public string Id { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class QuizAnswerDto
{
    public Guid? QuestionId { get; set; }
    public string? QuestionNumberLabel { get; set; }
    public string SelectedOptionId { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string? Category { get; set; }
}

public class SubmitQuizAttemptDto
{
    public Guid? QuizId { get; set; }
    public string? QuizSlug { get; set; }
    public int Score { get; set; }
    public int TotalQuestions { get; set; }
    public int Percentage { get; set; }
    public int PassingScore { get; set; } = 70;
    public string Status { get; set; } = "PASSED"; // PASSED, BORDERLINE, FAILED
    public int TimeSpentSeconds { get; set; }
    public bool IsFlagged { get; set; }
    public string? FlagReason { get; set; }
    public List<AntiCheatViolationDto>? Violations { get; set; }
    public List<QuizAnswerDto>? Answers { get; set; }
    public int? CohortWeek { get; set; }
}

public class QuizAttemptDto
{
    public Guid Id { get; set; }
    public Guid QuizId { get; set; }
    public string QuizSlug { get; set; } = string.Empty;
    public string QuizTitle { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public QuizDifficulty Difficulty { get; set; }
    public Guid? UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int Score { get; set; }
    public int TotalQuestions { get; set; }
    public int Percentage { get; set; }
    public int PassingScore { get; set; }
    public string Status { get; set; } = string.Empty;
    public int TimeSpentSeconds { get; set; }
    public string TimeSpentFormatted { get; set; } = string.Empty;
    public bool IsFlagged { get; set; }
    public string? FlagReason { get; set; }
    public DateTime CompletedAt { get; set; }
    public int CohortWeek { get; set; }
    public List<string> MissedTopics { get; set; } = new();
}

public class WeekScoreEvolutionDto
{
    public string WeekLabel { get; set; } = string.Empty;
    public int WeekNumber { get; set; }
    public double Top10 { get; set; }
    public double Avg { get; set; }
    public double Bottom10 { get; set; }
    public int AttemptCount { get; set; }
}

public class TopicErrorStatDto
{
    public string Topic { get; set; } = string.Empty;
    public int ErrorRate { get; set; }
    public int TotalTested { get; set; }
    public int TotalErrors { get; set; }
}

public class QuizAnalyticsSummaryDto
{
    public int TotalAssessments { get; set; }
    public int UniqueStudents { get; set; }
    public double AvgScore { get; set; }
    public int PassRate { get; set; }
    public int AvgDurationSeconds { get; set; }
    public string AvgDurationFormatted { get; set; } = string.Empty;
    public List<WeekScoreEvolutionDto> WeekEvolution { get; set; } = new();
    public List<TopicErrorStatDto> HighestErrorTopics { get; set; } = new();
    public List<QuizAttemptDto> RecentAttempts { get; set; } = new();
}
