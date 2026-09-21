using System.Security.Claims;
using InternshipPlatform.BusinessLayer.Opportunity;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models.Application;
using InternshipPlatform.Domain.Models.Opportunity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

[ApiController]
public class OpportunityController(IOpportunityLogic opportunityLogic, IApplicationLogic applicationLogic)
    : ControllerBase
{
    private Guid? CurrentUserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    // ─── Public / Student ────────────────────────────────────────────────────

    /// <summary>GET /api/opportunities — paginated list with filters</summary>
    [HttpGet("api/opportunities")]
    [AllowAnonymous]
    public async Task<IActionResult> GetOpportunities([FromQuery] OpportunityQueryParams query)
    {
        var result = await opportunityLogic.GetOpportunitiesAsync(query, CurrentUserId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>GET /api/opportunities/{id} — full detail</summary>
    [HttpGet("api/opportunities/{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetOpportunityById(Guid id)
    {
        var result = await opportunityLogic.GetOpportunityByIdAsync(id, CurrentUserId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>POST /api/opportunities/{id}/save</summary>
    [HttpPost("api/opportunities/{id:guid}/save")]
    [Authorize]
    public async Task<IActionResult> SaveOpportunity(Guid id)
    {
        var result = await opportunityLogic.SaveOpportunityAsync(id, CurrentUserId!.Value);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>DELETE /api/opportunities/{id}/save</summary>
    [HttpDelete("api/opportunities/{id:guid}/save")]
    [Authorize]
    public async Task<IActionResult> UnsaveOpportunity(Guid id)
    {
        var result = await opportunityLogic.UnsaveOpportunityAsync(id, CurrentUserId!.Value);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>POST /api/opportunities/{id}/apply — multipart/form-data</summary>
    [HttpPost("api/opportunities/{id:guid}/apply")]
    [Authorize]
    public async Task<IActionResult> Apply(Guid id, [FromForm] SubmitApplicationDto dto)
    {
        var uploadedFiles = Request.Form.Files
            .Select(f => new UploadedFile(f.Name, f.FileName, f.OpenReadStream()))
            .ToList();

        var result = await applicationLogic.ApplyAsync(id, CurrentUserId!.Value, dto, uploadedFiles);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // ─── Student workspace ───────────────────────────────────────────────────

    /// <summary>GET /api/student/applications</summary>
    [HttpGet("api/student/applications")]
    [Authorize]
    public async Task<IActionResult> GetMyApplications()
    {
        var result = await applicationLogic.GetStudentApplicationsAsync(CurrentUserId!.Value);
        return Ok(result);
    }

    /// <summary>GET /api/student/applications/{id}</summary>
    [HttpGet("api/student/applications/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetMyApplication(Guid id)
    {
        var result = await applicationLogic.GetStudentApplicationByIdAsync(id, CurrentUserId!.Value);
        return result.Success ? Ok(result) : NotFound(result);
    }

    // ─── Mentor workspace ────────────────────────────────────────────────────

    /// <summary>GET /api/mentor/opportunities</summary>
    [HttpGet("api/mentor/opportunities")]
    [Authorize]
    public async Task<IActionResult> GetMentorOpportunities()
    {
        var result = await opportunityLogic.GetMentorOpportunitiesAsync(CurrentUserId!.Value);
        return Ok(result);
    }

    /// <summary>POST /api/mentor/opportunities</summary>
    [HttpPost("api/mentor/opportunities")]
    [Authorize]
    public async Task<IActionResult> CreateOpportunity([FromBody] CreateOpportunityDto dto)
    {
        var result = await opportunityLogic.CreateOpportunityAsync(dto, CurrentUserId!.Value);
        return result.Success ? CreatedAtAction(nameof(GetOpportunityById), new { id = result.Data!.Id }, result) : BadRequest(result);
    }

    /// <summary>PUT /api/mentor/opportunities/{id}</summary>
    [HttpPut("api/mentor/opportunities/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdateOpportunity(Guid id, [FromBody] CreateOpportunityDto dto)
    {
        var result = await opportunityLogic.UpdateOpportunityAsync(id, dto, CurrentUserId!.Value);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>PATCH /api/mentor/opportunities/{id}/status</summary>
    [HttpPatch("api/mentor/opportunities/{id:guid}/status")]
    [Authorize]
    public async Task<IActionResult> PatchStatus(Guid id, [FromBody] PatchOpportunityStatusDto dto)
    {
        var result = await opportunityLogic.PatchOpportunityStatusAsync(id, dto.Status, CurrentUserId!.Value);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>GET /api/mentor/opportunities/{id}/applications</summary>
    [HttpGet("api/mentor/opportunities/{id:guid}/applications")]
    [Authorize]
    public async Task<IActionResult> GetApplicationsByOpportunity(Guid id)
    {
        var result = await applicationLogic.GetApplicationsByOpportunityAsync(id, CurrentUserId!.Value);
        return Ok(result);
    }

    /// <summary>GET /api/mentor/applications/{applicationId}/review</summary>
    [HttpGet("api/mentor/applications/{applicationId:guid}/review")]
    [Authorize]
    public async Task<IActionResult> GetApplicationForReview(Guid applicationId)
    {
        var result = await applicationLogic.GetApplicationForReviewAsync(applicationId, CurrentUserId!.Value);
        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>POST /api/mentor/applications/{applicationId}/review</summary>
    [HttpPost("api/mentor/applications/{applicationId:guid}/review")]
    [Authorize]
    public async Task<IActionResult> ReviewApplication(Guid applicationId, [FromBody] ReviewApplicationDto dto)
    {
        var result = await applicationLogic.ReviewApplicationAsync(applicationId, CurrentUserId!.Value, dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>GET /api/documents/{documentId:guid}/download</summary>
    [HttpGet("api/documents/{documentId:guid}/download")]
    [Authorize]
    public async Task<IActionResult> DownloadDocument(Guid documentId)
    {
        try
        {
            var (stream, contentType, fileName) = await applicationLogic.DownloadDocumentAsync(documentId, CurrentUserId!.Value);
            return File(stream, contentType, fileName);
        }
        catch (FileNotFoundException)
        {
            return NotFound();
        }
    }
}
