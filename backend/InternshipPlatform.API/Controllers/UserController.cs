using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.Domain.Models.Opportunity;
using InternshipPlatform.Domain.Models.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InternshipPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserLogic _userLogic;

        //public UserController()
        //{
        //    var bl = new BusinessLogic();
        //    _userLogic = bl.GetUserLogic();
        //}creaz

        public UserController(IUserLogic userLogic)
        {
            _userLogic = userLogic;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("GetAllUsers")]
        public IActionResult GetUserList()
        {
            var response = _userLogic.GetUserList();
            return Ok(response.Data);
        }

        //[Authorize(Roles = "Mentor,Admin")]
        [HttpPost("CreateOpportunity")] 
        public IActionResult CreateOpportunity([FromBody] CreateOpportunityDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            int userId = int.Parse(userIdClaim.Value);

            var response = _userLogic.CreateOpportunity(dto, userId);

            if (!response.IsSuccess)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }
    }
}
