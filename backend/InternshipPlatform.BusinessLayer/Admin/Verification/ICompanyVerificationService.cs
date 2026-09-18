namespace InternshipPlatform.BusinessLayer.Admin.Verification;

public interface ICompanyVerificationService
{
    Task<VerificationQueueResultDto> GetQueueAsync(
        VerificationQueueQuery query,
        CancellationToken cancellationToken = default);

    Task<VerificationDetailDto?> GetRequestAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates the company, makes the requester its owner and closes the request.
    /// </summary>
    Task<VerificationDecisionResult> ApproveAsync(
        Guid id,
        Guid? decidedByUserId,
        CancellationToken cancellationToken = default);

    Task<VerificationDecisionResult> RejectAsync(
        Guid id,
        string reason,
        Guid? decidedByUserId,
        CancellationToken cancellationToken = default);
}
