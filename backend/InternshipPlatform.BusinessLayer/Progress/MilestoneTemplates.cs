using InternshipPlatform.Domain;

namespace InternshipPlatform.BusinessLayer.Progress;

public static class MilestoneTemplates
{
    private static readonly (string Title, string Description, int DueInDays, bool RequiresReview)[] Definitions =
    [
        ("Onboarding & setup", "Environment, accounts, team intro", 3, false),
        ("First feature shipped", "Ship a small UI component to production", 14, false),
        ("Own a full ticket", "Take a feature from spec to review", 28, false),
        ("Mid-term evaluation", "Review performance with your mentor", 42, true),
        ("Lead a small project", "Coordinate a multi-day deliverable", 70, true),
        ("Final showcase", "Present your internship project", 98, true),
    ];

    public static List<Milestone> CreateFor(Guid studentUserId, DateOnly startDate)
    {
        var order = 0;
        return Definitions
            .Select(def => new Milestone
            {
                Id = Guid.NewGuid(),
                StudentUserId = studentUserId,
                Title = def.Title,
                Description = def.Description,
                DueDate = startDate.AddDays(def.DueInDays),
                Order = order++,
                RequiresReview = def.RequiresReview,
                Status = MilestoneStatus.Pending,
            })
            .ToList();
    }
}
