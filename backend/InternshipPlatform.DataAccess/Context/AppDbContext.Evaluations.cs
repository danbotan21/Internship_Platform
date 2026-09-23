using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.DataAccess.Context;

public partial class AppDbContext
{
    public DbSet<EvaluationRubricVersion> EvaluationRubricVersions =>
        Set<EvaluationRubricVersion>();

    public DbSet<EvaluationCriterion> EvaluationCriteria => Set<EvaluationCriterion>();

    public DbSet<Evaluation> Evaluations => Set<Evaluation>();

    public DbSet<EvaluationScore> EvaluationScores => Set<EvaluationScore>();

    private static void ConfigureEvaluationModule(ModelBuilder modelBuilder)
    {
        ConfigureRubricVersion(modelBuilder);
        ConfigureEvaluationCriterion(modelBuilder);
        ConfigureEvaluation(modelBuilder);
        ConfigureEvaluationScore(modelBuilder);
    }

    private static void ConfigureRubricVersion(ModelBuilder modelBuilder)
    {
        var version = modelBuilder.Entity<EvaluationRubricVersion>();

        version.ToTable("EvaluationRubricVersions", table =>
        {
            table.HasCheckConstraint(
                "CK_EvaluationRubricVersions_Status",
                "\"Status\" IN (1, 2, 3)");
            table.HasCheckConstraint(
                "CK_EvaluationRubricVersions_VersionNumber",
                "\"VersionNumber\" >= 1");
        });

        version.HasKey(item => item.Id);
        version.Property(item => item.Status).HasConversion<int>();
        version.Property(item => item.Title).HasMaxLength(120);
        version.Property(item => item.ChangeNote).HasMaxLength(500);

        version
            .HasIndex(item => new { item.MentorId, item.VersionNumber })
            .IsUnique();

        // A mentor has at most one draft and one published version at a time.
        version
            .HasIndex(
                item => item.MentorId,
                "IX_EvaluationRubricVersions_OneDraftPerMentor")
            .HasFilter("\"Status\" = 1")
            .IsUnique();
        version
            .HasIndex(
                item => item.MentorId,
                "IX_EvaluationRubricVersions_OnePublishedPerMentor")
            .HasFilter("\"Status\" = 2")
            .IsUnique();

        version
            .HasMany(item => item.Criteria)
            .WithOne(criterion => criterion.RubricVersion)
            .HasForeignKey(criterion => criterion.RubricVersionId)
            .OnDelete(DeleteBehavior.Cascade);

        version
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(item => item.MentorId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureEvaluationCriterion(ModelBuilder modelBuilder)
    {
        var criterion = modelBuilder.Entity<EvaluationCriterion>();

        criterion.ToTable("EvaluationCriteria", table =>
        {
            table.HasCheckConstraint(
                "CK_EvaluationCriteria_Weight",
                "\"Weight\" BETWEEN 1 AND 100");
            table.HasCheckConstraint(
                "CK_EvaluationCriteria_Scale",
                "\"ScaleMax\" IN (5, 10) AND \"RatingStep\" IN (0.5, 1)");
        });

        criterion.HasKey(item => item.Id);
        criterion.Property(item => item.Name).HasMaxLength(100);
        criterion.Property(item => item.Description).HasMaxLength(500);
        criterion.Property(item => item.Guidance).HasMaxLength(1000);
        criterion.Property(item => item.RatingStep).HasPrecision(3, 1);

        criterion
            .HasIndex(item => new { item.RubricVersionId, item.Position })
            .IsUnique();
    }

    private static void ConfigureEvaluation(ModelBuilder modelBuilder)
    {
        var evaluation = modelBuilder.Entity<Evaluation>();

        evaluation.ToTable("Evaluations", table =>
        {
            table.HasCheckConstraint(
                "CK_Evaluations_Type",
                "\"Type\" IN (1, 2, 3)");
            table.HasCheckConstraint(
                "CK_Evaluations_Status",
                "\"Status\" IN (1, 2, 3)");
            table.HasCheckConstraint(
                "CK_Evaluations_Period",
                "\"PeriodEnd\" >= \"PeriodStart\"");
            table.HasCheckConstraint(
                "CK_Evaluations_FinalScore",
                "(\"Status\" = 3 AND \"FinalScore\" IS NOT NULL) OR (\"Status\" <> 3)");
        });

        evaluation.HasKey(item => item.Id);
        evaluation.Property(item => item.Type).HasConversion<int>();
        evaluation.Property(item => item.Status).HasConversion<int>();
        evaluation.Property(item => item.Strengths).HasMaxLength(2000);
        evaluation.Property(item => item.AreasForImprovement).HasMaxLength(2000);
        evaluation.Property(item => item.NextSteps).HasMaxLength(2000);
        evaluation.Property(item => item.OverallComment).HasMaxLength(2000);
        evaluation.Property(item => item.StudentResponse).HasMaxLength(1000);
        evaluation.Property(item => item.FinalScore).HasPrecision(5, 1);

        // One evaluation of each type (initial, mid-term, final) per student.
        evaluation
            .HasIndex(item => new { item.StudentId, item.Type })
            .IsUnique();
        evaluation.HasIndex(item => new { item.MentorId, item.Status });

        // Published rubric versions referenced by evaluations are never deleted.
        evaluation
            .HasOne(item => item.RubricVersion)
            .WithMany()
            .HasForeignKey(item => item.RubricVersionId)
            .OnDelete(DeleteBehavior.Restrict);

        evaluation
            .HasMany(item => item.Scores)
            .WithOne(score => score.Evaluation)
            .HasForeignKey(score => score.EvaluationId)
            .OnDelete(DeleteBehavior.Cascade);

        evaluation
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(item => item.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        evaluation
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(item => item.MentorId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureEvaluationScore(ModelBuilder modelBuilder)
    {
        var score = modelBuilder.Entity<EvaluationScore>();

        score.ToTable("EvaluationScores");
        score.HasKey(item => item.Id);
        score.Property(item => item.Rating).HasPrecision(4, 1);
        score.Property(item => item.Comment).HasMaxLength(1000);

        score
            .HasIndex(item => new { item.EvaluationId, item.CriterionId })
            .IsUnique();

        score
            .HasOne(item => item.Criterion)
            .WithMany()
            .HasForeignKey(item => item.CriterionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
