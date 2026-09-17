using System;
using System.Collections.Generic;
using System.Text;
using static InternshipPlatform.Domain.Entities.User;
using InternshipPlatform.Domain.Models.User;

namespace InternshipPlatform.BusinessLayer.Interfaces;

public class IUserLogic
{
    ServiceResponse GetUserList();
}
