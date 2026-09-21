using InternshipPlatform.BusinessLayer.Progress;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

[ApiController]
[Route("api/progress")]
[Authorize]
public class ProgressController(IProgressService progressService) : ControllerBase
{
    [HttpGet("me")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<StudentProgressDto>> GetMyProgress()
    {
        try
        {
            return Ok(await progressService.GetStudentProgressAsync(User.GetUserId()));
        }
        catch (StudentNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("students")]
    [Authorize(Roles = "Mentor,Admin,Company")]
    public async Task<ActionResult<List<StudentSummaryDto>>> GetStudents()
        => Ok(await progressService.GetStudentSummariesAsync());

    [HttpGet("students/{studentId:guid}")]
    [Authorize(Roles = "Mentor,Admin,Company")]
    public async Task<ActionResult<StudentProgressDto>> GetStudentProgress(Guid studentId)
    {
        try
        {
            return Ok(await progressService.GetStudentProgressAsync(studentId));
        }
        catch (StudentNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("tasks")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<TaskLogEntryDto>> LogTask(LogTaskRequest request)
    {
        try
        {
            return Ok(await progressService.LogTaskAsync(User.GetUserId(), request));
        }
        catch (InvalidTaskLogException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("milestones/{milestoneId:guid}")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<MilestoneDto>> UpdateMilestone(Guid milestoneId, UpdateMilestoneRequest request)
    {
        try
        {
            return Ok(await progressService.UpdateMilestoneAsync(milestoneId, User.GetUserId(), request));
        }
        catch (MilestoneNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (MilestonePermissionException)
        {
            return Forbid();
        }
    }

    [HttpPost("students/{studentId:guid}/feedback")]
    [Authorize(Roles = "Mentor,Admin")]
    public async Task<ActionResult<FeedbackDto>> SubmitFeedback(Guid studentId, SubmitFeedbackRequest request)
    {
        try
        {
            return Ok(await progressService.SubmitFeedbackAsync(studentId, User.GetUserId(), request));
        }
        catch (StudentNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidRatingException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
