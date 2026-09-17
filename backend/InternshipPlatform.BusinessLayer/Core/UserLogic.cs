using System;
using System.Collections.Generic;
using System.Text;
using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.BusinessLayer.Structure;
using InternshipPlatform.Domain.Models.Service;

namespace InternshipPlatform.BusinessLayer.Core;

public class UserLogic : UserActions, IUserLogic
{
    public ServiceResponse GetUserList()
    {
        var userList = GetUserListAction();
        return new ServiceResponse
        {
            IsSuccess = true,
            Data = userList
        };
    }
}
