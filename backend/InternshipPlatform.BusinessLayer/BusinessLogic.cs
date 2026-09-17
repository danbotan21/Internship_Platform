using InternshipPlatform.BusinessLayer.Core;
using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.BusinessLayer.Structure;
using InternshipPlatform.DataAccess.Context;

namespace InternshipPlatform.BusinessLayer;

public class BusinessLogic
{
    private readonly AppDbContext _context;

    public BusinessLogic(AppDbContext context)
    {
        _context = context;
    }

    // UserLogic
    public IUserLogic GetUserLogic()
    {
        return new UserLogic(_context);
    }
}
