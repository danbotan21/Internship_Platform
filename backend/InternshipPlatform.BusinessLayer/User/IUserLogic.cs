using InternshipPlatform.Domain.Models.Common;

namespace InternshipPlatform.BusinessLayer.Users;

public interface IUserLogic
{
    Task<ApiResponse<UserProfileDto>> GetProfileAsync(Guid userId);
    Task<ApiResponse<string?>> GetCompanyInfoAsync(Guid mentorId);
}

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
