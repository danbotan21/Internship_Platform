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

    public DbSet<Resource> Resources => Set<Resource>();
    public DbSet<ResourceFavorite> ResourceFavorites => Set<ResourceFavorite>();
    public DbSet<Notification> Notifications => Set<Notification>();
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
            entity.Property(favorite => favorite.CreatedAt)
                .HasColumnType("timestamp with time zone");

            entity.HasOne(favorite => favorite.Resource)
                .WithMany(resource => resource.Favorites)
                .HasForeignKey(favorite => favorite.ResourceId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    

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

