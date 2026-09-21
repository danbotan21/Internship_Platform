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
    public DbSet<Opportunity> Opportunities => Set<Opportunity>();
    public DbSet<Application> Applications => Set<Application>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ── User ──────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).IsRequired();
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.Role).HasConversion<string>();
        });

        // ── RefreshToken ─────────────────────────────────────────────────
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(rt => rt.Token).IsUnique();

            entity.HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
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
    }
}
