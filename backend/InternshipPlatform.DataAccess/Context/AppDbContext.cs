using InternshipPlatform.Domain;
using InternshipPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.DataAccess.Context;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<CompanyMembership> CompanyMemberships => Set<CompanyMembership>();

    public DbSet<CompanyVerificationRequest> CompanyVerificationRequests
        => Set<CompanyVerificationRequest>();
    public DbSet<Milestone> Milestones => Set<Milestone>();
    public DbSet<TaskLogEntry> TaskLogEntries => Set<TaskLogEntry>();
    public DbSet<SupervisorFeedback> SupervisorFeedback => Set<SupervisorFeedback>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(rt => rt.Token).IsUnique();

            entity.HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Milestone>(entity =>
        {
            entity.Property(m => m.Status).HasConversion<string>();

            entity.HasOne(m => m.StudentUser)
                .WithMany()
                .HasForeignKey(m => m.StudentUserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(m => m.ReviewedByUser)
                .WithMany()
                .HasForeignKey(m => m.ReviewedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TaskLogEntry>(entity =>
        {
            entity.HasOne(t => t.StudentUser)
                .WithMany()
                .HasForeignKey(t => t.StudentUserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SupervisorFeedback>(entity =>
        {
            entity.HasOne(f => f.StudentUser)
                .WithMany()
                .HasForeignKey(f => f.StudentUserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(f => f.SupervisorUser)
                .WithMany()
                .HasForeignKey(f => f.SupervisorUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    
}

