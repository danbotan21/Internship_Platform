using InternshipPlatform.Domain;
using InternshipPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.DataAccess.Context;

public partial class AppDbContext
{
    public DbSet<Contribution> Contributions => Set<Contribution>();

    public DbSet<ContributionRevision> ContributionRevisions =>
        Set<ContributionRevision>();

    public DbSet<ContributionEvidence> ContributionEvidence =>
        Set<ContributionEvidence>();

    public DbSet<ContributionReview> ContributionReviews =>
        Set<ContributionReview>();

    public DbSet<ContributionReviewCheck> ContributionReviewChecks =>
        Set<ContributionReviewCheck>();

    public DbSet<ContributionFeedbackItem> ContributionFeedbackItems =>
        Set<ContributionFeedbackItem>();

    public DbSet<ContributionCollaborator> ContributionCollaborators =>
        Set<ContributionCollaborator>();

    private static void ConfigureContributionModule(ModelBuilder modelBuilder)
    {
        ConfigureContribution(modelBuilder);
        ConfigureContributionRevision(modelBuilder);
        ConfigureContributionEvidence(modelBuilder);
        ConfigureContributionReview(modelBuilder);
        ConfigureContributionReviewCheck(modelBuilder);
        ConfigureContributionFeedbackItem(modelBuilder);
        ConfigureContributionCollaborator(modelBuilder);
    }

