using InternshipPlatform.Domain.Models.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserLogic _userLogic;

        public UserController()
        {
            var bl = new BusinessLogic();
            _userLogic = bl.GetUserLogic();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("GetAllUsers")]
        public IActionResult GetUserList()
        {
            var response = _userLogic.GetUserList();
            return Ok(response.Data);
        }
    }
}
