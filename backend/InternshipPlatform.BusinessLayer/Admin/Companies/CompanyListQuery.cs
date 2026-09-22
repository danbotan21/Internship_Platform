using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.BusinessLayer.Admin.Companies;

public sealed record CompanyListQuery
{
    public CompanyStatus Status { get; init; } = CompanyStatus.Active;
    public string? Search { get; init; }
    public CompanyListSort Sort { get; init; } = CompanyListSort.NameAsc;
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

public enum CompanyListSort
{
    NameAsc,
    NameDesc
}
