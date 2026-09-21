using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Users;

// Data access actions for User entity.
public class UserActions(AppDbContext db)
{
    public async Task<Domain.User?> GetByIdAsync(Guid userId)
        => await db.Users.FirstOrDefaultAsync(u => u.Id == userId);

    public async Task<Domain.User?> GetByEmailAsync(string email)
        => await db.Users.FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant());

    public async Task UpdateAsync(Domain.User user)
    {
        db.Users.Update(user);
        await db.SaveChangesAsync();
    }
}
