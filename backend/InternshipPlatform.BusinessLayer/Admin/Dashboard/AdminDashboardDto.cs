namespace InternshipPlatform.BusinessLayer.Admin.Dashboard;

public sealed record AdminDashboardDto(
    UserStatsDto Users,
    CompanyStatsDto Companies,
    VerificationStatsDto Verification);

public sealed record UserStatsDto(
    int Active,
    int Deactivated,
    int DeactivatedLast7Days);

public sealed record CompanyStatsDto(
    int Total,
    int Suspended);

public sealed record VerificationStatsDto(
    int Pending,
    DateTimeOffset? OldestPendingSubmittedAt,
    IReadOnlyList<PendingVerificationDto> OldestPending);

public sealed record PendingVerificationDto(
    Guid Id,
    string LegalName,
    string RequesterName,
    DateTimeOffset SubmittedAt);
