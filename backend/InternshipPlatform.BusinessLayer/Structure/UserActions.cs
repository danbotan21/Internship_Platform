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


    public UserActions()
    {
        _context = new AppDbContext();
        //_tokenService = new TokenService();
        //_emailLogic = new EmailLogic();
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
