using InternshipPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InternshipPlatform.DataAccess.Configurations;

public class CompanyVerificationRequestConfiguration 
    : IEntityTypeConfiguration<CompanyVerificationRequest>
{
    public void Configure(EntityTypeBuilder<CompanyVerificationRequest> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.LegalName).HasMaxLength(200);
        builder.Property(r => r.RegistrationNumber).HasMaxLength(100);
        builder.Property(r => r.Website).HasMaxLength(200);
        builder.Property(r => r.Headquarters).HasMaxLength(200);
        builder.Property(r => r.Industry).HasMaxLength(50);
        builder.Property(r => r.CompanySize).HasMaxLength(50);

        builder.Property(r => r.RequesterName).HasMaxLength(200);
        builder.Property(r => r.RequesterEmail).HasMaxLength(200);
        builder.Property(r => r.RequesterPosition).HasMaxLength(30);
        builder.Property(r => r.RequesterPhone).HasMaxLength(30);

        builder.Property(r => r.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(r => r.RejectionReason).HasMaxLength(1000);
        
        builder.HasOne(r => r.Requester)
            .WithMany()
            .HasForeignKey(r => r.RequesterUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.DecidedBy)
            .WithMany()
            .HasForeignKey(r => r.DecidedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Company)
            .WithOne()
            .HasForeignKey<CompanyVerificationRequest>(r => r.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);


        builder.HasIndex(r => r.Status);
    }
}