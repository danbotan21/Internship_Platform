using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Opportunity;

// Data access actions for Application entity.
public class ApplicationActions(AppDbContext db)
{
    public async Task<Application?> GetByIdAsync(Guid id)
        => await db.Applications
            .Include(a => a.Opportunity)
            .Include(a => a.Student)
            .FirstOrDefaultAsync(a => a.Id == id);

    public async Task<List<Application>> GetByStudentIdAsync(Guid studentId)
        => await db.Applications
            .Include(a => a.Opportunity)
            .Where(a => a.StudentId == studentId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync();

    public async Task<List<Application>> GetByOpportunityIdAsync(Guid opportunityId)
        => await db.Applications
            .Include(a => a.Student)
            .Where(a => a.OpportunityId == opportunityId)
            .OrderBy(a => a.Status)  // Pending → UnderReview → Accepted → Rejected
            .ThenByDescending(a => a.AppliedAt)
            .ToListAsync();

    public async Task<bool> HasAppliedAsync(Guid opportunityId, Guid studentId)
        => await db.Applications.AnyAsync(a => a.OpportunityId == opportunityId && a.StudentId == studentId);

    public async Task<Application> CreateAsync(Application application)
    {
        db.Applications.Add(application);
        await db.SaveChangesAsync();
        return application;
    }

    public async Task UpdateAsync(Application application)
    {
        application.UpdatedAt = DateTime.UtcNow;
        db.Applications.Update(application);
        await db.SaveChangesAsync();
    }
}
