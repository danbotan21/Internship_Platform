using System.ComponentModel.DataAnnotations;
using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.BusinessLayer.Onboarding;

/// <summary>
/// What a user fills in to ask an admin to verify their company. The requester's name and
/// email are not here on purpose: the server takes them from the signed-in account, so a
/// request can never be submitted on someone else's behalf.
/// </summary>
public sealed record SubmitVerificationRequestDto
{
    [Required]
    [StringLength(200, MinimumLength = 2)]
    public string LegalName { get; init; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 5)]
    public string RegistrationNumber { get; init; } = string.Empty;

    [Required]
    [StringLength(200, MinimumLength = 4)]
    public string Website { get; init; } = string.Empty;

    [Required]
    [StringLength(200, MinimumLength = 2)]
    public string Headquarters { get; init; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Industry { get; init; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string CompanySize { get; init; } = string.Empty;

    /// <summary>The requester's role in that company, for example "HR Manager".</summary>
    [Required]
    [StringLength(30, MinimumLength = 2)]
    public string Position { get; init; } = string.Empty;

    [Phone]
    [StringLength(30)]
    public string? Phone { get; init; }
}

public enum SubmitVerificationError
{
    AlreadyPending,
    AlreadyInCompany,
    CompanyAlreadyRegistered,
    InvalidRegistrationNumber,
}

public sealed record SubmitVerificationResult(Guid? RequestId, SubmitVerificationError? Error)
{
    public static SubmitVerificationResult Success(Guid requestId) => new(requestId, null);

    public static SubmitVerificationResult Fail(SubmitVerificationError error) => new(null, error);

    public bool Succeeded => Error is null;
}

public sealed record MyVerificationRequestDto(
    Guid Id,
    VerificationStatus Status,
    string LegalName,
    string RegistrationNumber,
    string Website,
    string Headquarters,
    string Industry,
    string CompanySize,
    string Position,
    string? Phone,
    DateTimeOffset CreatedAt,
    DateTimeOffset? DecidedAt,
    string? RejectionReason,
    Guid? CompanyId);

/// <summary>
/// Everything the "become a company" page needs in one call: whether the form should be
/// shown at all, and the latest request with its outcome.
/// </summary>
public sealed record MyVerificationStateDto(
    bool CanSubmit,
    bool AlreadyInCompany,
    MyVerificationRequestDto? Request);
