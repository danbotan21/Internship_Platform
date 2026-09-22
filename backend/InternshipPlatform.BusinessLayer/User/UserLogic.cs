using InternshipPlatform.Domain.Models.Common;

namespace InternshipPlatform.BusinessLayer.Users;

public class UserLogic(UserActions actions) : IUserLogic
{
    public async Task<ApiResponse<UserProfileDto>> GetProfileAsync(Guid userId)
    {
        var user = await actions.GetByIdAsync(userId);
        if (user is null)
            return ApiResponse<UserProfileDto>.Fail("User not found.");

        return ApiResponse<UserProfileDto>.Ok(new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role.ToString()
        });
    }

    public async Task<ApiResponse<string?>> GetCompanyInfoAsync(Guid mentorId)
    {
        var user = await actions.GetByIdAsync(mentorId);
        if (user is null)
            return ApiResponse<string?>.Fail("Mentor not found.");

        // Company info is the FullName for now; can be extended with a Company entity
        return ApiResponse<string?>.Ok(user.FullName);
    }
}
