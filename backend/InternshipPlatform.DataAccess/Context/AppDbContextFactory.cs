using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace InternshipPlatform.DataAccess.Context;

/// <summary>
/// Lets "dotnet ef" build the model without booting the API host. The connection
/// is only used when a command actually talks to the database (for example
/// "database update"); adding or scripting a migration never opens it.
/// </summary>
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    private const string FallbackConnection =
        "Host=localhost;Port=5432;Database=internship_platform;Username=internship_user;Password=password";

    public AppDbContext CreateDbContext(string[] args)
    {
        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? FallbackConnection;

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        return new AppDbContext(options);
    }
}
