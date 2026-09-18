using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.DataAccess.Seed;

public static class SeedData
{
    private const string PasswordHashPlaceholder = "seed-data-not-a-real-hash";
    private const int TotalUsers = 72;
    private const int AdminCount = 2;
    private const int CompanyMemberCount = 14;

    private static readonly DateTimeOffset Epoch = new(2026, 9, 1, 9, 0, 0, TimeSpan.Zero);

    private static readonly string[] FirstNames =
        ["Mihail", "Ana", "Victor", "Irina", "Alex", "Maria",
         "Dan", "Elena", "Vlad", "Cristina", "Andrei", "Natalia"];

    private static readonly string[] LastNames =
        ["Goncearov", "Nistor", "Cebotari", "Rusu", "Morgan", "Ionescu",
         "Botan", "Chiriac", "Popescu", "Ursu", "Lungu", "Cojocaru"];

    private static readonly string[] AcademicGroups =
        ["UTM-02", "UTM-04", "FAF-231", "TI-221", "IA-211"];

    private static readonly (string LegalName, string Registration, string Domain, string Industry, string Size)[] CompanyData =
    [
        ("TechNova SRL",        "1003600012345", "technova.example",  "Software", "51-200"),
        ("Amdaris Moldova SRL", "1003600023456", "amdaris.example",   "Software", "201-500"),
        ("Endava Chisinau SRL", "1003600034567", "endava.example",    "Software", "501-1000"),
        ("Simpals SRL",         "1003600045678", "simpals.example",   "Media",    "11-50"),
        ("Orange Systems SRL",  "1003600056789", "orangesys.example", "Telecom",  "201-500"),
        ("Fagura SRL",          "1003600067890", "fagura.example",    "Fintech",  "11-50"),
    ];

    // Реальная команда проекта.
    // CompanyIndex = null → студент; иначе индекс в CompanyData и явная роль в компании.
    private static readonly (string FullName, bool IsAdmin, int? CompanyIndex, CompanyRole? Role)[] Team =
    [
        ("Mihail Goncearov",       true,  null, null),
        ("Ion Chiriac",            false, 1,    CompanyRole.Mentor),
        ("Daniel Botan",           false, null, null),
        ("Daniel Chigaianu",       false, null, null),
        ("Daniel Chitanu",         false, null, null),
        ("Gicu Caraman",           false, null, null),
        ("Sergiu Negara",          false, null, null),
        ("Valeriu Bulgaru",        false, null, null),
        ("Veaceslav Nagoreanschi", false, null, null),
    ];

    public static async Task EnsureSeededAsync(
        AppDbContext context,
        CancellationToken cancellationToken = default)
    {
        if (await context.Users.AnyAsync(cancellationToken))
        {
            return;
        }

        var companies = BuildCompanies();
        var (users, memberships) = BuildUsersAndMemberships(companies);

        context.Companies.AddRange(companies);
        context.Users.AddRange(users);
        context.CompanyMemberships.AddRange(memberships);
        context.CompanyVerificationRequests.AddRange(BuildRequests(users, memberships, companies));

        await context.SaveChangesAsync(cancellationToken);
    }

    private static Guid SeedId(string prefix, int index) =>
        new($"{prefix}-0000-0000-0000-{index:D12}");

    private static List<Company> BuildCompanies() =>
        CompanyData
            .Select((data, i) => new Company
            {
                Id = SeedId("22222222", i),
                LegalName = data.LegalName,
                RegistrationNumber = data.Registration,
                Website = $"https://{data.Domain}",
                Headquarters = "Chisinau, Moldova",
                Industry = data.Industry,
                CompanySize = data.Size,
                Status = i == 5 ? CompanyStatus.Suspended : CompanyStatus.Active,
                VerifiedAt = Epoch.AddDays(i),
                SuspendedAt = i == 5 ? Epoch.AddDays(20) : null,
            })
            .ToList();

