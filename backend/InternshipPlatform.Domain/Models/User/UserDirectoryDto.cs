using System;
using InternshipPlatform.Domain.Entities.User;

namespace InternshipPlatform.Domain.Models.User;

public class UserDirectoryDto
{
    public int Id { get; set; }

    public string Name { get; set; }

    public string Email { get; set; }

    public string Status { get; set; }

    public UserRole Role { get; set; }

    public string Organisation { get; set; }

    public DateTime? LastActive { get; set; }
}
