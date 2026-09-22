using System.ComponentModel.DataAnnotations;

namespace InternshipPlatform.BusinessLayer.Admin.Companies;

public enum CompanyActionError
{
    NotFound,
    AlreadySuspended,
    NotSuspended
}

public sealed record CompanyActionResult(CompanyActionError? Error)
{
    public static CompanyActionResult Success { get; } = new((CompanyActionError?)null);

    public static CompanyActionResult Fail(CompanyActionError error) => new(error);

    public bool Succeeded => Error is null;
}

public sealed record CompanyActionRequestDto
{
    [Required]
    [StringLength(1000, MinimumLength = 5)]
    public string Reason { get; init; } = string.Empty;
}
