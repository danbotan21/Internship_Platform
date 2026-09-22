namespace InternshipPlatform.BusinessLayer.Admin.Users;

public interface IUserDirectoryService
{
    Task<UserDirectoryResultDto> GetDirectoryAsync(
        UserDirectoryQuery query,
        CancellationToken cancellationToken = default);

    Task<UserDetailDto?> GetUserAsync(
        Guid id,
        CancellationToken cancellationToken = default);
}