using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace InternshipPlatform.Domain.Entities.User;

public enum UserRole
{
    Intern,
    Mentor,
    Admin
}

public class UserEntity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required(ErrorMessage = "Name is required.")]
    [MaxLength(100)]
    public string Name { get; set; }

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Wrong email format.")]
    [MaxLength(100)]
    public string Email { get; set; }
    public UserRole Role { get; set; }
    public string Password { get; set; }
    public string PasswordSalt { get; set; }
    public string? Gender { get; set; }
    public int? Age { get; set; }
    public string Organisation { get; set; }
    public DateTime? LastActive { get; set; }

    public ICollection<Opportunity> CreatedOpportunities { get; set; }

}
