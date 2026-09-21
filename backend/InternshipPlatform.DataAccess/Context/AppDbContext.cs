using System;
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

    // Auth entities
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // Document entities
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<DocumentAudit> DocumentAudits => Set<DocumentAudit>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User configuration ──
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).IsRequired();
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.Role).HasConversion<string>();
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(rt => rt.Token).IsUnique();

            entity.HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Document configuration ──
        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(d => d.Id);
            entity.Property(d => d.Title).IsRequired().HasMaxLength(256);
            entity.Property(d => d.FileName).IsRequired().HasMaxLength(256);
            entity.Property(d => d.Category).IsRequired().HasMaxLength(64);
            entity.Property(d => d.FileType).IsRequired().HasMaxLength(32);
            entity.Property(d => d.Status).IsRequired().HasMaxLength(64);
            entity.Property(d => d.SigningStatus).IsRequired().HasMaxLength(64);
            entity.Property(d => d.VisibilityRole).IsRequired().HasMaxLength(64);
            entity.Property(d => d.FileUrl).HasMaxLength(1024);
            entity.Property(d => d.UploadedBy).HasMaxLength(128);

            entity.HasMany(d => d.Audits)
                  .WithOne(a => a.Document)
                  .HasForeignKey(a => a.DocumentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DocumentAudit>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Action).IsRequired().HasMaxLength(64);
            entity.Property(a => a.PerformedBy).IsRequired().HasMaxLength(128);
            entity.Property(a => a.Details).HasMaxLength(1024);
        });

        // Seed initial documents matching the screenshot
        var doc1Id = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var doc2Id = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var doc3Id = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var doc4Id = Guid.Parse("44444444-4444-4444-4444-444444444444");

        modelBuilder.Entity<Document>().HasData(
            new Document
            {
                Id = doc1Id,
                Title = "Spring Milestone 2 Report",
                FileName = "Spring_Milestone_2_Report.pdf",
                Category = "Report",
                FileUrl = "/uploads/Spring_Milestone_2_Report.pdf",
                FileType = "pdf",
                Size = 1468006, // 1.4 MB
                Version = 3,
                Status = "Approved",
                SigningStatus = "Complete",
                TotalSignatures = 3,
                CompletedSignatures = 3,
                VisibilityRole = "Public",
                IsMandatory = true,
                ApprovedAt = new DateTime(2025, 10, 24, 14, 0, 0, DateTimeKind.Utc),
                ApprovedBy = "Dr. Michael Chen (Mentor)",
                UploadedBy = "Ana Popescu",
                CreatedAt = new DateTime(2025, 10, 24, 10, 30, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 10, 24, 14, 0, 0, DateTimeKind.Utc)
            },
            new Document
            {
                Id = doc2Id,
                Title = "Institutional Sign Off Agreement",
                FileName = "Institutional_Sign_Off_Agreement.docx",
                Category = "Agreement",
                FileUrl = "/uploads/Institutional_Sign_Off_Agreement.docx",
                FileType = "docx",
                Size = 430080, // 420 KB
                Version = 1,
                Status = "Pending",
                SigningStatus = "SignedByMentor",
                TotalSignatures = 3,
                CompletedSignatures = 2,
                VisibilityRole = "Public",
                IsMandatory = true,
                UploadedBy = "Ana Popescu",
                CreatedAt = new DateTime(2025, 10, 19, 11, 15, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 10, 19, 11, 15, 0, DateTimeKind.Utc)
            },
            new Document
            {
                Id = doc3Id,
                Title = "Completed Practicum Evaluation",
                FileName = "Completed_Practicum_Evaluation.xlsx",
                Category = "Report",
                FileUrl = "/uploads/Completed_Practicum_Evaluation.xlsx",
                FileType = "xlsx",
                Size = 2202009, // 2.1 MB
                Version = 2,
                Status = "Approved",
                SigningStatus = "Complete",
                TotalSignatures = 3,
                CompletedSignatures = 3,
                VisibilityRole = "MentorOnly",
                IsMandatory = false,
                ApprovedAt = new DateTime(2025, 10, 14, 16, 20, 0, DateTimeKind.Utc),
                ApprovedBy = "Elena Vasilescu (Coordinator)",
                UploadedBy = "Ana Popescu",
                CreatedAt = new DateTime(2025, 10, 14, 9, 45, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 10, 14, 16, 20, 0, DateTimeKind.Utc)
            },
            new Document
            {
                Id = doc4Id,
                Title = "Health & Safety Compliance Form",
                FileName = "Health_Safety_Compliance_Form.pdf",
                Category = "Agreement",
                FileUrl = "/uploads/Health_Safety_Compliance_Form.pdf",
                FileType = "pdf",
                Size = 317440, // 310 KB
                Version = 1,
                Status = "Pending",
                SigningStatus = "SignedByStudent",
                TotalSignatures = 3,
                CompletedSignatures = 2,
                VisibilityRole = "Public",
                IsMandatory = true,
                ExpiresAt = new DateTime(2025, 11, 15, 0, 0, 0, DateTimeKind.Utc),
                UploadedBy = "Ana Popescu",
                CreatedAt = new DateTime(2025, 10, 3, 8, 30, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 10, 3, 8, 30, 0, DateTimeKind.Utc)
            }
        );
    }
}
