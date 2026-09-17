using System;
using System.Collections.Generic;
using System.Text;
using InternshipPlatform.Domain.Entities.User;
using InternshipPlatform.Domain.Models.User;
using InternshipPlatform.Domain.Models.Service;

namespace InternshipPlatform.BusinessLayer.Interfaces;

public interface IUserLogic
{
    ServiceResponse GetUserList();
}
