using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

[ApiController]
[Route("api/recordings")]
public class QuizRecordingsController : ControllerBase
{
    private readonly ILogger<QuizRecordingsController> _logger;

    public QuizRecordingsController(ILogger<QuizRecordingsController> logger)
    {
        _logger = logger;
    }

    private static string GetRecordingsDirectory()
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

        return recordingsDir;
    }

    public class RecordingUploadJsonDto
    {
        public string? Filename { get; set; }
        public string? VideoBase64 { get; set; }
        public JsonElement? Metadata { get; set; }
    }

    [HttpPost("upload")]
    [HttpPost("/api/save-recording")]
    [RequestSizeLimit(100_000_000)] // 100 MB max
    public async Task<IActionResult> UploadRecording([FromForm] RecordingUploadForm form)
    {
        try
        {
            var recordingsDir = GetRecordingsDirectory();
            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");

            // Check if request is JSON body
            if (Request.HasJsonContentType())
            {
                using var reader = new StreamReader(Request.Body);
                var bodyText = await reader.ReadToEndAsync();
                var jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var dto = JsonSerializer.Deserialize<RecordingUploadJsonDto>(bodyText, jsonOptions);

                var jsonBaseName = !string.IsNullOrWhiteSpace(dto?.Filename)
                    ? Path.GetFileNameWithoutExtension(dto.Filename)
                    : $"quiz_session_{timestamp}";
                var jsonExt = !string.IsNullOrWhiteSpace(dto?.Filename)
                    ? Path.GetExtension(dto.Filename)
                    : ".webm";
                if (string.IsNullOrWhiteSpace(jsonExt)) jsonExt = ".webm";

                string? jsonVideoPath = null;
                string? jsonMetaPath = null;

                if (!string.IsNullOrWhiteSpace(dto?.VideoBase64))
                {
                    var videoBytes = Convert.FromBase64String(dto.VideoBase64);
                    var videoFileName = $"{jsonBaseName}{jsonExt}";
                    var videoFilePath = Path.Combine(recordingsDir, videoFileName);
                    await System.IO.File.WriteAllBytesAsync(videoFilePath, videoBytes);
                    jsonVideoPath = $"recorded-sessions/{videoFileName}";
                    _logger.LogInformation("Saved quiz video recording (JSON base64): {Path}", videoFilePath);
                }

                if (dto?.Metadata.HasValue == true)
                {
                    var metaFileName = $"{jsonBaseName}_meta.json";
                    var metaFilePath = Path.Combine(recordingsDir, metaFileName);
                    await System.IO.File.WriteAllTextAsync(metaFilePath, dto.Metadata.Value.GetRawText());
                    jsonMetaPath = $"recorded-sessions/{metaFileName}";
                    _logger.LogInformation("Saved quiz session metadata (JSON): {Path}", metaFilePath);
                }

                return Ok(new
                {
                    success = true,
                    message = "Recording and session metadata archived successfully.",
                    videoPath = jsonVideoPath,
                    metadataPath = jsonMetaPath,
                    fileName = jsonBaseName
                });
            }

            var baseName = !string.IsNullOrWhiteSpace(form.Filename)
                ? Path.GetFileNameWithoutExtension(form.Filename)
                : $"quiz_session_{timestamp}";

            string? savedVideoPath = null;
            string? savedMetaPath = null;

            // 1. Save video file if present
            if (form.Video != null && form.Video.Length > 0)
            {
                var ext = Path.GetExtension(form.Video.FileName);
                if (string.IsNullOrWhiteSpace(ext)) ext = ".webm";

                var videoFileName = $"{baseName}{ext}";
                var videoFilePath = Path.Combine(recordingsDir, videoFileName);

                using (var stream = new FileStream(videoFilePath, FileMode.Create))
                {
                    await form.Video.CopyToAsync(stream);
                }

                savedVideoPath = $"recorded-sessions/{videoFileName}";
                _logger.LogInformation("Saved quiz video recording: {Path}", videoFilePath);
            }

            // 2. Save metadata JSON if present
            if (!string.IsNullOrWhiteSpace(form.Metadata))
            {
                var metaFileName = $"{baseName}_meta.json";
                var metaFilePath = Path.Combine(recordingsDir, metaFileName);

                await System.IO.File.WriteAllTextAsync(metaFilePath, form.Metadata);
                savedMetaPath = $"recorded-sessions/{metaFileName}";
                _logger.LogInformation("Saved quiz session metadata: {Path}", metaFilePath);
            }

            return Ok(new
            {
                success = true,
                message = "Recording and session metadata archived successfully.",
                videoPath = savedVideoPath,
                metadataPath = savedMetaPath,
                fileName = baseName
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save quiz recording.");
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    [HttpGet]
    public IActionResult ListRecordings()
    {
        try
        {
            var recordingsDir = GetRecordingsDirectory();
            var metaFiles = Directory.GetFiles(recordingsDir, "*_meta.json");

            var results = new List<object>();
            foreach (var metaFile in metaFiles)
            {
                try
                {
                    var content = System.IO.File.ReadAllText(metaFile);
                    var json = JsonSerializer.Deserialize<JsonElement>(content);
                    results.Add(new
                    {
                        file = Path.GetFileName(metaFile),
                        data = json
                    });
                }
                catch
                {
                    // Skip malformed files
                }
            }

            return Ok(new { count = results.Count, recordings = results });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to list recordings.");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

public sealed class RecordingUploadForm
{
    public IFormFile? Video { get; set; }
    public string? Metadata { get; set; }
    public string? Filename { get; set; }
}
