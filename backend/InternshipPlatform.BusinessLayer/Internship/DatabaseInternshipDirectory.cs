using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Enums;
using InternshipPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Internship;

/// <summary>
/// Resolves Contribution Management participants from the real application data.
///
/// A mentor is a platform Mentor or a Company user whose company membership is
/// Mentor. An explicit User.MentorId is preferred. An accepted application is
/// used only as a read-only compatibility fallback when it resolves to exactly
/// one mentor.
/// </summary>
public sealed class DatabaseInternshipDirectory(AppDbContext db) : IInternshipDirectoryAction
{
    public async Task<IReadOnlyList<InternshipMemberDto>> GetMembersAsync(
        CancellationToken ct = default)
    {
        var users = await db.Users
            .AsNoTracking()
            .Include(user => user.Membership)
            .Where(user => user.Status == UserStatus.Active)
            .OrderBy(user => user.FullName)
            .ToListAsync(ct);

        var mentorIds = users
            .Where(IsMentor)
            .Select(user => user.Id)
            .ToHashSet();

        var acceptedAssignments = await db.Applications
            .AsNoTracking()
            .Where(application => application.Status == ApplicationStatus.Accepted)
            .OrderBy(application => application.AppliedAt)
            .Select(application => new
            {
                application.StudentId,
                MentorId = application.Opportunity.MentorId
            })
            .ToListAsync(ct);

        var fallbackAssignments = acceptedAssignments
            .Where(assignment => mentorIds.Contains(assignment.MentorId))
            .GroupBy(assignment => assignment.StudentId)
            .Select(group => new
            {
                StudentId = group.Key,
                MentorIds = group
                    .Select(assignment => assignment.MentorId)
                    .Distinct()
                    .ToList()
            })
            .Where(assignment => assignment.MentorIds.Count == 1)
            .ToDictionary(assignment => assignment.StudentId, assignment => assignment.MentorIds[0]);

        return users
            .Where(user => IsStudent(user) || IsMentor(user))
            .Select(user => ToMember(user, mentorIds, fallbackAssignments))
            .ToList();
    }

    public async Task<InternshipMemberDto?> FindMemberAsync(
        Guid userId,
        CancellationToken ct = default)
    {
        var members = await GetMembersAsync(ct);
        return members.FirstOrDefault(member => member.UserId == userId);
    }

    private static InternshipMemberDto ToMember(
        User user,
        IReadOnlySet<Guid> mentorIds,
        IReadOnlyDictionary<Guid, Guid> fallbackAssignments)
    {
        Guid? mentorId = null;

        if (IsStudent(user))
        {
            if (user.MentorId is Guid assignedMentorId && mentorIds.Contains(assignedMentorId))
            {
                mentorId = assignedMentorId;
            }
            else if (fallbackAssignments.TryGetValue(user.Id, out var acceptedMentorId))
            {
                mentorId = acceptedMentorId;
            }
        }

        return new InternshipMemberDto
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = IsMentor(user) ? InternshipMemberRole.Mentor : InternshipMemberRole.Student,
            GitHubUsername = user.GitHubUsername,
            MentorId = mentorId
        };
    }

    private static bool IsStudent(User user) => user.Role == UserRole.Student;

    private static bool IsMentor(User user) =>
        user.Role == UserRole.Mentor || user.Membership?.Role == CompanyRole.Mentor;
}
