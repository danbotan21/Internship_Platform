using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Opportunity;

/// <summary>
/// Data access actions for Opportunity entity (raw DB operations, no business logic).
/// </summary>
public class OpportunityActions(AppDbContext db)
{
    public async Task<List<Domain.Entities.Opportunity>> GetOpenOpportunitiesAsync()
        => await db.Opportunities
            .Where(o => o.Status == OpportunityStatus.Open)
            .Include(o => o.Mentor)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

    public async Task<Domain.Entities.Opportunity?> GetByIdAsync(Guid id)
        => await db.Opportunities
            .Include(o => o.Mentor)
            .Include(o => o.Applications)
            .FirstOrDefaultAsync(o => o.Id == id);

    public async Task<List<Domain.Entities.Opportunity>> GetByMentorIdAsync(Guid mentorId)
        => await db.Opportunities
            .Include(o => o.Applications)
            .Where(o => o.MentorId == mentorId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

    public async Task<Domain.Entities.Opportunity> CreateAsync(Domain.Entities.Opportunity opportunity)
    {
        db.Opportunities.Add(opportunity);
        await db.SaveChangesAsync();
        return opportunity;
    }

    public async Task<Domain.Entities.Opportunity> UpdateAsync(Domain.Entities.Opportunity opportunity)
    {
        opportunity.UpdatedAt = DateTime.UtcNow;
        db.Opportunities.Update(opportunity);
        await db.SaveChangesAsync();
        return opportunity;
    }

    public async Task<List<Guid>> GetSavedOpportunityIdsAsync(Guid userId)
    {
        var user = await db.Users
            .Include(u => u.SavedOpportunities)
            .FirstOrDefaultAsync(u => u.Id == userId);
        return user?.SavedOpportunities.Select(o => o.Id).ToList() ?? [];
    }

    public async Task<bool> IsSavedByUserAsync(Guid opportunityId, Guid userId)
    {
        var user = await db.Users
            .Include(u => u.SavedOpportunities)
            .FirstOrDefaultAsync(u => u.Id == userId);
        return user?.SavedOpportunities.Any(o => o.Id == opportunityId) ?? false;
    }

    public async Task SaveForUserAsync(Guid opportunityId, Guid userId)
    {
        var user = await db.Users
            .Include(u => u.SavedOpportunities)
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("User not found.");

        var opp = await db.Opportunities.FindAsync(opportunityId)
            ?? throw new KeyNotFoundException("Opportunity not found.");

        if (!user.SavedOpportunities.Any(o => o.Id == opportunityId))
        {
            user.SavedOpportunities.Add(opp);
            await db.SaveChangesAsync();
        }
    }

    public async Task UnsaveForUserAsync(Guid opportunityId, Guid userId)
    {
        var user = await db.Users
            .Include(u => u.SavedOpportunities)
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("User not found.");

        var saved = user.SavedOpportunities.FirstOrDefault(o => o.Id == opportunityId);
        if (saved is not null)
        {
            user.SavedOpportunities.Remove(saved);
            await db.SaveChangesAsync();
        }
    }
}
