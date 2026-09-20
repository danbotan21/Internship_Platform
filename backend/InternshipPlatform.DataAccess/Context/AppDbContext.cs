using Microsoft.EntityFrameworkCore;
using InternshipPlatform.Domain.Entities;

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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
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
    }
}