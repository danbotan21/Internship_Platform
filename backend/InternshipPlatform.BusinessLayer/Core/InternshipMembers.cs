using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.Domain.Models;

namespace InternshipPlatform.BusinessLayer.Core;

// Directory lookups shared by the contribution and evaluation modules.
internal static class InternshipMembers
{
    public static async Task<Dictionary<Guid, InternshipMemberDto>> LoadAsync(
        IInternshipDirectoryAction directory,
        CancellationToken ct)
    {
        var members = await directory.GetMembersAsync(ct);
        return members.ToDictionary(member => member.UserId);
    }

    public static async Task<InternshipMemberDto?> FindWithRoleAsync(
        IInternshipDirectoryAction directory,
        Guid userId,
        InternshipMemberRole role,
        CancellationToken ct)
    {
        if (userId == Guid.Empty)
        {
            return null;
        }

        var member = await directory.FindMemberAsync(userId, ct);
        return member?.Role == role ? member : null;
    }

    public static bool IsMentorOf(
        IReadOnlyDictionary<Guid, InternshipMemberDto> members,
        Guid mentorId,
        Guid studentId) =>
        members.TryGetValue(studentId, out var student) &&
        student.MentorId == mentorId &&
        members.TryGetValue(mentorId, out var mentor) &&
        mentor.Role == InternshipMemberRole.Mentor;

    // Another student of the same mentor.
    public static bool IsTeammate(InternshipMemberDto student, InternshipMemberDto member) =>
        member.Role == InternshipMemberRole.Student &&
        member.UserId != student.UserId &&
        member.MentorId is not null &&
        member.MentorId == student.MentorId;

    public static InternshipMemberDto OrUnknown(
        IReadOnlyDictionary<Guid, InternshipMemberDto> members,
        Guid userId) =>
        members.TryGetValue(userId, out var member)
            ? member
            : new InternshipMemberDto
            {
                UserId = userId,
                FullName = "Unknown member",
                Role = InternshipMemberRole.Student
            };
}
