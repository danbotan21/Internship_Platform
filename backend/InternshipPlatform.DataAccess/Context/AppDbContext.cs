using InternshipPlatform.Domain;
using InternshipPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.DataAccess.Context;

// Each feature module keeps its DbSets and mappings in a partial context file.
public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Resource> Resources => Set<Resource>();
    public DbSet<ResourceFavorite> ResourceFavorites => Set<ResourceFavorite>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Opportunity> Opportunities => Set<Opportunity>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<CompanyMembership> CompanyMemberships => Set<CompanyMembership>();
    public DbSet<CompanyVerificationRequest> CompanyVerificationRequests => Set<CompanyVerificationRequest>();
    public DbSet<Milestone> Milestones => Set<Milestone>();
    public DbSet<TaskLogEntry> TaskLogEntries => Set<TaskLogEntry>();
    public DbSet<SupervisorFeedback> SupervisorFeedback => Set<SupervisorFeedback>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        modelBuilder.Entity<Resource>(entity =>
        {
            entity.HasKey(resource => resource.Id);
            entity.HasIndex(resource => resource.Slug).IsUnique();
            entity.HasIndex(resource => resource.CreatedByUserId);
            entity.Property(resource => resource.TargetGroup).HasMaxLength(100);
            entity.Property(resource => resource.Slug).HasMaxLength(200).IsRequired();
            entity.Property(resource => resource.Type).HasMaxLength(50).IsRequired();
            entity.Property(resource => resource.Format).HasMaxLength(50).IsRequired();
            entity.Property(resource => resource.Title).HasMaxLength(200).IsRequired();
            entity.Property(resource => resource.Description).HasMaxLength(1000);
            entity.Property(resource => resource.Owner).HasMaxLength(150).IsRequired();
            entity.Property(resource => resource.Category).HasMaxLength(100).IsRequired();
            entity.Property(resource => resource.MentorName).HasMaxLength(150).IsRequired();
            entity.Property(resource => resource.Tags)
                .HasColumnType("text[]")
                .HasDefaultValue(Array.Empty<string>());
            entity.Property(resource => resource.CreatedAt)
                .HasColumnType("timestamp with time zone");
            entity.Property(resource => resource.UpdatedAt)
                .HasColumnType("timestamp with time zone");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(notification => notification.Id);
            entity.HasIndex(notification => new { notification.RecipientUserId, notification.IsRead });
            entity.Property(notification => notification.Title).HasMaxLength(200).IsRequired();
            entity.Property(notification => notification.Message).HasMaxLength(500).IsRequired();
            entity.Property(notification => notification.CreatedAt).HasColumnType("timestamp with time zone");
        });

        modelBuilder.Entity<ResourceFavorite>(entity =>
        {
            entity.HasKey(favorite => new { favorite.ResourceId, favorite.UserId });
            entity.Property(favorite => favorite.CreatedAt).HasColumnType("timestamp with time zone");
            entity.HasOne(favorite => favorite.Resource)
                .WithMany(resource => resource.Favorites)
                .HasForeignKey(favorite => favorite.ResourceId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(user => user.Email).IsUnique();
            entity.Property(user => user.Email).IsRequired();
            entity.Property(user => user.PasswordHash).IsRequired();
            entity.Property(user => user.Role).HasConversion<string>();
        });

        // ── RefreshToken ─────────────────────────────────────────────────
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(token => token.Token).IsUnique();
            entity.HasOne(token => token.User)
                .WithMany(user => user.RefreshTokens)
                .HasForeignKey(token => token.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Opportunity ──────────────────────────────────────────────────
        modelBuilder.Entity<Opportunity>(entity =>
        {
            entity.Property(o => o.Status).HasConversion<string>();
            entity.Property(o => o.Type).HasConversion<string>();
            entity.Property(o => o.LocationType).HasConversion<string>();

            // JSON columns for string arrays (PostgreSQL jsonb)
            entity.Property(o => o.Responsibilities).HasColumnType("jsonb");
            entity.Property(o => o.Requirements).HasColumnType("jsonb");
            entity.Property(o => o.Technologies).HasColumnType("jsonb");
            entity.Property(o => o.Tags).HasColumnType("jsonb");

            // Mentor → Opportunities (one-to-many)
            entity.HasOne(o => o.Mentor)
                .WithMany(u => u.Opportunities)
                .HasForeignKey(o => o.MentorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Application ──────────────────────────────────────────────────
        modelBuilder.Entity<Application>(entity =>
        {
            entity.Property(a => a.Status).HasConversion<string>();
            entity.Property(a => a.AdditionalFilePaths).HasColumnType("jsonb");

            // Student → Applications
            entity.HasOne(a => a.Student)
                .WithMany(u => u.Applications)
                .HasForeignKey(a => a.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Opportunity → Applications
            entity.HasOne(a => a.Opportunity)
                .WithMany(o => o.Applications)
                .HasForeignKey(a => a.OpportunityId)
                .OnDelete(DeleteBehavior.Cascade);

            // One application per student per opportunity
            entity.HasIndex(a => new { a.StudentId, a.OpportunityId }).IsUnique();
        });

        // ── SavedOpportunities (many-to-many join table) ─────────────────
        modelBuilder.Entity<User>()
            .HasMany(u => u.SavedOpportunities)
            .WithMany()
            .UsingEntity(j => j.ToTable("UserSavedOpportunities"));

        modelBuilder.Entity<Milestone>(entity =>
        {
            entity.Property(milestone => milestone.Status).HasConversion<string>();
            entity.HasOne(milestone => milestone.StudentUser)
                .WithMany()
                .HasForeignKey(milestone => milestone.StudentUserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(milestone => milestone.ReviewedByUser)
                .WithMany()
                .HasForeignKey(milestone => milestone.ReviewedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TaskLogEntry>(entity =>
        {
            entity.HasOne(task => task.StudentUser)
                .WithMany()
                .HasForeignKey(task => task.StudentUserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SupervisorFeedback>(entity =>
        {
            entity.HasOne(feedback => feedback.StudentUser)
                .WithMany()
                .HasForeignKey(feedback => feedback.StudentUserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(feedback => feedback.SupervisorUser)
                .WithMany()
                .HasForeignKey(feedback => feedback.SupervisorUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        ConfigureContributionModule(modelBuilder);
    }
}
