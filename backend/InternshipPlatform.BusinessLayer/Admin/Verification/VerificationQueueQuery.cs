using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.BusinessLayer.Admin.Verification;

public sealed record VerificationQueueQuery
{
    public VerificationStatus Status { get; init; } = VerificationStatus.Pending;
    public string? Search { get; init; }
    public VerificationQueueSort Sort { get; init; } = VerificationQueueSort.OldestFirst;
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

public enum VerificationQueueSort
{
    OldestFirst,
    NewestFirst
}
