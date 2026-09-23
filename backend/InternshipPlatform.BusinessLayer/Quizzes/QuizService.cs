using System.Text.Json;
using System.Text.RegularExpressions;
using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InternshipPlatform.BusinessLayer.Quizzes;

public class QuizService : IQuizService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<QuizService> _logger;
    private static readonly JsonSerializerOptions _jsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public QuizService(AppDbContext dbContext, ILogger<QuizService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task SeedCatalogIfEmptyAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var hasQuizzes = await _dbContext.Quizzes.AnyAsync(cancellationToken);
            if (!hasQuizzes)
            {
                _logger.LogInformation("Seeding default quizzes catalog to PostgreSQL...");
                var defaultQuizzes = QuizSeedData.GetDefaultQuizzes();
                _dbContext.Quizzes.AddRange(defaultQuizzes);
                await _dbContext.SaveChangesAsync(cancellationToken);

                var slugToId = defaultQuizzes.ToDictionary(q => q.Slug, q => q.Id);
                var hasAttempts = await _dbContext.QuizAttempts.AnyAsync(cancellationToken);
                if (!hasAttempts)
                {
                    _logger.LogInformation("Seeding benchmark quiz attempts to PostgreSQL...");
                    var attempts = QuizSeedData.GetSeedAttempts(slugToId);
                    _dbContext.QuizAttempts.AddRange(attempts);
                    await _dbContext.SaveChangesAsync(cancellationToken);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to seed quizzes or benchmark attempts.");
        }
    }

    public async Task<List<QuizDto>> GetQuizzesAsync(CancellationToken cancellationToken = default)
    {
        await SeedCatalogIfEmptyAsync(cancellationToken);

        var quizzes = await _dbContext.Quizzes
            .AsNoTracking()
            .Include(q => q.Questions)
            .OrderBy(q => q.IsCustom)
            .ThenBy(q => q.CreatedAt)
            .ToListAsync(cancellationToken);

        return quizzes.Select(MapToDto).ToList();
    }

    public async Task<QuizDetailDto?> GetQuizByIdOrSlugAsync(string idOrSlug, CancellationToken cancellationToken = default)
    {
        await SeedCatalogIfEmptyAsync(cancellationToken);

        Quiz? quiz = null;
        if (Guid.TryParse(idOrSlug, out var id))
        {
            quiz = await _dbContext.Quizzes
                .AsNoTracking()
                .Include(q => q.Questions)
                .FirstOrDefaultAsync(q => q.Id == id, cancellationToken);
        }

        if (quiz == null)
        {
            quiz = await _dbContext.Quizzes
                .AsNoTracking()
                .Include(q => q.Questions)
                .FirstOrDefaultAsync(q => q.Slug == idOrSlug, cancellationToken);
        }

        return quiz != null ? MapToDetailDto(quiz) : null;
    }

    public async Task<QuizDetailDto> CreateCustomQuizAsync(CreateQuizDto dto, Guid? mentorId, CancellationToken cancellationToken = default)
    {
        var cleanTitleSlug = Regex.Replace(dto.Title.ToLowerInvariant(), @"[^a-z0-9]+", "-").Trim('-');
        var slug = $"custom-{cleanTitleSlug}-{Guid.NewGuid().ToString("N")[..6]}";

        var quiz = new Quiz
        {
            Id = Guid.NewGuid(),
            Slug = slug,
            Title = dto.Title,
            Description = dto.Description,
            Category = string.IsNullOrWhiteSpace(dto.Category) ? "General" : dto.Category,
            QuestionCount = dto.Questions.Count,
            DurationMinutes = dto.DurationMinutes > 0 ? dto.DurationMinutes : 15,
            PassingScore = dto.PassingScore > 0 ? dto.PassingScore : 70,
            Difficulty = dto.Difficulty,
            IsCustom = true,
            MentorId = mentorId,
            CreatedAt = DateTime.UtcNow,
            Questions = new List<QuizQuestion>()
        };

        for (int i = 0; i < dto.Questions.Count; i++)
        {
            var qDto = dto.Questions[i];
            var question = new QuizQuestion
            {
                Id = Guid.NewGuid(),
                QuizId = quiz.Id,
                NumberLabel = string.IsNullOrWhiteSpace(qDto.NumberLabel) ? $"Q{i + 1:D2}" : qDto.NumberLabel,
                Category = string.IsNullOrWhiteSpace(qDto.Category) ? quiz.Category : qDto.Category,
                QuestionText = qDto.QuestionText,
                Hint = qDto.Hint,
                CorrectOptionId = qDto.CorrectOptionId,
                OrderIndex = i + 1,
                OptionsJson = JsonSerializer.Serialize(qDto.Options, _jsonOptions)
            };
            quiz.Questions.Add(question);
        }

        _dbContext.Quizzes.Add(quiz);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToDetailDto(quiz);
    }

    public async Task<QuizDetailDto?> UpdateCustomQuizAsync(Guid id, CreateQuizDto dto, Guid? mentorId, CancellationToken cancellationToken = default)
    {
        var quiz = await _dbContext.Quizzes
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == id, cancellationToken);

        if (quiz == null) return null;

        quiz.Title = dto.Title;
        quiz.Description = dto.Description;
        quiz.Category = string.IsNullOrWhiteSpace(dto.Category) ? quiz.Category : dto.Category;
        quiz.DurationMinutes = dto.DurationMinutes;
        quiz.PassingScore = dto.PassingScore;
        quiz.Difficulty = dto.Difficulty;
        quiz.QuestionCount = dto.Questions.Count;

        // Replace questions
        _dbContext.QuizQuestions.RemoveRange(quiz.Questions);
        quiz.Questions.Clear();

        for (int i = 0; i < dto.Questions.Count; i++)
        {
            var qDto = dto.Questions[i];
            var question = new QuizQuestion
            {
                Id = Guid.NewGuid(),
                QuizId = quiz.Id,
                NumberLabel = string.IsNullOrWhiteSpace(qDto.NumberLabel) ? $"Q{i + 1:D2}" : qDto.NumberLabel,
                Category = string.IsNullOrWhiteSpace(qDto.Category) ? quiz.Category : qDto.Category,
                QuestionText = qDto.QuestionText,
                Hint = qDto.Hint,
                CorrectOptionId = qDto.CorrectOptionId,
                OrderIndex = i + 1,
                OptionsJson = JsonSerializer.Serialize(qDto.Options, _jsonOptions)
            };
            quiz.Questions.Add(question);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDetailDto(quiz);
    }

    public async Task<bool> DeleteCustomQuizAsync(Guid id, Guid? mentorId, CancellationToken cancellationToken = default)
    {
        var quiz = await _dbContext.Quizzes
            .Include(q => q.Questions)
            .Include(q => q.Attempts)
            .FirstOrDefaultAsync(q => q.Id == id, cancellationToken);

        if (quiz == null) return false;

        _dbContext.Quizzes.Remove(quiz);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<QuizAttemptDto> SubmitAttemptAsync(SubmitQuizAttemptDto dto, Guid? userId, string userName, string userEmail, CancellationToken cancellationToken = default)
    {
        Quiz? quiz = null;
        if (dto.QuizId.HasValue)
        {
            quiz = await _dbContext.Quizzes.FirstOrDefaultAsync(q => q.Id == dto.QuizId.Value, cancellationToken);
        }
        if (quiz == null && !string.IsNullOrWhiteSpace(dto.QuizSlug))
        {
            quiz = await _dbContext.Quizzes.FirstOrDefaultAsync(q => q.Slug == dto.QuizSlug, cancellationToken);
        }

        if (quiz == null)
        {
            throw new InvalidOperationException($"Quiz not found with ID {dto.QuizId} or slug {dto.QuizSlug}");
        }

        var percentage = dto.TotalQuestions > 0
            ? (int)Math.Round((double)dto.Score / dto.TotalQuestions * 100)
            : dto.Percentage;

        var status = !string.IsNullOrWhiteSpace(dto.Status)
            ? dto.Status
            : (percentage >= quiz.PassingScore ? "PASSED" : (percentage >= quiz.PassingScore - 15 ? "BORDERLINE" : "FAILED"));

        var attempt = new QuizAttempt
        {
            Id = Guid.NewGuid(),
            QuizId = quiz.Id,
            UserId = userId,
            UserName = !string.IsNullOrWhiteSpace(userName) ? userName : "Student",
            UserEmail = !string.IsNullOrWhiteSpace(userEmail) ? userEmail : "student@internflow.dev",
            Score = dto.Score,
            TotalQuestions = dto.TotalQuestions,
            Percentage = percentage,
            PassingScore = quiz.PassingScore,
            Status = status,
            TimeSpentSeconds = dto.TimeSpentSeconds,
            IsFlagged = dto.IsFlagged,
            FlagReason = dto.FlagReason,
            ViolationsJson = dto.Violations != null ? JsonSerializer.Serialize(dto.Violations, _jsonOptions) : null,
            AnswersJson = dto.Answers != null ? JsonSerializer.Serialize(dto.Answers, _jsonOptions) : null,
            CohortWeek = dto.CohortWeek ?? 8,
            CompletedAt = DateTime.UtcNow
        };

        _dbContext.QuizAttempts.Add(attempt);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToAttemptDto(attempt, quiz);
    }

    public async Task<List<QuizAttemptDto>> GetUserAttemptsAsync(Guid? userId, string? userEmail, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.QuizAttempts
            .AsNoTracking()
            .Include(a => a.Quiz)
            .AsQueryable();

        if (userId.HasValue && !string.IsNullOrWhiteSpace(userEmail))
        {
            query = query.Where(a => a.UserId == userId.Value || a.UserEmail == userEmail);
        }
        else if (userId.HasValue)
        {
            query = query.Where(a => a.UserId == userId.Value);
        }
        else if (!string.IsNullOrWhiteSpace(userEmail))
        {
            query = query.Where(a => a.UserEmail == userEmail);
        }

        var attempts = await query.OrderByDescending(a => a.CompletedAt).ToListAsync(cancellationToken);
        return attempts.Select(a => MapToAttemptDto(a, a.Quiz)).ToList();
    }

    public async Task<QuizAnalyticsSummaryDto> GetAnalyticsSummaryAsync(string? quizIdOrSlug = null, CancellationToken cancellationToken = default)
    {
        await SeedCatalogIfEmptyAsync(cancellationToken);

        var query = _dbContext.QuizAttempts
            .AsNoTracking()
            .Include(a => a.Quiz)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(quizIdOrSlug) && quizIdOrSlug != "ALL")
        {
            if (Guid.TryParse(quizIdOrSlug, out var qid))
            {
                query = query.Where(a => a.QuizId == qid);
            }
            else
            {
                query = query.Where(a => a.Quiz.Slug == quizIdOrSlug);
            }
        }

        var attempts = await query.OrderByDescending(a => a.CompletedAt).ToListAsync(cancellationToken);

        if (attempts.Count == 0)
        {
            return new QuizAnalyticsSummaryDto
            {
                TotalAssessments = 0,
                UniqueStudents = 0,
                AvgScore = 0,
                PassRate = 0,
                AvgDurationSeconds = 0,
                AvgDurationFormatted = "0m 00s"
            };
        }

        var totalAssessments = attempts.Count;
        var uniqueStudents = attempts.Select(a => string.IsNullOrWhiteSpace(a.UserEmail) ? a.UserName : a.UserEmail).Distinct().Count();
        var avgScore = Math.Round(attempts.Average(a => a.Percentage), 1);
        var passedCount = attempts.Count(a => a.Status == "PASSED");
        var passRate = (int)Math.Round((double)passedCount / totalAssessments * 100);
        var avgDuration = (int)Math.Round(attempts.Average(a => a.TimeSpentSeconds));

        // Weekly evolution (W1 to W8)
        var baselineWeeks = new[]
        {
            new { WeekLabel = "W1", WeekNumber = 1, BaseTop = 68.0, BaseAvg = 52.0, BaseBottom = 35.0 },
            new { WeekLabel = "W2", WeekNumber = 2, BaseTop = 72.0, BaseAvg = 56.0, BaseBottom = 38.0 },
            new { WeekLabel = "W3", WeekNumber = 3, BaseTop = 76.0, BaseAvg = 60.0, BaseBottom = 41.0 },
            new { WeekLabel = "W4", WeekNumber = 4, BaseTop = 80.0, BaseAvg = 63.0, BaseBottom = 44.0 },
            new { WeekLabel = "W5", WeekNumber = 5, BaseTop = 83.0, BaseAvg = 66.0, BaseBottom = 46.0 },
            new { WeekLabel = "W6", WeekNumber = 6, BaseTop = 86.0, BaseAvg = 69.0, BaseBottom = 48.0 },
            new { WeekLabel = "W7", WeekNumber = 7, BaseTop = 89.0, BaseAvg = 70.0, BaseBottom = 50.0 },
            new { WeekLabel = "W8", WeekNumber = 8, BaseTop = 92.0, BaseAvg = 72.0, BaseBottom = 52.0 },
        };

        var isGlobal = string.IsNullOrWhiteSpace(quizIdOrSlug) || quizIdOrSlug == "ALL";

        var weekEvolution = baselineWeeks.Select(bw =>
        {
            var weekAttempts = attempts.Where(a => a.CohortWeek == bw.WeekNumber).ToList();
            if (weekAttempts.Count == 0)
            {
                return new WeekScoreEvolutionDto
                {
                    WeekLabel = bw.WeekLabel,
                    WeekNumber = bw.WeekNumber,
                    Top10 = isGlobal ? bw.BaseTop : 0,
                    Avg = isGlobal ? bw.BaseAvg : 0,
                    Bottom10 = isGlobal ? bw.BaseBottom : 0,
                    AttemptCount = 0
                };
            }

            var scores = weekAttempts.Select(a => (double)a.Percentage).OrderBy(s => s).ToList();
            var avg = Math.Round(scores.Average(), 1);
            var max = scores[^1];
            var min = scores[0];

            return new WeekScoreEvolutionDto
            {
                WeekLabel = bw.WeekLabel,
                WeekNumber = bw.WeekNumber,
                Top10 = isGlobal ? Math.Round((max + bw.BaseTop) / 2, 1) : max,
                Avg = avg,
                Bottom10 = isGlobal ? Math.Round((min + bw.BaseBottom) / 2, 1) : min,
                AttemptCount = weekAttempts.Count
            };
        }).ToList();

        // Topic errors calculation
        var topicErrors = new Dictionary<string, (int errors, int tested)>();

        if (isGlobal)
        {
            topicErrors["Async/Await"] = (14, 20);
            topicErrors["Big-O Notation"] = (12, 19);
            topicErrors["SQL Joins"] = (11, 20);
            topicErrors["React Hooks"] = (9, 19);
            topicErrors["REST Semantics"] = (8, 19);
            topicErrors["Git Workflow"] = (6, 20);
        }

        foreach (var att in attempts)
        {
            if (!string.IsNullOrWhiteSpace(att.AnswersJson))
            {
                try
                {
                    var answers = JsonSerializer.Deserialize<List<QuizAnswerDto>>(att.AnswersJson, _jsonOptions);
                    if (answers != null)
                    {
                        foreach (var ans in answers)
                        {
                            var topic = !string.IsNullOrWhiteSpace(ans.Category) ? ans.Category : att.Quiz.Category;
                            if (!topicErrors.ContainsKey(topic)) topicErrors[topic] = (0, 0);
                            var current = topicErrors[topic];
                            topicErrors[topic] = (current.errors + (ans.IsCorrect ? 0 : 1), current.tested + 1);
                        }
                    }
                }
                catch { }
            }
        }

        var highestErrorTopics = topicErrors
            .Select(kv => new TopicErrorStatDto
            {
                Topic = kv.Key,
                TotalErrors = kv.Value.errors,
                TotalTested = kv.Value.tested,
                ErrorRate = kv.Value.tested > 0 ? (int)Math.Min(99, Math.Round((double)kv.Value.errors / kv.Value.tested * 100)) : 0
            })
            .OrderByDescending(t => t.ErrorRate)
            .ToList();

        return new QuizAnalyticsSummaryDto
        {
            TotalAssessments = totalAssessments,
            UniqueStudents = uniqueStudents,
            AvgScore = avgScore,
            PassRate = passRate,
            AvgDurationSeconds = avgDuration,
            AvgDurationFormatted = FormatDuration(avgDuration),
            WeekEvolution = weekEvolution,
            HighestErrorTopics = highestErrorTopics,
            RecentAttempts = attempts.Select(a => MapToAttemptDto(a, a.Quiz)).ToList()
        };
    }

    private static string FormatDuration(int seconds)
    {
        var m = seconds / 60;
        var s = seconds % 60;
        return $"{m}m {s:D2}s";
    }

    private static List<QuizQuestionDto> MapQuestions(ICollection<QuizQuestion> questions)
    {
        return questions
            .OrderBy(q => q.OrderIndex)
            .Select(q =>
            {
                List<QuizOptionDto> options = new();
                if (!string.IsNullOrWhiteSpace(q.OptionsJson))
                {
                    try
                    {
                        options = JsonSerializer.Deserialize<List<QuizOptionDto>>(q.OptionsJson, _jsonOptions) ?? new();
                    }
                    catch { }
                }

                return new QuizQuestionDto
                {
                    Id = q.Id,
                    NumberLabel = q.NumberLabel,
                    Category = q.Category,
                    QuestionText = q.QuestionText,
                    Hint = q.Hint,
                    CorrectOptionId = q.CorrectOptionId,
                    OrderIndex = q.OrderIndex,
                    Options = options
                };
            })
            .ToList();
    }

    private static QuizDto MapToDto(Quiz quiz)
    {
        return new QuizDto
        {
            Id = quiz.Id,
            Slug = quiz.Slug,
            Title = quiz.Title,
            Description = quiz.Description,
            Category = quiz.Category,
            QuestionCount = quiz.Questions.Count > 0 ? quiz.Questions.Count : quiz.QuestionCount,
            DurationMinutes = quiz.DurationMinutes,
            PassingScore = quiz.PassingScore,
            Difficulty = quiz.Difficulty,
            IsCustom = quiz.IsCustom,
            MentorId = quiz.MentorId,
            CreatedAt = quiz.CreatedAt,
            Questions = MapQuestions(quiz.Questions)
        };
    }

    private static QuizDetailDto MapToDetailDto(Quiz quiz)
    {
        var dto = new QuizDetailDto
        {
            Id = quiz.Id,
            Slug = quiz.Slug,
            Title = quiz.Title,
            Description = quiz.Description,
            Category = quiz.Category,
            QuestionCount = quiz.Questions.Count > 0 ? quiz.Questions.Count : quiz.QuestionCount,
            DurationMinutes = quiz.DurationMinutes,
            PassingScore = quiz.PassingScore,
            Difficulty = quiz.Difficulty,
            IsCustom = quiz.IsCustom,
            MentorId = quiz.MentorId,
            CreatedAt = quiz.CreatedAt,
            Questions = MapQuestions(quiz.Questions)
        };

        return dto;
    }

    private static QuizAttemptDto MapToAttemptDto(QuizAttempt attempt, Quiz? quiz)
    {
        var missedTopics = new List<string>();
        if (!string.IsNullOrWhiteSpace(attempt.AnswersJson))
        {
            try
            {
                var answers = JsonSerializer.Deserialize<List<QuizAnswerDto>>(attempt.AnswersJson, _jsonOptions);
                if (answers != null)
                {
                    missedTopics = answers
                        .Where(a => !a.IsCorrect && !string.IsNullOrWhiteSpace(a.Category))
                        .Select(a => a.Category!)
                        .Distinct()
                        .ToList();
                }
            }
            catch { }
        }

        if (missedTopics.Count == 0 && quiz != null && attempt.Percentage < attempt.PassingScore)
        {
            missedTopics.Add(quiz.Category);
        }

        return new QuizAttemptDto
        {
            Id = attempt.Id,
            QuizId = attempt.QuizId,
            QuizSlug = quiz?.Slug ?? string.Empty,
            QuizTitle = quiz?.Title ?? "Assessment",
            Category = quiz?.Category ?? "General",
            Difficulty = quiz?.Difficulty ?? QuizDifficulty.MEDIUM,
            UserId = attempt.UserId,
            UserName = attempt.UserName,
            UserEmail = attempt.UserEmail,
            Score = attempt.Score,
            TotalQuestions = attempt.TotalQuestions,
            Percentage = attempt.Percentage,
            PassingScore = attempt.PassingScore,
            Status = attempt.Status,
            TimeSpentSeconds = attempt.TimeSpentSeconds,
            TimeSpentFormatted = FormatDuration(attempt.TimeSpentSeconds),
            IsFlagged = attempt.IsFlagged,
            FlagReason = attempt.FlagReason,
            CompletedAt = attempt.CompletedAt,
            CohortWeek = attempt.CohortWeek,
            MissedTopics = missedTopics
        };
    }
}
