namespace InternshipPlatform.Domain.Entities;

public class QuizQuestion
{
    public Guid Id { get; set; }
    public Guid QuizId { get; set; }
    public string NumberLabel { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string QuestionText { get; set; } = string.Empty;
    public string? Hint { get; set; }
    public string OptionsJson { get; set; } = "[]";
    public string CorrectOptionId { get; set; } = string.Empty;
    public int OrderIndex { get; set; }

    // Navigation
    public Quiz? Quiz { get; set; }
}
