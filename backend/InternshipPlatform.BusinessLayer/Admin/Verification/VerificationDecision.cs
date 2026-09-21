using System.ComponentModel.DataAnnotations;

namespace InternshipPlatform.BusinessLayer.Admin.Verification;

public enum VerificationDecisionError
{
    NotFound,
    NotPending,
    CompanyAlreadyRegistered,
    RequesterAlreadyInCompany
}

public sealed record VerificationDecisionResult(VerificationDecisionError? Error)
{
    public static VerificationDecisionResult Success { get; } = new((VerificationDecisionError?)null);

    public static VerificationDecisionResult Fail(VerificationDecisionError error) => new(error);

    public bool Succeeded => Error is null;
}

public sealed record RejectVerificationRequestDto
{
    [Required]
    [StringLength(1000, MinimumLength = 5)]
    public string Reason { get; init; } = string.Empty;
}
