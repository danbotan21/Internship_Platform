namespace InternshipPlatform.BusinessLayer.Admin.Dashboard;

public interface IAdminDashboardService
{
    Task<AdminDashboardDto> GetDashboardAsync(CancellationToken cancellationToken = default);
}
