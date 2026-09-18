using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.Domain.Models;

namespace InternshipPlatform.API.Infrastructure;

// TEMPORARY: fixed internship members until the Authentication and internship
// (companies / mentors) Epics provide real users and mentor assignments.
// Replace the registration in Program.cs; the contribution module only
// depends on IInternshipDirectoryAction.
public sealed class DemoInternshipDirectory : IInternshipDirectoryAction
{
    public static readonly Guid DefaultStudentId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid DefaultMentorId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    private static readonly Guid SecondMentorId = Guid.Parse("22222222-2222-2222-2222-000000000002");

    private static readonly IReadOnlyList<InternshipMemberDto> Members =
    [
        Mentor(DefaultMentorId, "Elena Mentor", "elena.mentor@internflow.test"),
        Student(DefaultStudentId, "Daniel Botan", "daniel.botan@internflow.test", "danbotan21", DefaultMentorId),
        Student("33333333-0000-0000-0000-000000000001", "Sergiu Negara", "sergiu.negara@internflow.test", "negara999", DefaultMentorId),
        Student("33333333-0000-0000-0000-000000000002", "Daniel Chitanu", "daniel.chitanu@internflow.test", null, DefaultMentorId),
        Student("33333333-0000-0000-0000-000000000003", "Daniel Chigaianu", "daniel.chigaianu@internflow.test", null, DefaultMentorId),
        Student("33333333-0000-0000-0000-000000000004", "Gicu Caraman", "gicu.caraman@internflow.test", null, DefaultMentorId),
        Student("33333333-0000-0000-0000-000000000005", "Mihail Goncearov", "mihail.goncearov@internflow.test", null, DefaultMentorId),
        Student("33333333-0000-0000-0000-000000000006", "Valeriu Bulgaru", "valeriu.bulgaru@internflow.test", null, DefaultMentorId),
        Student("33333333-0000-0000-0000-000000000007", "Veaceslav Nagorne", "veaceslav.nagorne@internflow.test", null, DefaultMentorId),

        // A second team, to show that mentors only see their own students.
        Mentor(SecondMentorId, "Andrei Mentor", "andrei.mentor@internflow.test"),
        Student("44444444-0000-0000-0000-000000000001", "Ana Rusu", "ana.rusu@internflow.test", null, SecondMentorId)
    ];

    public Task<IReadOnlyList<InternshipMemberDto>> GetMembersAsync(CancellationToken ct = default) =>
        Task.FromResult(Members);

    public Task<InternshipMemberDto?> FindMemberAsync(Guid userId, CancellationToken ct = default) =>
        Task.FromResult(Members.FirstOrDefault(member => member.UserId == userId));

    private static InternshipMemberDto Mentor(Guid id, string name, string email) =>
        new()
        {
            UserId = id,
            FullName = name,
            Email = email,
            Role = InternshipMemberRole.Mentor
        };

    private static InternshipMemberDto Student(
        Guid id,
        string name,
        string email,
        string? gitHubUsername,
        Guid mentorId) =>
        new()
        {
            UserId = id,
            FullName = name,
            Email = email,
            Role = InternshipMemberRole.Student,
            GitHubUsername = gitHubUsername,
            MentorId = mentorId
        };

    private static InternshipMemberDto Student(
        string id,
        string name,
        string email,
        string? gitHubUsername,
        Guid mentorId) =>
        Student(Guid.Parse(id), name, email, gitHubUsername, mentorId);
}
