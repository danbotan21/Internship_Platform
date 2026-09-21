using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models.Common;
using InternshipPlatform.Domain.Models.Opportunity;

namespace InternshipPlatform.BusinessLayer.Opportunity;

public interface IOpportunityLogic
{
    // Public / Student
    Task<ApiResponse<PagedResult<OpportunityListItemDto>>> GetOpportunitiesAsync(OpportunityQueryParams query, Guid? currentUserId);
    Task<ApiResponse<OpportunityDetailDto>> GetOpportunityByIdAsync(Guid id, Guid? currentUserId);
    Task<ApiResponse<bool>> SaveOpportunityAsync(Guid opportunityId, Guid studentId);
    Task<ApiResponse<bool>> UnsaveOpportunityAsync(Guid opportunityId, Guid studentId);

    // Mentor
    Task<ApiResponse<List<OpportunityListItemDto>>> GetMentorOpportunitiesAsync(Guid mentorId);
    Task<ApiResponse<OpportunityDetailDto>> CreateOpportunityAsync(CreateOpportunityDto dto, Guid mentorId);
    Task<ApiResponse<OpportunityDetailDto>> UpdateOpportunityAsync(Guid id, CreateOpportunityDto dto, Guid mentorId);
    Task<ApiResponse<bool>> PatchOpportunityStatusAsync(Guid id, OpportunityStatus newStatus, Guid mentorId);
}
