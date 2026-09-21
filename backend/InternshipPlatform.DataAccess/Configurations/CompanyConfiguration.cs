using InternshipPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InternshipPlatform.DataAccess.Configurations;

public class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.LegalName).HasMaxLength(200);
        builder.Property(c => c.RegistrationNumber).HasMaxLength(100);
        builder.Property(c => c.Website).HasMaxLength(200);
        builder.Property(c => c.Headquarters).HasMaxLength(200);
        builder.Property(c => c.Industry).HasMaxLength(50);
        builder.Property(c => c.CompanySize).HasMaxLength(50);

        builder.Property(c => c.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasIndex(c => c.RegistrationNumber).IsUnique();
    }
}