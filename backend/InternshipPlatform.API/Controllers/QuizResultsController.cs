using System.Text.Json;
using InternshipPlatform.BusinessLayer.Quizzes;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

[ApiController]
[Route("api/quiz-results")]
public class QuizResultsController : ControllerBase
{
    private readonly IQuizService _quizService;
    private readonly ILogger<QuizResultsController> _logger;

    public QuizResultsController(IQuizService quizService, ILogger<QuizResultsController> logger)
    {
        _quizService = quizService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetQuizResults(CancellationToken ct)
    {
        try
        {
            var summary = await _quizService.GetAnalyticsSummaryAsync(null, ct);
            return Ok(summary.RecentAttempts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to read quiz results from PostgreSQL.");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> SaveQuizResult([FromBody] JsonElement attempt, CancellationToken ct)
    {
        try
        {
            // Parse attempt payload
            var quizIdStr = attempt.TryGetProperty("quizId", out var qidProp) ? qidProp.GetString() : null;
            var userName = attempt.TryGetProperty("userName", out var nameProp) ? nameProp.GetString() : "Student";
            var userEmail = attempt.TryGetProperty("userEmail", out var emailProp) ? emailProp.GetString() : "student@internflow.dev";
            var score = attempt.TryGetProperty("score", out var scoreProp) ? scoreProp.GetInt32() : 0;
            var total = attempt.TryGetProperty("totalQuestions", out var totalProp) ? totalProp.GetInt32() : 10;
            var percentage = attempt.TryGetProperty("percentage", out var pctProp) ? pctProp.GetInt32() : 0;
            var passingScore = attempt.TryGetProperty("passingScore", out var passProp) ? passProp.GetInt32() : 70;
            var status = attempt.TryGetProperty("status", out var statProp) ? statProp.GetString() : (percentage >= passingScore ? "PASSED" : "FAILED");
            var timeSpentSeconds = attempt.TryGetProperty("timeSpentSeconds", out var timeProp) ? timeProp.GetInt32() : 0;
            var isFlagged = attempt.TryGetProperty("isFlagged", out var flagProp) && flagProp.GetBoolean();
            var flagReason = attempt.TryGetProperty("flagReason", out var reasonProp) ? reasonProp.GetString() : null;
            var cohortWeek = attempt.TryGetProperty("cohortWeek", out var weekProp) ? weekProp.GetInt32() : 8;

            var submitDto = new SubmitQuizAttemptDto
            {
                QuizSlug = quizIdStr,
                Score = score,
                TotalQuestions = total,
                Percentage = percentage,
                PassingScore = passingScore,
                Status = status ?? "PASSED",
                TimeSpentSeconds = timeSpentSeconds,
                IsFlagged = isFlagged,
                FlagReason = flagReason,
                CohortWeek = cohortWeek
            };

            if (Guid.TryParse(quizIdStr, out var qGuid))
            {
                submitDto.QuizId = qGuid;
            }

            var saved = await _quizService.SubmitAttemptAsync(submitDto, null, userName ?? "Student", userEmail ?? "student@internflow.dev", ct);
            return Ok(new { success = true, attempt = saved });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save quiz result to PostgreSQL.");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
