using InternshipPlatform.Domain;
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
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<ConversationMember> ConversationMembers => Set<ConversationMember>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<MessageDelivery> MessageDeliveries => Set<MessageDelivery>();
    public DbSet<MessageRead> MessageReads => Set<MessageRead>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationRecipient> NotificationRecipients => Set<NotificationRecipient>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).IsRequired();
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.Role).HasConversion<string>();
            entity.Property(u => u.Organization).IsRequired();

            // A mentor keeps their account when a mentee is removed, and an
            // intern simply loses the link when their mentor is deleted.
            entity.HasOne(u => u.Mentor)
                .WithMany(u => u.Mentees)
                .HasForeignKey(u => u.MentorId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.OwnsOne(u => u.Contact, contact =>
            {
                contact.Property(c => c.Email).HasColumnName("ContactEmail").IsRequired();
                contact.Property(c => c.Phone).HasColumnName("ContactPhone").IsRequired();
                contact.Property(c => c.Location).HasColumnName("ContactLocation").IsRequired();
                contact.Property(c => c.Availability).HasColumnName("ContactAvailability").IsRequired();
                contact.Property(c => c.PreferredChannel)
                    .HasColumnName("ContactPreferredChannel")
                    .HasConversion<string>()
                    .IsRequired();
            });
            entity.Navigation(u => u.Contact).IsRequired();
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(rt => rt.Token).IsUnique();

            entity.HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

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

        modelBuilder.Entity<Notification>(entity =>
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
    }
}
