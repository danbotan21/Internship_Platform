using System.Security.Claims;
using InternshipPlatform.BusinessLayer.Quizzes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

[ApiController]
[Route("api/quizzes")]
public class QuizzesController : ControllerBase
{
    private readonly IQuizService _quizService;
    private readonly ILogger<QuizzesController> _logger;

    public QuizzesController(IQuizService quizService, ILogger<QuizzesController> logger)
    {
        _quizService = quizService;
        _logger = logger;
    }

    private Guid? CurrentUserId => User.TryGetUserId();
    private string CurrentUserName => User.FindFirstValue(ClaimTypes.Name) ?? User.FindFirstValue("name") ?? "Student";
    private string CurrentUserEmail => User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email") ?? "student@internflow.dev";

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllQuizzes(CancellationToken ct)
    {
        var quizzes = await _quizService.GetQuizzesAsync(ct);
        return Ok(quizzes);
    }

    [HttpGet("{idOrSlug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetQuizByIdOrSlug(string idOrSlug, CancellationToken ct)
    {
        var quiz = await _quizService.GetQuizByIdOrSlugAsync(idOrSlug, ct);
        if (quiz == null) return NotFound(new { error = $"Quiz '{idOrSlug}' not found." });
        return Ok(quiz);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateCustomQuiz([FromBody] CreateQuizDto dto, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
        {
            return BadRequest(new { error = "Quiz title is required." });
        }

        var created = await _quizService.CreateCustomQuizAsync(dto, CurrentUserId, ct);
        return CreatedAtAction(nameof(GetQuizByIdOrSlug), new { idOrSlug = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdateCustomQuiz(Guid id, [FromBody] CreateQuizDto dto, CancellationToken ct)
    {
        var updated = await _quizService.UpdateCustomQuizAsync(id, dto, CurrentUserId, ct);
        if (updated == null) return NotFound(new { error = $"Custom quiz with ID '{id}' not found." });
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteCustomQuiz(Guid id, CancellationToken ct)
    {
        var success = await _quizService.DeleteCustomQuizAsync(id, CurrentUserId, ct);
        if (!success) return NotFound(new { error = $"Custom quiz with ID '{id}' not found." });
        return NoContent();
    }

    [HttpPost("{idOrSlug}/attempts")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitQuizAttempt(string idOrSlug, [FromBody] SubmitQuizAttemptDto dto, CancellationToken ct)
    {
        if (Guid.TryParse(idOrSlug, out var quizGuid))
        {
            dto.QuizId = quizGuid;
        }
        else
        {
            dto.QuizSlug = idOrSlug;
        }

        var attempt = await _quizService.SubmitAttemptAsync(dto, CurrentUserId, CurrentUserName, CurrentUserEmail, ct);
        return Ok(attempt);
    }

    [HttpPost("attempts")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitAttempt([FromBody] SubmitQuizAttemptDto dto, CancellationToken ct)
    {
        var attempt = await _quizService.SubmitAttemptAsync(dto, CurrentUserId, CurrentUserName, CurrentUserEmail, ct);
        return Ok(attempt);
    }

    [HttpGet("attempts/my")]
    [Authorize]
    public async Task<IActionResult> GetMyAttempts(CancellationToken ct)
    {
        var attempts = await _quizService.GetUserAttemptsAsync(CurrentUserId, CurrentUserEmail, ct);
        return Ok(attempts);
    }

    [HttpGet("analytics")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAnalytics([FromQuery] string? quizId, CancellationToken ct)
    {
        var analytics = await _quizService.GetAnalyticsSummaryAsync(quizId, ct);
        return Ok(analytics);
    }
}
