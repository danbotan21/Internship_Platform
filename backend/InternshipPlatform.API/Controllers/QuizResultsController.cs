using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

[ApiController]
[Route("api/quiz-results")]
public class QuizResultsController : ControllerBase
{
    private readonly ILogger<QuizResultsController> _logger;

    public QuizResultsController(ILogger<QuizResultsController> logger)
    {
        _logger = logger;
    }

    private static string GetDatabaseFilePath()
    {
        var current = new DirectoryInfo(AppContext.BaseDirectory);
        while (current != null &&
               !System.IO.File.Exists(Path.Combine(current.FullName, "InternshipPlatform.slnx")) &&
               !Directory.Exists(Path.Combine(current.FullName, ".git")))
        {
            current = current.Parent;
        }

        var repoRoot = current?.FullName ?? Directory.GetCurrentDirectory();
        var recordingsDir = Path.Combine(repoRoot, "recorded-sessions");

        if (!Directory.Exists(recordingsDir))
        {
            Directory.CreateDirectory(recordingsDir);
        }

        return Path.Combine(recordingsDir, "quiz_results.json");
    }

    [HttpGet]
    public async Task<IActionResult> GetQuizResults()
    {
        try
        {
            var filePath = GetDatabaseFilePath();
            if (!System.IO.File.Exists(filePath))
            {
                return Ok(Array.Empty<object>());
            }

            var json = await System.IO.File.ReadAllTextAsync(filePath);
            var results = JsonSerializer.Deserialize<JsonElement>(json);
            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to read quiz results from database.");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> SaveQuizResult([FromBody] JsonElement attempt)
    {
        try
        {
            var filePath = GetDatabaseFilePath();
            List<JsonElement> existingList = new();

            if (System.IO.File.Exists(filePath))
            {
                try
                {
                    var existingJson = await System.IO.File.ReadAllTextAsync(filePath);
                    var parsed = JsonSerializer.Deserialize<List<JsonElement>>(existingJson);
                    if (parsed != null)
                    {
                        existingList = parsed;
                    }
                }
                catch
                {
                    existingList = new();
                }
            }

            string? newId = null;
            if (attempt.TryGetProperty("id", out var idProp))
            {
                newId = idProp.GetString();
            }

            // Remove existing attempt with same ID if any
            if (!string.IsNullOrEmpty(newId))
            {
                existingList.RemoveAll(item =>
                    item.TryGetProperty("id", out var existingId) && existingId.GetString() == newId);
            }

            existingList.Insert(0, attempt);

            var options = new JsonSerializerOptions { WriteIndented = true };
            var updatedJson = JsonSerializer.Serialize(existingList, options);
            await System.IO.File.WriteAllTextAsync(filePath, updatedJson);

            _logger.LogInformation("Saved quiz attempt {Id} to results database.", newId);
            return Ok(new { success = true, count = existingList.Count, attempt });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to write quiz result to database.");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
