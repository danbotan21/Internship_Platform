using System;
using System.Collections.Generic;
using System.Text;

namespace InternshipPlatform.Domain.Models.Opportunity;

public class CreateOpportunityDto
{
    public string Title { get; set; }
    public string Description { get; set; }
    public string Requirements { get; set; }
    public string Location { get; set; }
    public string Company { get; set; }
}
