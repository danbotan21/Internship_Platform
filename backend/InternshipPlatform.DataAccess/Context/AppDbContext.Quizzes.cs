using InternshipPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.DataAccess.Context;

public partial class AppDbContext
{
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();

    private static void ConfigureQuizzesModule(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Quiz>(entity =>
        {
            entity.HasKey(q => q.Id);
            entity.HasIndex(q => q.Slug).IsUnique();
            entity.Property(q => q.Title).HasMaxLength(200).IsRequired();
            entity.Property(q => q.Description).HasMaxLength(1000);
            entity.Property(q => q.Category).HasMaxLength(100);
            entity.Property(q => q.Difficulty).HasConversion<string>().HasMaxLength(20);
            entity.Property(q => q.CreatedAt).HasColumnType("timestamp with time zone");
            entity.Property(q => q.UpdatedAt).HasColumnType("timestamp with time zone");

            entity.HasOne(q => q.Mentor)
                .WithMany()
                .HasForeignKey(q => q.MentorId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(q => q.Questions)
                .WithOne(qq => qq.Quiz)
                .HasForeignKey(qq => qq.QuizId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(q => q.Attempts)
                .WithOne(qa => qa.Quiz)
                .HasForeignKey(qa => qa.QuizId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<QuizQuestion>(entity =>
        {
            entity.HasKey(qq => qq.Id);
            entity.Property(qq => qq.NumberLabel).HasMaxLength(20);
            entity.Property(qq => qq.Category).HasMaxLength(100);
            entity.Property(qq => qq.QuestionText).IsRequired();
            entity.Property(qq => qq.CorrectOptionId).HasMaxLength(10).IsRequired();
            entity.Property(qq => qq.OptionsJson).HasColumnType("text").IsRequired();
            entity.HasIndex(qq => new { qq.QuizId, qq.OrderIndex });
        });

        modelBuilder.Entity<QuizAttempt>(entity =>
        {
            entity.HasKey(qa => qa.Id);
            entity.Property(qa => qa.UserName).HasMaxLength(150);
            entity.Property(qa => qa.UserEmail).HasMaxLength(200);
            entity.Property(qa => qa.Status).HasMaxLength(20);
            entity.Property(qa => qa.ViolationsJson).HasColumnType("text");
            entity.Property(qa => qa.AnswersJson).HasColumnType("text");
            entity.Property(qa => qa.CompletedAt).HasColumnType("timestamp with time zone");

            entity.HasOne(qa => qa.User)
                .WithMany()
                .HasForeignKey(qa => qa.UserId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(qa => qa.QuizId);
            entity.HasIndex(qa => qa.UserId);
        });
    }
}
