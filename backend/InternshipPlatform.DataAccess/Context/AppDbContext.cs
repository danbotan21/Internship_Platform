using System;
using InternshipPlatform.Domain;
using InternshipPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

// Two features ship a type called Notification: the messaging one lives in
// InternshipPlatform.Domain, the resource one in InternshipPlatform.Domain.Entities.
// Both namespaces are imported here, so each is referred to by an alias.
using MessagingNotification = InternshipPlatform.Domain.Notification;
using ResourceNotification = InternshipPlatform.Domain.Entities.Notification;

namespace InternshipPlatform.DataAccess.Context;

// Each feature module keeps its DbSets and mappings in a partial context file.
public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    // Auth entities
    public DbSet<Resource> Resources => Set<Resource>();
    public DbSet<ResourceFavorite> ResourceFavorites => Set<ResourceFavorite>();
    public DbSet<ResourceNotification> Notifications => Set<ResourceNotification>();
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

    // Document entities
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<DocumentAudit> DocumentAudits => Set<DocumentAudit>();

    // Messaging entities
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<ConversationMember> ConversationMembers => Set<ConversationMember>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<MessageDelivery> MessageDeliveries => Set<MessageDelivery>();
    public DbSet<MessageRead> MessageReads => Set<MessageRead>();
    // Named apart from the resource Notifications set above; this also keeps the
    // two features on separate tables.
    public DbSet<MessagingNotification> MessagingNotifications => Set<MessagingNotification>();
    public DbSet<NotificationRecipient> NotificationRecipients => Set<NotificationRecipient>();

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

        modelBuilder.Entity<ResourceNotification>(entity =>
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

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(rt => rt.Token).IsUnique();

            entity.HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Messaging configuration ──
        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.Property(c => c.Type).HasConversion<string>().IsRequired();
            entity.Property(c => c.Kind).HasConversion<string>();
            entity.Property(c => c.Visibility).HasConversion<string>();

            entity.HasOne(c => c.Owner)
                .WithMany()
                .HasForeignKey(c => c.OwnerId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(c => c.Type);
        });

        modelBuilder.Entity<ConversationMember>(entity =>
        {
            entity.HasKey(cm => new { cm.ConversationId, cm.UserId });

            entity.HasOne(cm => cm.Conversation)
                .WithMany(c => c.Members)
                .HasForeignKey(cm => cm.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(cm => cm.User)
                .WithMany(u => u.ConversationMemberships)
                .HasForeignKey(cm => cm.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(cm => cm.UserId);
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.Property(m => m.Body).IsRequired();

            entity.HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            // Deleting an account must not silently erase the conversation
            // history other members can still see.
            entity.HasOne(m => m.Author)
                .WithMany(u => u.Messages)
                .HasForeignKey(m => m.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(m => m.Parent)
                .WithMany(m => m.Replies)
                .HasForeignKey(m => m.ParentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(m => new { m.ConversationId, m.CreatedAt });
            entity.HasIndex(m => m.ParentId);
            entity.HasIndex(m => m.AuthorId);
        });

        modelBuilder.Entity<MessageDelivery>(entity =>
        {
            entity.HasKey(md => new { md.MessageId, md.UserId });

            entity.HasOne(md => md.Message)
                .WithMany(m => m.Deliveries)
                .HasForeignKey(md => md.MessageId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(md => md.User)
                .WithMany()
                .HasForeignKey(md => md.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(md => md.UserId);
        });

        modelBuilder.Entity<MessageRead>(entity =>
        {
            entity.HasKey(mr => new { mr.MessageId, mr.UserId });

            entity.HasOne(mr => mr.Message)
                .WithMany(m => m.Reads)
                .HasForeignKey(mr => mr.MessageId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(mr => mr.User)
                .WithMany()
                .HasForeignKey(mr => mr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(mr => mr.UserId);
        });

        modelBuilder.Entity<MessagingNotification>(entity =>
        {
            entity.Property(n => n.Category).HasConversion<string>().IsRequired();
            entity.Property(n => n.Source).HasConversion<string>().IsRequired();
            entity.Property(n => n.Title).IsRequired();
            entity.Property(n => n.Body).IsRequired();

            entity.HasOne(n => n.Sender)
                .WithMany()
                .HasForeignKey(n => n.SenderId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(n => n.Conversation)
                .WithMany()
                .HasForeignKey(n => n.ConversationId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(n => n.CreatedAt);
        });

        modelBuilder.Entity<NotificationRecipient>(entity =>
        {
            entity.HasKey(nr => new { nr.NotificationId, nr.UserId });

            entity.HasOne(nr => nr.Notification)
                .WithMany(n => n.Recipients)
                .HasForeignKey(nr => nr.NotificationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(nr => nr.User)
                .WithMany()
                .HasForeignKey(nr => nr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(nr => nr.UserId);
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
        ConfigureContributionModule(modelBuilder);
    }
}
