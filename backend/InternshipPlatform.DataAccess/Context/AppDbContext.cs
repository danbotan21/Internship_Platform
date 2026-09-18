using InternshipPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.DataAccess.Context;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Contribution> Contributions => Set<Contribution>();

    public DbSet<ContributionRevision> ContributionRevisions =>
        Set<ContributionRevision>();

    public DbSet<ContributionEvidence> ContributionEvidence =>
        Set<ContributionEvidence>();

    public DbSet<ContributionReview> ContributionReviews =>
        Set<ContributionReview>();

    public DbSet<ContributionDecision> ContributionDecisions =>
        Set<ContributionDecision>();

    public DbSet<ContributionCollaborator> ContributionCollaborators =>
        Set<ContributionCollaborator>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureContribution(modelBuilder);
        ConfigureContributionRevision(modelBuilder);
        ConfigureContributionEvidence(modelBuilder);
        ConfigureContributionReview(modelBuilder);
        ConfigureContributionDecision(modelBuilder);
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
        });

        revision.HasKey(item => item.Id);
        revision.Property(item => item.Category).HasConversion<int>();
        revision.Property(item => item.Title).HasMaxLength(200);
        revision.Property(item => item.WorkPeriod).HasMaxLength(100);
        revision.Property(item => item.Description).HasMaxLength(4000);
        revision.Property(item => item.OwnRole).HasMaxLength(500);
        revision.Property(item => item.LinkedTaskReference).HasMaxLength(100);
        revision.Property(item => item.EvidenceNote).HasMaxLength(1000);
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

        revision
            .HasMany(item => item.Decisions)
            .WithOne(decision => decision.ContributionRevision)
            .HasForeignKey(decision => decision.ContributionRevisionId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureContributionEvidence(ModelBuilder modelBuilder)
    {
        var evidence = modelBuilder.Entity<ContributionEvidence>();

        evidence.ToTable("ContributionEvidence", table =>
        {
            table.HasCheckConstraint(
                "CK_ContributionEvidence_Type",
                "\"Type\" IN (1, 2)");
            table.HasCheckConstraint(
                "CK_ContributionEvidence_Content",
                "(\"Type\" = 1 AND \"ExternalUrl\" IS NOT NULL AND \"StoragePath\" IS NULL) " +
                "OR (\"Type\" = 2 AND \"StoragePath\" IS NOT NULL AND \"ExternalUrl\" IS NULL)");
        });

        evidence.HasKey(item => item.Id);
        evidence.Property(item => item.Type).HasConversion<int>();
        evidence.Property(item => item.Name).HasMaxLength(200);
        evidence.Property(item => item.ExternalUrl).HasMaxLength(2048);
        evidence.Property(item => item.StoragePath).HasMaxLength(500);
        evidence.Property(item => item.OriginalFileName).HasMaxLength(255);
        evidence.Property(item => item.ContentType).HasMaxLength(150);
    }

    private static void ConfigureContributionReview(ModelBuilder modelBuilder)
    {
        var review = modelBuilder.Entity<ContributionReview>();

        review.ToTable("ContributionReviews");
        review.HasKey(item => item.Id);
        review.Property(item => item.Feedback).HasMaxLength(2000);

        review
            .HasIndex(item => item.ContributionRevisionId)
            .IsUnique();
        review.HasIndex(item => item.MentorId);
    }

    private static void ConfigureContributionDecision(ModelBuilder modelBuilder)
    {
        var decision = modelBuilder.Entity<ContributionDecision>();

        decision.ToTable("ContributionDecisions", table =>
        {
            table.HasCheckConstraint(
                "CK_ContributionDecisions_Decision",
                "\"Decision\" IN (1, 2)");
        });

        decision.HasKey(item => item.Id);
        decision.Property(item => item.Decision).HasConversion<int>();
        decision.Property(item => item.Reason).HasMaxLength(200);
        decision.Property(item => item.Note).HasMaxLength(2000);

        decision
            .HasIndex(item => item.ContributionRevisionId)
            .IsUnique();
        decision.HasIndex(item => item.MentorId);
    }

    private static void ConfigureContributionCollaborator(ModelBuilder modelBuilder)
    {
        var collaborator = modelBuilder.Entity<ContributionCollaborator>();

        collaborator.ToTable("ContributionCollaborators", table =>
        {
            table.HasCheckConstraint(
                "CK_ContributionCollaborators_Status",
                "\"Status\" IN (1, 2, 3, 4)");
            table.HasCheckConstraint(
                "CK_ContributionCollaborators_DisputeData",
                "(\"Status\" = 3 AND \"DisputeReason\" IS NOT NULL) " +
                "OR (\"Status\" <> 3)");
        });

        collaborator.HasKey(item => item.Id);
        collaborator.Property(item => item.Status).HasConversion<int>();
        collaborator.Property(item => item.Name).HasMaxLength(200);
        collaborator.Property(item => item.Email).HasMaxLength(320);
        collaborator.Property(item => item.NormalizedEmail).HasMaxLength(320);
        collaborator.Property(item => item.Role).HasMaxLength(500);
        collaborator.Property(item => item.DisputeReason).HasMaxLength(2000);
        collaborator.Property(item => item.ResolutionNote).HasMaxLength(2000);

        collaborator
            .HasIndex(item => new { item.ContributionId, item.NormalizedEmail })
            .IsUnique();
        collaborator.HasIndex(item => new { item.ContributionId, item.Status });
    }
}
