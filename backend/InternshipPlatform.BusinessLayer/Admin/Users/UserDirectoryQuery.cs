using InternshipPlatform.Domain;
using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.BusinessLayer.Admin.Users;

public sealed record UserDirectoryQuery
{
    public UserDirectoryScope Scope { get; init; } = UserDirectoryScope.All;
    public string? Search { get; init; }

    /// <summary>Filters on the account's platform role (Student, Mentor, Company, Admin).</summary>
    public UserRole? PlatformRole { get; init; }

    /// <summary>Filters on the role the person holds inside their company, if any.</summary>
    public CompanyRole? CompanyRole { get; init; }

    public UserStatus? Status { get; init; }
    public Guid? CompanyId { get; init; }
    public UserDirectorySort Sort { get; init; } = UserDirectorySort.NameAsc;
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
