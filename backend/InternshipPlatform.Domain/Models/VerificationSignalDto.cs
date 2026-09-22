using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Models;

public enum VerificationSignalStatus
{
    [JsonStringEnumMemberName("passed")]
    Passed = 1,

    [JsonStringEnumMemberName("info")]
    Info = 2,

    [JsonStringEnumMemberName("warning")]
    Warning = 3,

    [JsonStringEnumMemberName("failed")]
    Failed = 4
}

// An automatic check the platform ran on a piece of evidence.
public sealed class VerificationSignalDto
{
    public string Code { get; set; } = string.Empty;

    public string Label { get; set; } = string.Empty;

    public VerificationSignalStatus Status { get; set; }
}
