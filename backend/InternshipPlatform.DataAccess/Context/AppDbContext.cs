using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.DataAccess.Context;

// Each module keeps its DbSets and mappings in its own partial file
// (AppDbContext.<Module>.cs) so teams do not edit the same file.
public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureContributionModule(modelBuilder);
    }
}
