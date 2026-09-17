using InternshipPlatform.BusinessLayer.Core;
using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.BusinessLayer.Structure;

namespace InternshipPlatform.BusinessLayer;

public class BusinessLogic
{
    public BusinessLogic() { }

    // UserLogic
    public IUserLogic GetUserLogic()
    {
        return new UserLogic();
    }
}
