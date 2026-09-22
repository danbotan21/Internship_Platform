namespace InternshipPlatform.Domain.Models;

// One requirement the contribution must meet before it can be (re)submitted.
public sealed class SubmissionCheckDto
{
    public string Code { get; set; } = string.Empty;

    public string Label { get; set; } = string.Empty;

    public bool Passed { get; set; }

    public string? Detail { get; set; }
}
