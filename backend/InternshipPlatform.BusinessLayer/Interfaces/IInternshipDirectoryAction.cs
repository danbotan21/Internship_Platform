using InternshipPlatform.Domain.Models;

namespace InternshipPlatform.BusinessLayer.Interfaces;

// Who takes part in the internship and which mentor each student belongs to.
// The implementation resolves these values from the real application database.
public interface IInternshipDirectoryAction
{
    Task<IReadOnlyList<InternshipMemberDto>> GetMembersAsync(CancellationToken ct = default);

    Task<InternshipMemberDto?> FindMemberAsync(Guid userId, CancellationToken ct = default);
}
