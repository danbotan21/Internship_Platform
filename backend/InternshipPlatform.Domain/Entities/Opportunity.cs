using System;
using System.Collections.Generic;
using System.Text;
using InternshipPlatform.Domain.Entities.User;

namespace InternshipPlatform.Domain.Entities;

public class Opportunity
{
    public int Id { get; set; }

    public string Title { get; set; }

    public string Description { get; set; }
    public string Requirements { get; set; }
    public string Location { get; set; }
    public string Company { get; set; }


    public int CreatedByUserId { get; set; }
    public UserEntity CreatedByUser { get; set; }
}
