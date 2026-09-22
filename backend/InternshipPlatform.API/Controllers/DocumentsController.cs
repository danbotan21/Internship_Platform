using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using InternshipPlatform.BusinessLayer.DTOs;
using InternshipPlatform.BusinessLayer.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    /// <summary>
    /// Retrieves documents from the vault with optional category, status, search, and mandatory filters.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<DocumentDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<DocumentDto>>> GetDocuments(
        [FromQuery] string? category = null,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null,
        [FromQuery] bool? mandatoryOnly = null,
        [FromQuery] string? userRole = null)
    {
        var docs = await _documentService.GetDocumentsAsync(category, status, search, mandatoryOnly, userRole);
        return Ok(docs);
    }

    /// <summary>
    /// Retrieves a single document by its ID, including its version history and audit timeline.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(DocumentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DocumentDto>> GetDocumentById(Guid id)
    {
        var doc = await _documentService.GetDocumentByIdAsync(id);
        if (doc == null)
        {
            return NotFound(new { message = $"Document with ID {id} was not found." });
        }
        return Ok(doc);
    }

    /// <summary>
    /// Uploads a new document to the vault (supports PDF, DOCX, XLSX).
    /// </summary>
    [HttpPost("upload")]
    [Consumes("multipart/form-data", "application/json")]
    [ProducesResponseType(typeof(DocumentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<DocumentDto>> UploadDocument(
        [FromForm] IFormFile? file,
        [FromForm] string? title,
        [FromForm] string? category,
        [FromForm] string? visibilityRole,
        [FromForm] bool isMandatory = false,
        [FromForm] string? uploadedBy = null)
    {
        CreateDocumentDto dto;

        if (file != null && file.Length > 0)
        {
            dto = new CreateDocumentDto
            {
                Title = !string.IsNullOrWhiteSpace(title) ? title : Path.GetFileNameWithoutExtension(file.FileName),
                FileName = file.FileName,
                Category = !string.IsNullOrWhiteSpace(category) ? category : "Other",
                FileType = Path.GetExtension(file.FileName).TrimStart('.').ToLower(),
                Size = file.Length,
                VisibilityRole = !string.IsNullOrWhiteSpace(visibilityRole) ? visibilityRole : "Public",
                IsMandatory = isMandatory,
                UploadedBy = !string.IsNullOrWhiteSpace(uploadedBy) ? uploadedBy : "Ana Popescu",
                FileUrl = $"/uploads/{file.FileName}"
            };

            using var stream = file.OpenReadStream();
            var created = await _documentService.CreateDocumentAsync(dto, stream, file.FileName);
            return CreatedAtAction(nameof(GetDocumentById), new { id = created.Id }, created);
        }
        else
        {
            // Support direct JSON or form field upload simulation
            dto = new CreateDocumentDto
            {
                Title = !string.IsNullOrWhiteSpace(title) ? title : "Uploaded Document",
                FileName = !string.IsNullOrWhiteSpace(title) ? $"{title}.pdf" : "Document.pdf",
                Category = !string.IsNullOrWhiteSpace(category) ? category : "Other",
                FileType = "pdf",
                Size = 1048576,
                VisibilityRole = !string.IsNullOrWhiteSpace(visibilityRole) ? visibilityRole : "Public",
                IsMandatory = isMandatory,
                UploadedBy = !string.IsNullOrWhiteSpace(uploadedBy) ? uploadedBy : "Ana Popescu",
                FileUrl = "/uploads/Document.pdf"
            };

            var created = await _documentService.CreateDocumentAsync(dto);
            return CreatedAtAction(nameof(GetDocumentById), new { id = created.Id }, created);
        }
    }

    /// <summary>
    /// Alternative JSON endpoint for programmatic document metadata creation.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(DocumentDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<DocumentDto>> CreateDocumentJson([FromBody] CreateDocumentDto dto)
    {
        var created = await _documentService.CreateDocumentAsync(dto);
        return CreatedAtAction(nameof(GetDocumentById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Updates document status (Approve or Reject with mandatory reason string).
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType(typeof(DocumentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DocumentDto>> UpdateStatus(Guid id, [FromBody] UpdateDocumentStatusDto dto)
    {
        if (dto.Status.Equals("Rejected", StringComparison.OrdinalIgnoreCase) && string.IsNullOrWhiteSpace(dto.Reason))
        {
            return BadRequest(new { message = "A reason must be provided when rejecting a document." });
        }

        var updated = await _documentService.UpdateStatusAsync(id, dto);
        if (updated == null)
        {
            return NotFound(new { message = $"Document with ID {id} was not found." });
        }

        return Ok(updated);
    }

    /// <summary>
    /// Digitally signs a document (Practice agreement, compliance form, etc.).
    /// </summary>
    [HttpPost("{id:guid}/sign")]
    [ProducesResponseType(typeof(DocumentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DocumentDto>> SignDocument(Guid id, [FromBody] SignDocumentDto dto)
    {
        var signed = await _documentService.SignDocumentAsync(id, dto);
        if (signed == null)
        {
            return NotFound(new { message = $"Document with ID {id} was not found." });
        }

        return Ok(signed);
    }

    /// <summary>
    /// Deletes a document from the vault.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDocument(Guid id, [FromQuery] string performedBy = "Ana Popescu")
    {
        var deleted = await _documentService.DeleteDocumentAsync(id, performedBy);
        if (!deleted)
        {
            return NotFound(new { message = $"Document with ID {id} was not found." });
        }

        return NoContent();
    }

    /// <summary>
    /// Returns metric cards statistics and vault storage meter data.
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(DocumentStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<DocumentStatsDto>> GetStats()
    {
        var stats = await _documentService.GetStatsAsync();
        return Ok(stats);
    }

    /// <summary>
    /// Checks the mandatory Health &amp; Safety compliance gate status (US 730).
    /// </summary>
    [HttpGet("compliance-gate")]
    [ProducesResponseType(typeof(ComplianceGateDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ComplianceGateDto>> GetComplianceGate()
    {
        var gate = await _documentService.GetComplianceGateStatusAsync();
        return Ok(gate);
    }

    /// <summary>
    /// Digitally signs the mandatory compliance form and unlocks the compliance gate.
    /// </summary>
    [HttpPost("compliance-gate/sign")]
    [ProducesResponseType(typeof(ComplianceGateDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ComplianceGateDto>> SignCompliance([FromBody] SignDocumentDto dto)
    {
        var gate = await _documentService.SignComplianceAsync(dto.SignedBy);
        return Ok(gate);
    }

    /// <summary>
    /// Performs batch operations (Delete, Approve) on selected documents (US 734).
    /// </summary>
    [HttpPost("batch")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> BatchAction([FromBody] BatchActionDto dto)
    {
        var count = await _documentService.ExecuteBatchActionAsync(dto);
        return Ok(new { affectedCount = count, action = dto.Action });
    }

    /// <summary>
    /// Generates and records an official internship completion certificate (US 460 &amp; 461).
    /// </summary>
    [HttpPost("generate-certificate")]
    [ProducesResponseType(typeof(CertificateDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<CertificateDto>> GenerateCertificate([FromQuery] string recipientName = "Ana Popescu")
    {
        var cert = await _documentService.GenerateCertificateAsync(recipientName);
        return Ok(cert);
    }
}
