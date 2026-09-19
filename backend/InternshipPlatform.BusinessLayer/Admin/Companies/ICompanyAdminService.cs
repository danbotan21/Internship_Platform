namespace InternshipPlatform.BusinessLayer.Admin.Companies;

public interface ICompanyAdminService
{
    Task<CompanyListResultDto> GetCompaniesAsync(
        CompanyListQuery query,
        CancellationToken cancellationToken = default);

    Task<CompanyDetailDto?> GetCompanyAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<CompanyActionResult> SuspendAsync(
        Guid id,
        string reason,
        Guid? actorUserId,
        CancellationToken cancellationToken = default);

    Task<CompanyActionResult> RestoreAsync(
        Guid id,
        string reason,
        Guid? actorUserId,
        CancellationToken cancellationToken = default);
}
