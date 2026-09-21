using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models.Common;
using InternshipPlatform.Domain.Models.Opportunity;

namespace InternshipPlatform.BusinessLayer.Opportunity;

public class OpportunityLogic(OpportunityActions actions) : IOpportunityLogic
{
    // ─── Public / Student ────────────────────────────────────────────────────

    public async Task<ApiResponse<PagedResult<OpportunityListItemDto>>> GetOpportunitiesAsync(
        OpportunityQueryParams query, Guid? currentUserId)
    {
        var all = await actions.GetOpenOpportunitiesAsync();

        // Filtering
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.ToLowerInvariant();
            all = all.Where(o =>
                o.Title.ToLower().Contains(s) ||
                o.Company.ToLower().Contains(s) ||
                o.Description.ToLower().Contains(s) ||
                o.Technologies.Any(t => t.ToLower().Contains(s))).ToList();
        }

        if (!string.IsNullOrWhiteSpace(query.Field))
            all = all.Where(o => o.Field == query.Field).ToList();

        if (!string.IsNullOrWhiteSpace(query.Type) &&
            Enum.TryParse<OpportunityType>(query.Type.Replace("-", ""), true, out var typeEnum))
            all = all.Where(o => o.Type == typeEnum).ToList();

        if (!string.IsNullOrWhiteSpace(query.LocationType) &&
            Enum.TryParse<LocationType>(query.LocationType.Replace("-", ""), true, out var locEnum))
            all = all.Where(o => o.LocationType == locEnum).ToList();

        if (!string.IsNullOrWhiteSpace(query.DurationCategory))
            all = all.Where(o => o.DurationCategory == query.DurationCategory).ToList();

        // Saved IDs for current user
        var savedIds = currentUserId.HasValue
            ? await actions.GetSavedOpportunityIdsAsync(currentUserId.Value)
            : [];

        var totalItems = all.Count;
        var totalPages = (int)Math.Ceiling(totalItems / (double)query.Limit);
        var paged = all.Skip((query.Page - 1) * query.Limit).Take(query.Limit).ToList();

        var items = paged.Select(o => MapToListItem(o, savedIds.Contains(o.Id))).ToList();

