using Microsoft.EntityFrameworkCore;
using InternshipPlatform.Domain.Entities.User;
using Microsoft.Extensions.Configuration;

namespace InternshipPlatform.DataAccess.Context;

public class AppDbContext : DbContext
{
    //public AppDbContext(DbContextOptions<AppDbContext> options)
    //    : base(options)
    //{
    //}

    public DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            var configuration = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json", optional: true)
                .AddEnvironmentVariables()
                .Build();

            var connectionString =
                configuration.GetConnectionString("DefaultConnection");

            optionsBuilder.UseNpgsql(connectionString);
        }
    }
}