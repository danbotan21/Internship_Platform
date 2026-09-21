using System.Text;
using System.Text.Json.Serialization;
using InternshipPlatform.BusinessLayer.Auth;
using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.BusinessLayer.Resources;
using InternshipPlatform.DataAccess.Resources;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Resources;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

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
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' was not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddScoped<IResourceRepository, ResourceRepository>();
builder.Services.AddScoped<ResourceService>();

var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()
    ?? throw new InvalidOperationException("Jwt configuration section was not found.");

builder.Services.AddSingleton(jwtSettings);
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
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

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await SeedResourcesAsync(app.Services);

app.Run();

static async Task SeedResourcesAsync(IServiceProvider services)
{
    using var scope = services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    await db.Database.MigrateAsync();

    var existingSlugs = await db.Resources
        .Select(resource => resource.Slug)
        .ToHashSetAsync();

    var creatorId = Guid.Parse("00000000-0000-0000-0000-000000000001");
    var now = DateTime.UtcNow;

    var seedResources = new[]
    {
        new Resource
        {
            Id = Guid.NewGuid(),
            CreatedByUserId = creatorId,
            Slug = "first-week-internship-guide",
            Type = "Guide",
            Format = "Article",
            Title = "Your First Week of Internship",
            Description = "A practical guide for planning your first week, asking useful questions, and building a reliable working rhythm.",
            Owner = "Programme team",
            MentorName = "Ion Popescu",
            Category = "Guides and learning",
            Tags = ["Onboarding", "Planning", "Communication"],
            ContentHtml = "<h2>Start with context</h2><p>Learn how the team works, where decisions are documented, and who can help you unblock a task.</p><h2>Plan a small first win</h2><p>Choose one clearly scoped task and agree on what done means before you start.</p><h2>Close the week well</h2><p>Share progress, open questions, and one thing you want to improve next week.</p>",
            IsDraft = false,
            CreatedAt = now,
            UpdatedAt = now
        },
        new Resource
        {
            Id = Guid.NewGuid(),
            CreatedByUserId = creatorId,
            Slug = "weekly-project-update-template",
            Type = "Template",
            Format = "Template",
            Title = "Weekly Project Update Template",
            Description = "A concise structure for reporting progress, risks, decisions, and the next steps to your mentor.",
            Owner = "Programme team",
            MentorName = "Ion Popescu",
            Category = "Templates",
            Tags = ["Status update", "Mentoring", "Planning"],
            ContentHtml = "<h2>Progress</h2><p>List the work completed this week and link to the relevant deliverables.</p><h2>Challenges</h2><p>Describe blockers with enough context for someone else to help.</p><h2>Next steps</h2><p>Write the next actions, owners, and expected dates.</p>",
            IsDraft = false,
            CreatedAt = now,
            UpdatedAt = now
        },
        new Resource
        {
            Id = Guid.NewGuid(),
            CreatedByUserId = creatorId,
            Slug = "internship-working-agreements",
            Type = "Policies",
            Format = "Article",
            Title = "Internship Working Agreements",
            Description = "The core expectations for communication, confidentiality, feedback, and responsible use of team systems.",
            Owner = "Programme team",
            MentorName = "Ion Popescu",
            Category = "Policies",
            Tags = ["Expectations", "Feedback", "Confidentiality"],
            ContentHtml = "<h2>Communicate early</h2><p>Raise risks and blockers as soon as they become visible, with a proposed next step when possible.</p><h2>Protect information</h2><p>Keep company and client information inside approved tools and follow the team access rules.</p><h2>Use feedback</h2><p>Ask clarifying questions, agree on an action, and revisit the outcome with your mentor.</p>",
            IsDraft = false,
            CreatedAt = now,
            UpdatedAt = now
        }
    };

    db.Resources.AddRange(seedResources.Where(resource => !existingSlugs.Contains(resource.Slug)));

    await db.SaveChangesAsync();
}
