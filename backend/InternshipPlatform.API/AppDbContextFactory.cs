using InternshipPlatform.DataAccess.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace InternshipPlatform.API;

/// <summary>
/// Lets "dotnet ef" build the model and reach the database without booting the API host.
/// It reads the same configuration sources the running application reads - appsettings,
/// user secrets and environment variables - so a connection string set with
/// "dotnet user-secrets" applies to migrations as well as to the running app.
/// It lives in the API project because that is where the user-secrets store is defined.
/// </summary>
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        // "dotnet ef" runs with the startup project as the working directory.
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{environment}.json", optional: true)
            .AddUserSecrets<Program>(optional: true)
            .AddEnvironmentVariables()
            .Build();

        const string fallbackConnection =
            "Host=localhost;Port=5432;Database=internship_platform;Username=internship_user;Password=chitanu123";

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? fallbackConnection;

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        return new AppDbContext(options);
    }
}
