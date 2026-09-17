using InternshipPlatform.Domain.Entities.User;
using InternshipPlatform.Domain.Models.User;
using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.BusinessLayer.Structure;

public class UserActions
{
    private readonly AppDbContext _context;
    //private readonly TokenService _tokenService;
    //private readonly EmailLogic _emailLogic;


    public UserActions(AppDbContext context)
    {
        _context = context;
    }

    public UserEntity? GetUserByIdAction(int userId)
    {
        return _context.Users
            .FirstOrDefault(x => x.Id == userId);
    }

    public Opportunity CreateOpportunityAction(Opportunity opportunity)
    {
        _context.Opportunities.Add(opportunity);
        _context.SaveChanges();

        return opportunity;
    }

    public List<UserDirectoryDto> GetUserListAction()
    {
        return _context.Users.Select(u => new UserDirectoryDto
        {
            Id = u.Id,
            Name = u.Name,
            Email = u.Email,
            Status = u.Status,
            Role = u.Role,
            Organisation = u.Organisation,
            //TwoFactorEnabled = u.TwoFactorEnabled,
        }).ToList();
    }
}
