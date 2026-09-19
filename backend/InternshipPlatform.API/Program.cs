using InternshipPlatform.DataAccess.Context;
using Microsoft.EntityFrameworkCore;
using InternshipPlatform.DataAccess.Seed;
using System.Text.Json.Serialization;
using InternshipPlatform.BusinessLayer.Admin.Users;
using InternshipPlatform.DataAccess.Admin.Users;
using InternshipPlatform.BusinessLayer.Admin.Verification;
using InternshipPlatform.DataAccess.Admin.Verification;
using InternshipPlatform.BusinessLayer.Admin.Companies;
using InternshipPlatform.DataAccess.Admin.Companies;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options => 
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

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

builder.Services.AddScoped<IUserDirectoryService, UserDirectoryService>();
builder.Services.AddScoped<IUserLifecycleService, UserLifecycleService>();
builder.Services.AddScoped<ICompanyVerificationService, CompanyVerificationService>();
builder.Services.AddScoped<ICompanyAdminService, CompanyAdminService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await SeedData.EnsureSeededAsync(context);
}

app.Run();