    private static void ConfigureContribution(ModelBuilder modelBuilder)
    {
        var contribution = modelBuilder.Entity<Contribution>();

        contribution.ToTable("Contributions", table =>
        {
            table.HasCheckConstraint(
                "CK_Contributions_CurrentRevisionNumber",
                "\"CurrentRevisionNumber\" >= 1");
            table.HasCheckConstraint(
                "CK_Contributions_Status",
                "\"Status\" IN (1, 2, 3, 4, 5)");
        });

        contribution.HasKey(item => item.Id);
        contribution.Property(item => item.Status).HasConversion<int>();
        contribution.Property(item => item.CurrentRevisionNumber).HasDefaultValue(1);

        contribution
            .HasIndex(item => new { item.StudentId, item.Status });
        contribution
            .HasIndex(item => new { item.Status, item.UpdatedAtUtc });

        contribution
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(item => item.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        contribution
            .HasMany(item => item.Revisions)
            .WithOne(revision => revision.Contribution)
            .HasForeignKey(revision => revision.ContributionId)
            .OnDelete(DeleteBehavior.Cascade);

        contribution
            .HasMany(item => item.Collaborators)
            .WithOne(collaborator => collaborator.Contribution)
            .HasForeignKey(collaborator => collaborator.ContributionId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureContributionRevision(ModelBuilder modelBuilder)
    {
        var revision = modelBuilder.Entity<ContributionRevision>();

        revision.ToTable("ContributionRevisions", table =>
        {
            table.HasCheckConstraint(
                "CK_ContributionRevisions_RevisionNumber",
                "\"RevisionNumber\" >= 1");
            table.HasCheckConstraint(
                "CK_ContributionRevisions_Category",
                "\"Category\" IN (1, 2, 3, 4, 5, 6)");
            table.HasCheckConstraint(
                "CK_ContributionRevisions_WorkPeriod",
                "\"WorkStartDate\" IS NULL OR \"WorkEndDate\" IS NULL " +
                "OR \"WorkEndDate\" >= \"WorkStartDate\"");
        });

        revision.HasKey(item => item.Id);
        revision.Property(item => item.Category).HasConversion<int>();
        revision.Property(item => item.Title).HasMaxLength(200);
        revision.Property(item => item.Description).HasMaxLength(4000);
        revision.Property(item => item.OwnRole).HasMaxLength(500);
        revision.Property(item => item.LinkedIssueRepository).HasMaxLength(200);
        revision.Property(item => item.LinkedIssueTitle).HasMaxLength(300);
        revision.Property(item => item.LinkedIssueState).HasMaxLength(20);
        revision.Property(item => item.RevisionNote).HasMaxLength(1000);

        revision
            .HasIndex(item => new { item.ContributionId, item.RevisionNumber })
            .IsUnique();

        revision
            .HasMany(item => item.Evidence)
            .WithOne(evidence => evidence.ContributionRevision)
            .HasForeignKey(evidence => evidence.ContributionRevisionId)
            .OnDelete(DeleteBehavior.Cascade);

        revision
            .HasMany(item => item.Reviews)
            .WithOne(review => review.ContributionRevision)
            .HasForeignKey(review => review.ContributionRevisionId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureContributionEvidence(ModelBuilder modelBuilder)
    {
        var evidence = modelBuilder.Entity<ContributionEvidence>();

        evidence.ToTable("ContributionEvidence", table =>
        {
            table.HasCheckConstraint(
                "CK_ContributionEvidence_Type",
                "\"Type\" IN (1, 2, 3, 4, 5)");
            table.HasCheckConstraint(
                "CK_ContributionEvidence_Content",
                "(\"Type\" = 1 AND \"ExternalUrl\" IS NOT NULL AND \"StoragePath\" IS NULL) " +
                "OR (\"Type\" IN (2, 3) AND \"StoragePath\" IS NOT NULL AND \"ExternalUrl\" IS NULL) " +
                "OR (\"Type\" IN (4, 5) AND \"GitHubRepository\" IS NOT NULL AND \"GitHubReference\" IS NOT NULL)");
        });

        evidence.HasKey(item => item.Id);
        evidence.Property(item => item.Type).HasConversion<int>();
        evidence.Property(item => item.Name).HasMaxLength(200);
        evidence.Property(item => item.Caption).HasMaxLength(500);
        evidence.Property(item => item.ExternalUrl).HasMaxLength(2048);
        evidence.Property(item => item.StoragePath).HasMaxLength(500);
        evidence.Property(item => item.OriginalFileName).HasMaxLength(255);
        evidence.Property(item => item.ContentType).HasMaxLength(150);
        evidence.Property(item => item.GitHubRepository).HasMaxLength(200);
        evidence.Property(item => item.GitHubReference).HasMaxLength(64);
        evidence.Property(item => item.GitHubAuthorLogin).HasMaxLength(100);
        evidence.Property(item => item.GitHubState).HasMaxLength(20);
        evidence.Property(item => item.GitHubChecksConclusion).HasMaxLength(20);
        evidence.Property(item => item.GitHubDetailsJson).HasColumnType("jsonb");
    }

    private static void ConfigureContributionReview(ModelBuilder modelBuilder)
    {
        var review = modelBuilder.Entity<ContributionReview>();

        review.ToTable("ContributionReviews", table =>
        {
            table.HasCheckConstraint(
                "CK_ContributionReviews_Outcome",
                "\"Outcome\" IN (1, 2, 3)");
            table.HasCheckConstraint(
                "CK_ContributionReviews_RejectionReason",
                "(\"Outcome\" = 3 AND \"RejectionReason\" IS NOT NULL) " +
                "OR (\"Outcome\" <> 3 AND \"RejectionReason\" IS NULL)");
        });

        review.HasKey(item => item.Id);
        review.Property(item => item.Outcome).HasConversion<int>();
        review.Property(item => item.RejectionReason).HasConversion<int?>();
        review.Property(item => item.Summary).HasMaxLength(2000);

        review
            .HasIndex(item => item.ContributionRevisionId)
            .IsUnique();
        review.HasIndex(item => item.MentorId);

        review
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(item => item.MentorId)
            .OnDelete(DeleteBehavior.Restrict);

        review
            .HasMany(item => item.Checks)
            .WithOne(check => check.Review)
            .HasForeignKey(check => check.ContributionReviewId)
            .OnDelete(DeleteBehavior.Cascade);

        review
            .HasMany(item => item.FeedbackItems)
            .WithOne(feedback => feedback.Review)
            .HasForeignKey(feedback => feedback.ContributionReviewId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureContributionReviewCheck(ModelBuilder modelBuilder)
    {
        var check = modelBuilder.Entity<ContributionReviewCheck>();

        check.ToTable("ContributionReviewChecks", table =>
        {
            table.HasCheckConstraint(
                "CK_ContributionReviewChecks_Criterion",
                "\"Criterion\" IN (1, 2, 3, 4, 5)");
        });

        check.HasKey(item => item.Id);
        check.Property(item => item.Criterion).HasConversion<int>();
        check.Property(item => item.Comment).HasMaxLength(1000);

        check
            .HasIndex(item => new { item.ContributionReviewId, item.Criterion })
            .IsUnique();
    }

    private static void ConfigureContributionFeedbackItem(ModelBuilder modelBuilder)
    {
        var feedback = modelBuilder.Entity<ContributionFeedbackItem>();

        feedback.ToTable("ContributionFeedbackItems");
        feedback.HasKey(item => item.Id);
        feedback.Property(item => item.Message).HasMaxLength(1000);
        feedback.Property(item => item.Response).HasMaxLength(1000);

        feedback
            .HasIndex(item => new { item.ContributionReviewId, item.Position })
            .IsUnique();
    }

    private static void ConfigureContributionCollaborator(ModelBuilder modelBuilder)
    {
        var collaborator = modelBuilder.Entity<ContributionCollaborator>();

        collaborator.ToTable("ContributionCollaborators", table =>
        {
            table.HasCheckConstraint(
                "CK_ContributionCollaborators_Status",
                "\"Status\" IN (1, 2, 3)");
            table.HasCheckConstraint(
                "CK_ContributionCollaborators_Area",
                "\"Area\" IN (1, 2, 3, 4, 5, 6)");
            table.HasCheckConstraint(
                "CK_ContributionCollaborators_DisputeData",
                "(\"Status\" = 3 AND \"DisputeReason\" IS NOT NULL) " +
                "OR (\"Status\" <> 3)");
        });

        collaborator.HasKey(item => item.Id);
        collaborator.Property(item => item.Status).HasConversion<int>();
        collaborator.Property(item => item.Area).HasConversion<int>();
        collaborator.Property(item => item.Name).HasMaxLength(200);
        collaborator.Property(item => item.Email).HasMaxLength(320);
        collaborator.Property(item => item.RoleDescription).HasMaxLength(300);
        collaborator.Property(item => item.DisputeReason).HasMaxLength(1000);
        collaborator.Property(item => item.ResolutionNote).HasMaxLength(1000);

        collaborator
            .HasIndex(item => new { item.ContributionId, item.UserId })
            .IsUnique();
        collaborator.HasIndex(item => new { item.UserId, item.Status });

        collaborator
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(item => item.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
