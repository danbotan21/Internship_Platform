using InternshipPlatform.BusinessLayer.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;

namespace InternshipPlatform.API.Controllers;

// The author, a listed collaborator or the assigned mentor may open a file.
// The business layer checks access to each individual contribution.
[ApiController]
[Authorize(Roles = "Student,Mentor,Company")]
[Route("api/contributions/evidence")]
public sealed class ContributionEvidenceFilesController : ContributionControllerBase
{
    private readonly IContributionAction _contributionAction;

    public ContributionEvidenceFilesController(IContributionAction contributionAction)
    {
        _contributionAction = contributionAction;
    }

    [HttpGet("{evidenceId:guid}/file")]
    public async Task<IActionResult> DownloadEvidenceFile(Guid evidenceId, CancellationToken ct)
    {
        var result = await _contributionAction.OpenEvidenceFileAsync(evidenceId, CurrentUserId, ct);
        if (!result.IsSuccess)
        {
            return ToActionResult(result);
        }

        var file = result.Data!;
        Response.Headers[HeaderNames.XContentTypeOptions] = "nosniff";
        Response.Headers[HeaderNames.ContentDisposition] = new ContentDispositionHeaderValue("inline")
        {
            FileNameStar = file.FileName
        }.ToString();
        return File(file.Content, file.ContentType);
    }
}
