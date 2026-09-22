using InternshipPlatform.BusinessLayer.Common;

namespace InternshipPlatform.BusinessLayer.Admin.Users;

public sealed record UserDirectoryResultDto(
    PagedResult<UserListItemDto> Users,
    UserDirectoryCountsDto Counts);

public sealed record UserDirectoryCountsDto(
    int All,
    int CompanyMembers,
    int Admins);