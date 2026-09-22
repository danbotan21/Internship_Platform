using InternshipPlatform.BusinessLayer.Common;
using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain;
using InternshipPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Admin.Users;

public class UserDirectoryService(AppDbContext context) : IUserDirectoryService
{
    private const int MaxPageSize = 100;

    public async Task<UserDirectoryResultDto> GetDirectoryAsync(
        UserDirectoryQuery query,
        CancellationToken cancellationToken = default)
    {
        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, MaxPageSize);

        var filtered = ApplyFilters(context.Users.AsNoTracking(), query);

        var counts = new UserDirectoryCountsDto(
            All: await filtered.CountAsync(cancellationToken),
            CompanyMembers: await filtered.CountAsync(u => u.Membership != null, cancellationToken),
            Admins: await filtered.CountAsync(u => u.Role == UserRole.Admin, cancellationToken));

        var scoped = ApplyScope(filtered, query.Scope);
        var totalCount = await scoped.CountAsync(cancellationToken);

        var sorted = query.Sort == UserDirectorySort.NameDesc
            ? scoped.OrderByDescending(u => u.FullName).ThenBy(u => u.Id)
            : scoped.OrderBy(u => u.FullName).ThenBy(u => u.Id);

        var rows = await sorted
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                u.Status,
                u.Role,
                u.University,
                u.AcademicGroup,
                u.LastLoginAt,
                CompanyRole = u.Membership != null ? (CompanyRole?)u.Membership.Role : null,
                CompanyName = u.Membership != null ? u.Membership.Company.LegalName : null,
            })
            .ToListAsync(cancellationToken);

        var items = rows
            .Select(r => new UserListItemDto(
                r.Id,
                r.FullName,
                r.Email,
                r.Status,
                r.Role,
                r.CompanyRole,
                r.CompanyName ?? ComposeOrganisation(r.University, r.AcademicGroup),
                r.LastLoginAt))
            .ToList();

        return new UserDirectoryResultDto(
            new PagedResult<UserListItemDto>(items, page, pageSize, totalCount),
            counts);
    }

    public async Task<UserDetailDto?> GetUserAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var row = await context.Users
            .AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                u.Status,
                u.Role,
                u.University,
                u.Programme,
                u.AcademicGroup,
                u.EmailVerified,
                u.CreatedAt,
                u.LastLoginAt,
                u.DeactivatedAt,
                CompanyId = u.Membership != null ? (Guid?)u.Membership.CompanyId : null,
                CompanyName = u.Membership != null ? u.Membership.Company.LegalName : null,
                CompanyRole = u.Membership != null ? (CompanyRole?)u.Membership.Role : null,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (row is null)
        {
            return null;
        }

        var placement = row.CompanyId is Guid companyId && row.CompanyRole is CompanyRole companyRole
            ? new CompanyPlacementDto(companyId, row.CompanyName!, companyRole)
            : null;

        return new UserDetailDto(
            row.Id,
            row.FullName,
            row.Email,
            row.Status,
            row.Role,
            row.University,
            row.Programme,
            row.AcademicGroup,
            row.EmailVerified,
            row.CreatedAt,
            row.LastLoginAt,
            row.DeactivatedAt,
            placement);
    }

    private static IQueryable<User> ApplyFilters(IQueryable<User> users, UserDirectoryQuery query)
    {
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var pattern = $"%{query.Search.Trim()}%";
            users = users.Where(u =>
                EF.Functions.ILike(u.FullName, pattern) ||
                EF.Functions.ILike(u.Email, pattern));
        }

        if (query.Status is UserStatus status)
        {
            users = users.Where(u => u.Status == status);
        }

        if (query.CompanyId is Guid companyId)
        {
            users = users.Where(u => u.Membership != null && u.Membership.CompanyId == companyId);
        }

        if (query.PlatformRole is UserRole platformRole)
        {
            users = users.Where(u => u.Role == platformRole);
        }

        if (query.CompanyRole is CompanyRole companyRole)
        {
            users = users.Where(u => u.Membership != null && u.Membership.Role == companyRole);
        }

        return users;
    }

    private static IQueryable<User> ApplyScope(IQueryable<User> users, UserDirectoryScope scope) =>
        scope switch
        {
            UserDirectoryScope.CompanyMembers => users.Where(u => u.Membership != null),
            UserDirectoryScope.Admins => users.Where(u => u.Role == UserRole.Admin),
            _ => users,
        };

    private static string? ComposeOrganisation(string? university, string? academicGroup) =>
        university is null
            ? null
            : academicGroup is null ? university : $"{university} · {academicGroup}";
}