    private static (List<User> Users, List<CompanyMembership> Memberships) BuildUsersAndMemberships(
        List<Company> companies)
    {
        var users = new List<User>(TotalUsers);
        var memberships = new List<CompanyMembership>(CompanyMemberCount);
        var ownerAssigned = new bool[companies.Count];

        void AddMembership(User user, int companyIndex, CompanyRole? explicitRole)
        {
            var role = explicitRole ?? (ownerAssigned[companyIndex]
                ? memberships.Count % 2 == 0 ? CompanyRole.Recruiter : CompanyRole.Mentor
                : CompanyRole.Owner);

            if (role == CompanyRole.Owner)
            {
                ownerAssigned[companyIndex] = true;
            }

            memberships.Add(new CompanyMembership
            {
                UserId = user.Id,
                CompanyId = companies[companyIndex].Id,
                Role = role,
                JoinedAt = Epoch.AddDays(memberships.Count),
            });
        }

        for (var i = 0; i < Team.Length; i++)
        {
            var member = Team[i];
            var user = NewUser(i, member.FullName, member.IsAdmin, member.CompanyIndex);
            users.Add(user);

            if (member.CompanyIndex is int companyIndex)
            {
                AddMembership(user, companyIndex, member.Role);
            }
        }

        var admins = Team.Count(m => m.IsAdmin);

        for (var i = Team.Length; i < TotalUsers; i++)
        {
            var fullName = $"{FirstNames[i % FirstNames.Length]} {LastNames[i / FirstNames.Length % LastNames.Length]}";

            if (admins < AdminCount)
            {
                users.Add(NewUser(i, fullName, isAdmin: true, companyIndex: null));
                admins++;
            }
            else if (memberships.Count < CompanyMemberCount)
            {
                var companyIndex = memberships.Count % companies.Count;
                var user = NewUser(i, fullName, isAdmin: false, companyIndex);
                users.Add(user);
                AddMembership(user, companyIndex, explicitRole: null);
            }
            else
            {
                users.Add(NewUser(i, fullName, isAdmin: false, companyIndex: null));
            }
        }

        return (users, memberships);
    }

    private static User NewUser(int index, string fullName, bool isAdmin, int? companyIndex)
    {
        var isCompanyMember = companyIndex is not null;
        var isDeactivated = index % 17 == 16;
        var parts = fullName.Split(' ');

        var domain = isCompanyMember
            ? CompanyData[companyIndex!.Value].Domain
            : "isa.utm.md";

        return new User
        {
            Id = SeedId("11111111", index),
            Email = $"{parts[0]}.{parts[^1]}@{domain}".ToLowerInvariant(),
            PasswordHash = PasswordHashPlaceholder,
            EmailVerified = true,
            FullName = fullName,
            University = isCompanyMember ? null : "UTM",
            AcademicGroup = isCompanyMember ? null
                : isAdmin ? "Programme Office"
                : AcademicGroups[index % AcademicGroups.Length],
            Programme = isCompanyMember ? null : "Software Engineering · Year 3",
            PlatformRole = isAdmin ? PlatformRole.Admin : PlatformRole.User,
            Status = isDeactivated ? UserStatus.Deactivated : UserStatus.Active,
            CreatedAt = Epoch.AddDays(-index),
            LastLoginAt = Epoch.AddHours(-index),
            DeactivatedAt = isDeactivated ? Epoch.AddDays(-1) : null,
        };
    }

    private static List<CompanyVerificationRequest> BuildRequests(
        List<User> users,
        List<CompanyMembership> memberships,
        List<Company> companies)
    {
        var admin = users.First(u => u.PlatformRole == PlatformRole.Admin);
        var students = users
            .Where(u => u.PlatformRole == PlatformRole.User && u.University is not null)
            .ToList();

        var requests = new List<CompanyVerificationRequest>();

        for (var i = 0; i < companies.Count; i++)
        {
            var ownerId = memberships
                .First(m => m.CompanyId == companies[i].Id && m.Role == CompanyRole.Owner)
                .UserId;

            var owner = users.First(u => u.Id == ownerId);
            requests.Add(NewRequest(i, companies[i], owner, VerificationStatus.Approved, admin));
        }

        for (var i = 0; i < 4; i++)
        {
            requests.Add(NewRequest(companies.Count + i, null, students[20 + i], VerificationStatus.Pending, null));
        }

        for (var i = 0; i < 2; i++)
        {
            requests.Add(NewRequest(companies.Count + 4 + i, null, students[30 + i], VerificationStatus.Rejected, admin));
        }

        return requests;
    }

    private static CompanyVerificationRequest NewRequest(
        int index,
        Company? company,
        User requester,
        VerificationStatus status,
        User? decidedBy) =>
        new()
        {
            Id = SeedId("33333333", index),
            LegalName = company?.LegalName ?? $"Applicant Company {index} SRL",
            RegistrationNumber = company?.RegistrationNumber ?? $"10036000{index:D5}",
            Website = company?.Website ?? $"https://applicant{index}.example",
            Headquarters = "Chisinau, Moldova",
            Industry = company?.Industry ?? "Software",
            CompanySize = company?.CompanySize ?? "11-50",

            RequesterUserId = requester.Id,
            RequesterName = requester.FullName,
            RequesterEmail = requester.Email,
            RequesterPosition = "HR Manager",
            RequesterPhone = "+373 60 000 000",

            Status = status,
            CreatedAt = Epoch.AddDays(-index),
            DecidedAt = decidedBy is null ? null : Epoch.AddDays(-index + 2),
            DecidedByUserId = decidedBy?.Id,
            RejectionReason = status == VerificationStatus.Rejected
                ? "Registration documents did not match the company name."
                : null,
            CompanyId = company?.Id,
        };
}