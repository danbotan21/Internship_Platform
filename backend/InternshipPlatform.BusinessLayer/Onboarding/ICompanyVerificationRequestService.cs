namespace InternshipPlatform.BusinessLayer.Onboarding;

/// <summary>
/// The user-facing half of company verification: submitting a request and following it.
/// Deciding on requests belongs to the admin panel
/// (<see cref="Admin.Verification.ICompanyVerificationService"/>).
/// </summary>
public interface ICompanyVerificationRequestService
{
    Task<SubmitVerificationResult> SubmitAsync(
        SubmitVerificationRequestDto request,
        Guid requesterUserId,
        CancellationToken cancellationToken = default);

    Task<MyVerificationStateDto> GetMyStateAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}
