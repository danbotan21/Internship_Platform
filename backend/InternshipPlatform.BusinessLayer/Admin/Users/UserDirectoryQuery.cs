using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.BusinessLayer.Admin.Users;

public sealed record UserDirectoryQuery
{
    public UserDirectoryScope Scope { get; init; } = UserDirectoryScope.All;
    public string? Search { get; init; }
    public DirectoryRole? Role { get; init; }
    public UserStatus? Status { get; init; }
    public Guid? CompanyId { get; init; }
    public UserDirectorySort Sort { get; init; } = UserDirectorySort.NameAsc;
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}