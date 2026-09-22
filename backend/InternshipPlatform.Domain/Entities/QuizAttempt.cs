namespace InternshipPlatform.Domain.Entities;

public class QuizAttempt
{
    public Guid Id { get; set; }
    public Guid QuizId { get; set; }
    public Guid? UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int Score { get; set; }
    public int TotalQuestions { get; set; }
    public int Percentage { get; set; }
    public int PassingScore { get; set; }
    public string Status { get; set; } = "FAILED";
    public int TimeSpentSeconds { get; set; }
    public bool IsFlagged { get; set; }
    public string? FlagReason { get; set; }
    public string? ViolationsJson { get; set; }
    public string? AnswersJson { get; set; }
    public int CohortWeek { get; set; } = 1;
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Quiz? Quiz { get; set; }
    public User? User { get; set; }
}
