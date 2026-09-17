

using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Structure;

public class OpportunityActions
{
    private readonly AppDbContext _context;


    //public Opportunity CreateOpportunityAction(Opportunity opportunity)
    //{
    //    _context.Opportunities.Add(opportunity);
    //    _context.SaveChanges();

    //    return opportunity;
    //}
}
