using InternshipPlatform.BusinessLayer.Admin.Dashboard;
using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.DataAccess.Admin.Dashboard;

public class AdminDashboardService(AppDbContext context) : IAdminDashboardService
{
    private const int AttentionItems = 5;
    private static readonly TimeSpan RecentWindow = TimeSpan.FromDays(7);

    public async Task<AdminDashboardDto> GetDashboardAsync(CancellationToken cancellationToken = default)
    {
        // Queries run one after another: a DbContext does not support parallel operations.
        var recentSince = DateTimeOffset.UtcNow - RecentWindow;

        var users = new UserStatsDto(
            Active: await context.Users.CountAsync(u => u.Status == UserStatus.Active, cancellationToken),
            Deactivated: await context.Users.CountAsync(u => u.Status == UserStatus.Deactivated, cancellationToken),
            DeactivatedLast7Days: await context.Users.CountAsync(
                u => u.Status == UserStatus.Deactivated && u.DeactivatedAt >= recentSince,
                cancellationToken));

        var companies = new CompanyStatsDto(
            Total: await context.Companies.CountAsync(cancellationToken),
            Suspended: await context.Companies.CountAsync(c => c.Status == CompanyStatus.Suspended, cancellationToken));

        var pending = context.CompanyVerificationRequests
            .AsNoTracking()
            .Where(r => r.Status == VerificationStatus.Pending);

        var oldestPending = await pending
            .OrderBy(r => r.CreatedAt)
            .ThenBy(r => r.Id)
            .Take(AttentionItems)
            .Select(r => new PendingVerificationDto(r.Id, r.LegalName, r.RequesterName, r.CreatedAt))
            .ToListAsync(cancellationToken);

        var verification = new VerificationStatsDto(
            Pending: await pending.CountAsync(cancellationToken),
            OldestPendingSubmittedAt: oldestPending.FirstOrDefault()?.SubmittedAt,
            OldestPending: oldestPending);

        return new AdminDashboardDto(users, companies, verification);
    }
}
