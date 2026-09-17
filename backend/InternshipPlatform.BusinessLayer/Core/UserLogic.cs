using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.BusinessLayer.Structure;
using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models.Opportunity;
using InternshipPlatform.Domain.Models.Service;
using InternshipPlatform.Domain.Entities.User;

namespace InternshipPlatform.BusinessLayer.Core;

public class UserLogic : UserActions, IUserLogic
{
    public UserLogic(AppDbContext context)
        : base(context)
    {
    }

    public ServiceResponse GetUserList()
    {
        var userList = GetUserListAction();
        return new ServiceResponse
        {
            IsSuccess = true,
            Data = userList
        };
    }

    public ServiceResponse CreateOpportunity(CreateOpportunityDto dto, int userId)
    {
        var user = GetUserByIdAction(userId);

        if (user == null)
        {
            return new ServiceResponse
            {
                IsSuccess = false,
                Message = "User not found."
            };
        }

        if (user.Role != UserRole.Mentor && user.Role != UserRole.Admin)
        {
            return new ServiceResponse
            {
                IsSuccess = false,
                Message = "User is not allowed to create an opportunity."
            };
        }

        var opportunity = new Opportunity
        {
            Title = dto.Title,
            CreatedByUserId = userId
        };

        CreateOpportunityAction(opportunity);

        return new ServiceResponse
        {
            IsSuccess = true,
            Data = opportunity
        };
    }
}