        return ApiResponse<PagedResult<OpportunityListItemDto>>.Ok(new PagedResult<OpportunityListItemDto>
        {
            Items = items,
            Pagination = new PaginationMeta
            {
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = query.Page,
                Limit = query.Limit
            }
        });
    }

    public async Task<ApiResponse<OpportunityDetailDto>> GetOpportunityByIdAsync(Guid id, Guid? currentUserId)
    {
        var opp = await actions.GetByIdAsync(id);
        if (opp is null)
            return ApiResponse<OpportunityDetailDto>.Fail("Opportunity not found.");

        bool isSaved = currentUserId.HasValue && await actions.IsSavedByUserAsync(id, currentUserId.Value);

        return ApiResponse<OpportunityDetailDto>.Ok(MapToDetail(opp, isSaved, hasApplied: false));
    }

    public async Task<ApiResponse<bool>> SaveOpportunityAsync(Guid opportunityId, Guid studentId)
    {
        await actions.SaveForUserAsync(opportunityId, studentId);
        return ApiResponse<bool>.Ok(true);
    }

    public async Task<ApiResponse<bool>> UnsaveOpportunityAsync(Guid opportunityId, Guid studentId)
    {
        await actions.UnsaveForUserAsync(opportunityId, studentId);
        return ApiResponse<bool>.Ok(true);
    }

    // ─── Mentor ──────────────────────────────────────────────────────────────

    public async Task<ApiResponse<List<OpportunityListItemDto>>> GetMentorOpportunitiesAsync(Guid mentorId)
    {
        var opps = await actions.GetByMentorIdAsync(mentorId);
        var items = opps.Select(o => MapToListItem(o, isSaved: false)).ToList();
        return ApiResponse<List<OpportunityListItemDto>>.Ok(items);
    }

    public async Task<ApiResponse<OpportunityDetailDto>> CreateOpportunityAsync(CreateOpportunityDto dto, Guid mentorId)
    {
        var opp = new Domain.Entities.Opportunity
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            Location = dto.Location,
            LocationType = dto.LocationType,
            Type = dto.Type,
            Field = dto.Field,
            DurationCategory = dto.DurationCategory,
            Company = dto.Company,
            CompanyLogo = dto.CompanyLogo,
            LogoBg = dto.LogoBg,
            LogoType = dto.LogoType,
            AboutCompany = dto.AboutCompany,
            AboutInternship = dto.AboutInternship,
            Responsibilities = dto.Responsibilities,
            Requirements = dto.Requirements,
            Technologies = dto.Technologies,
            Tags = [dto.Field, .. dto.Technologies.Take(2)],
            Deadline = dto.Deadline,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Status = OpportunityStatus.Draft,
            MentorId = mentorId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await actions.CreateAsync(opp);
        return ApiResponse<OpportunityDetailDto>.Ok(MapToDetail(created, isSaved: false, hasApplied: false));
    }

    public async Task<ApiResponse<OpportunityDetailDto>> UpdateOpportunityAsync(Guid id, CreateOpportunityDto dto, Guid mentorId)
    {
        var opp = await actions.GetByIdAsync(id);
        if (opp is null) return ApiResponse<OpportunityDetailDto>.Fail("Opportunity not found.");
        if (opp.MentorId != mentorId) return ApiResponse<OpportunityDetailDto>.Fail("Forbidden. You do not own this opportunity.");

        opp.Title = dto.Title;
        opp.Description = dto.Description;
        opp.Location = dto.Location;
        opp.LocationType = dto.LocationType;
        opp.Type = dto.Type;
        opp.Field = dto.Field;
        opp.DurationCategory = dto.DurationCategory;
        opp.Company = dto.Company;
        opp.CompanyLogo = dto.CompanyLogo;
        opp.LogoBg = dto.LogoBg;
        opp.LogoType = dto.LogoType;
        opp.AboutCompany = dto.AboutCompany;
        opp.AboutInternship = dto.AboutInternship;
        opp.Responsibilities = dto.Responsibilities;
        opp.Requirements = dto.Requirements;
        opp.Technologies = dto.Technologies;
        opp.Tags = [dto.Field, .. dto.Technologies.Take(2)];
        opp.Deadline = dto.Deadline;
        opp.StartDate = dto.StartDate;
        opp.EndDate = dto.EndDate;

        var updated = await actions.UpdateAsync(opp);
        return ApiResponse<OpportunityDetailDto>.Ok(MapToDetail(updated, isSaved: false, hasApplied: false));
    }

    public async Task<ApiResponse<bool>> PatchOpportunityStatusAsync(Guid id, OpportunityStatus newStatus, Guid mentorId)
    {
        var opp = await actions.GetByIdAsync(id);
        if (opp is null) return ApiResponse<bool>.Fail("Opportunity not found.");
        if (opp.MentorId != mentorId) return ApiResponse<bool>.Fail("Forbidden. You do not own this opportunity.");

        opp.Status = newStatus;
        await actions.UpdateAsync(opp);
        return ApiResponse<bool>.Ok(true);
    }

    // ─── Mapping helpers ─────────────────────────────────────────────────────

    private static OpportunityListItemDto MapToListItem(Domain.Entities.Opportunity o, bool isSaved) => new()
    {
        Id = o.Id,
        Title = o.Title,
        Company = o.Company,
        CompanyLogo = o.CompanyLogo,
        LogoBg = o.LogoBg,
        LogoType = o.LogoType,
        Location = o.Location,
        LocationType = o.LocationType.ToString(),
        Type = o.Type.ToString(),
        DurationCategory = o.DurationCategory,
        Field = o.Field,
        Tags = o.Tags,
        Deadline = o.Deadline,
        CreatedAt = o.CreatedAt,
        IsSaved = isSaved,
        Status = o.Status.ToString(),
        ApplicationsCount = o.Applications?.Count ?? 0
    };

    private static OpportunityDetailDto MapToDetail(Domain.Entities.Opportunity o, bool isSaved, bool hasApplied) => new()
    {
        Id = o.Id,
        Title = o.Title,
        Company = o.Company,
        CompanyLogo = o.CompanyLogo,
        LogoBg = o.LogoBg,
        LogoType = o.LogoType,
        Location = o.Location,
        LocationType = o.LocationType.ToString(),
        Type = o.Type.ToString(),
        DurationCategory = o.DurationCategory,
        Field = o.Field,
        Tags = o.Tags,
        AboutCompany = o.AboutCompany,
        AboutInternship = o.AboutInternship,
        Responsibilities = o.Responsibilities,
        Requirements = o.Requirements,
        Technologies = o.Technologies,
        Deadline = o.Deadline,
        StartDate = o.StartDate,
        EndDate = o.EndDate,
        CreatedAt = o.CreatedAt,
        IsSaved = isSaved,
        HasApplied = hasApplied,
        Status = o.Status.ToString(),
        ApplicationsCount = o.Applications?.Count ?? 0
    };
}
