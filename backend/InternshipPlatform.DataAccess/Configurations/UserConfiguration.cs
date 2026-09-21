using InternshipPlatform.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InternshipPlatform.DataAccess.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email).IsRequired().HasMaxLength(200);
        builder.Property(u => u.PasswordHash).IsRequired().HasMaxLength(500);
        builder.Property(u => u.FullName).HasMaxLength(200);
        builder.Property(u => u.University).HasMaxLength(200);
        builder.Property(u => u.AcademicGroup).HasMaxLength(50);
        builder.Property(u => u.Programme).HasMaxLength(100);
        builder.Property(u => u.GitHubUsername).HasMaxLength(100);

        builder.HasIndex(u => u.MentorId);

        builder.HasOne(u => u.Mentor)
            .WithMany(u => u.Students)
            .HasForeignKey(u => u.MentorId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.Property(u => u.Role)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(u => u.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasIndex(u => u.Email).IsUnique();
    }
}
