using System.IO;
using System.Text;
using System.Text.Json.Serialization;
using InternshipPlatform.API.Infrastructure;
using InternshipPlatform.BusinessLayer.Auth;
using InternshipPlatform.BusinessLayer.Messaging;
using InternshipPlatform.BusinessLayer.Services;
using InternshipPlatform.BusinessLayer.Opportunity;
using InternshipPlatform.BusinessLayer.Users;
using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.BusinessLayer.Internship;
using InternshipPlatform.BusinessLayer.Progress;
using InternshipPlatform.BusinessLayer.Structure;
using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain;
using InternshipPlatform.Domain.Enums;
using InternshipPlatform.BusinessLayer.Resources;
using InternshipPlatform.DataAccess.Resources;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Resources;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using InternshipPlatform.DataAccess.Seed;
using InternshipPlatform.BusinessLayer.Admin.Users;
using InternshipPlatform.BusinessLayer.Admin.Verification;
using InternshipPlatform.BusinessLayer.Admin.Companies;
using InternshipPlatform.BusinessLayer.Admin.Dashboard;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        // The frontend types mark absent fields as optional, so null is omitted
        // rather than sent as an explicit null.
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Host=localhost;Port=5432;Database=internship_platform;Username=internship_user;Password=password1234";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddScoped<IResourceRepository, ResourceRepository>();
builder.Services.AddScoped<ResourceService>();

builder.Services.AddScoped<IUserDirectoryService, UserDirectoryService>();
builder.Services.AddScoped<IUserLifecycleService, UserLifecycleService>();
builder.Services.AddScoped<ICompanyVerificationService, CompanyVerificationService>();
builder.Services.AddScoped<ICompanyAdminService, CompanyAdminService>();
builder.Services.AddScoped<IAdminDashboardService, AdminDashboardService>();


// Register business services
builder.Services.AddScoped<IDocumentService, DocumentService>();

// Auth / JWT
var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()
    ?? throw new InvalidOperationException("Jwt configuration section was not found.");

builder.Services.AddSingleton(jwtSettings);
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IMessagingService, MessagingService>();

// Opportunity module
builder.Services.AddScoped<OpportunityActions>();
builder.Services.AddScoped<ApplicationActions>();
builder.Services.AddScoped<IOpportunityLogic, OpportunityLogic>();
builder.Services.AddScoped<IApplicationLogic, ApplicationLogic>();

// User module
builder.Services.AddScoped<UserActions>();
builder.Services.AddScoped<IUserLogic, UserLogic>();

builder.Services.AddHttpContextAccessor();

var programSettings = builder.Configuration.GetSection("Program").Get<ProgramSettings>() ?? new ProgramSettings();
builder.Services.AddSingleton(programSettings);
builder.Services.AddScoped<IProgressService, ProgressService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Keep "sub" as "sub" instead of letting the handler rename it to the
        // legacy nameidentifier claim, so controllers can read it by its JWT name.
        options.MapInboundClaims = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SigningKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddScoped<IContributionAction, ContributionActionExecution>();
builder.Services.AddScoped<IContributionFileStorageAction, LocalContributionFileStorage>();

builder.Services.AddScoped<IInternshipDirectoryAction, DatabaseInternshipDirectory>();

builder.Services.AddMemoryCache();
builder.Services.Configure<GitHubOptions>(builder.Configuration.GetSection("GitHub"));
builder.Services.AddHttpClient<IGitHubAction, GitHubApiClient>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Ensure uploads folder exists
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

// Configure the HTTP request pipeline.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Internflow API v1");
    });
}

app.UseCors("AllowAll");
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await SeedData.EnsureSeededAsync(context);
}
await SeedResourcesAsync(app.Services);
await EnsureAdminAsync(app.Services, app.Configuration);

app.Run();

static async Task SeedResourcesAsync(IServiceProvider services)
{
    using var scope = services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    await db.Database.MigrateAsync();

    var demoSlugs = new[]
    {
        "first-week-internship-guide",
        "weekly-project-update-template",
        "internship-working-agreements"
    };

    var demoResources = await db.Resources
        .Where(resource => demoSlugs.Contains(resource.Slug))
        .ToListAsync();

    if (demoResources.Count > 0)
        db.Resources.RemoveRange(demoResources);

    await db.SaveChangesAsync();
}

// Makes sure the platform always has an admin to sign in with, including after the
// database is recreated. Credentials come from configuration, never from source.
static async Task EnsureAdminAsync(IServiceProvider services, IConfiguration config)
{
    var email = config["Bootstrap:AdminEmail"];
    var password = config["Bootstrap:AdminPassword"];
    if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
    {
        return;
    }

    using var scope = services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    var normalized = email.Trim().ToLowerInvariant();
    var user = await db.Users.FirstOrDefaultAsync(u => u.Email == normalized);

    if (user is null)
    {
        db.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            Email = normalized,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            FullName = "Platform administrator",
            Role = UserRole.Admin,
            Status = UserStatus.Active,
            EmailVerified = true,
            CreatedAt = DateTimeOffset.UtcNow,
        });
    }
    else if (user.Role != UserRole.Admin)
    {
        user.Role = UserRole.Admin;
    }

    await db.SaveChangesAsync();
}
