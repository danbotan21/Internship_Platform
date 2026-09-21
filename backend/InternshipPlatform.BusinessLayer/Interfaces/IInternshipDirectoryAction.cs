using InternshipPlatform.Domain.Models;

namespace InternshipPlatform.BusinessLayer.Interfaces;

// Who takes part in the internship and which mentor each student belongs to.
// Temporary seam: the real data comes from the Authentication and internship
// Epics; only the implementation registered in Program.cs changes then.
public interface IInternshipDirectoryAction
{
    Task<IReadOnlyList<InternshipMemberDto>> GetMembersAsync(CancellationToken ct = default);

    Task<InternshipMemberDto?> FindMemberAsync(Guid userId, CancellationToken ct = default);
}
