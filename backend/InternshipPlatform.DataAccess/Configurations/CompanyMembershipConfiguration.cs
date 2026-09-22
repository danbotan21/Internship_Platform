using InternshipPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InternshipPlatform.DataAccess.Configurations;

public class CompanyMembershipConfiguration : IEntityTypeConfiguration<CompanyMembership>
{
    public void Configure(EntityTypeBuilder<CompanyMembership> builder)
    {
        builder.HasKey(m => m.UserId);

        builder.Property(m => m.Role)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasOne(m => m.User)
            .WithOne(u => u.Membership)
            .HasForeignKey<CompanyMembership>(m => m.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.Company)
            .WithMany(c => c.Memberships)
            .HasForeignKey(m => m.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(m => m.CompanyId);
    }
}