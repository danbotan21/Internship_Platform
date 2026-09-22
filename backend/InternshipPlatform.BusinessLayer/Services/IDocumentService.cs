using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using InternshipPlatform.BusinessLayer.DTOs;

namespace InternshipPlatform.BusinessLayer.Services;

public interface IDocumentService
{
    Task<List<DocumentDto>> GetDocumentsAsync(string? category = null, string? status = null, string? search = null, bool? mandatoryOnly = null, string? userRole = null);
    Task<DocumentDto?> GetDocumentByIdAsync(Guid id);
    Task<DocumentDto> CreateDocumentAsync(CreateDocumentDto dto, Stream? fileStream = null, string? originalFileName = null);
    Task<DocumentDto?> UpdateStatusAsync(Guid id, UpdateDocumentStatusDto dto);
    Task<DocumentDto?> SignDocumentAsync(Guid id, SignDocumentDto dto);
    Task<bool> DeleteDocumentAsync(Guid id, string performedBy);
    Task<DocumentStatsDto> GetStatsAsync();
    Task<ComplianceGateDto> GetComplianceGateStatusAsync();
    Task<ComplianceGateDto> SignComplianceAsync(string signedBy);
    Task<int> ExecuteBatchActionAsync(BatchActionDto dto);
    Task<CertificateDto> GenerateCertificateAsync(string recipientName);
}
