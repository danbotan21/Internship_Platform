using InternshipPlatform.Domain.Entities.User;
using InternshipPlatform.Domain.Models.Opportunity;
using InternshipPlatform.Domain.Models.Service;
using InternshipPlatform.Domain.Models.User;
using System;
using System.Collections.Generic;
using System.Text;

namespace InternshipPlatform.BusinessLayer.Interfaces;

public interface IUserLogic
{
    ServiceResponse GetUserList();

    ServiceResponse CreateOpportunity(CreateOpportunityDto dto, int userId);
}
