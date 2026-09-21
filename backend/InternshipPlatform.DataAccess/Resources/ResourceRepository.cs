using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Resources;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.DataAccess.Resources;

public sealed class ResourceRepository(AppDbContext dbContext) : IResourceRepository
{
    public async Task<IReadOnlyList<Resource>> GetAsync(ResourceQuery query, CancellationToken cancellationToken)
    {
        var resources = dbContext.Resources
            .AsNoTracking()
            .Include(resource => resource.Favorites)
            .AsQueryable();

        if (query.Drafts is true) resources = resources.Where(resource => resource.IsDraft);
        if (query.Drafts is false) resources = resources.Where(resource => !resource.IsDraft);
        if (!string.IsNullOrWhiteSpace(query.Search))
            resources = resources.Where(resource => resource.Title.Contains(query.Search) || resource.Description.Contains(query.Search));
        if (!string.IsNullOrWhiteSpace(query.Category))
            resources = resources.Where(resource => resource.Category == query.Category);
        if (query.Favorites is true)
            resources = resources.Where(resource => resource.Favorites.Any(favorite => favorite.UserId == query.UserId));
        if (query.Mine is true)
            resources = resources.Where(resource => resource.CreatedByUserId == query.UserId);

        var result = await resources
            .OrderByDescending(resource => resource.UpdatedAt)
            .ToListAsync(cancellationToken);

        await ApplyCreatorNamesAsync(result, cancellationToken);
        return result;
    }

    public async Task<Resource?> GetBySlugAsync(string slug, Guid userId, CancellationToken cancellationToken)
    {
        var resource = await dbContext.Resources
            .AsNoTracking()
            .Include(resource => resource.Favorites)
            .SingleOrDefaultAsync(resource => resource.Slug == slug &&
                (!resource.IsDraft || resource.CreatedByUserId == userId), cancellationToken);

        if (resource is not null)
            await ApplyCreatorNamesAsync([resource], cancellationToken);

        return resource;
    }

    public Task<Resource?> GetOwnedAsync(Guid id, Guid userId, CancellationToken cancellationToken) =>
        dbContext.Resources.SingleOrDefaultAsync(resource => resource.Id == id && resource.CreatedByUserId == userId, cancellationToken);

    public Task<Resource?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        dbContext.Resources.SingleOrDefaultAsync(resource => resource.Id == id, cancellationToken);

    public Task<string?> GetUserNameAsync(Guid userId, CancellationToken cancellationToken) =>
        dbContext.Users
            .Where(user => user.Id == userId)
            .Select(user => user.FullName)
            .SingleOrDefaultAsync(cancellationToken);

    public Task<bool> SlugExistsAsync(string slug, CancellationToken cancellationToken) =>
        dbContext.Resources.AnyAsync(resource => resource.Slug == slug, cancellationToken);

    private async Task ApplyCreatorNamesAsync(
        IReadOnlyCollection<Resource> resources,
        CancellationToken cancellationToken)
    {
        var creatorIds = resources.Select(resource => resource.CreatedByUserId).Distinct().ToArray();
        var creatorNames = await dbContext.Users
            .Where(user => creatorIds.Contains(user.Id))
            .ToDictionaryAsync(user => user.Id, user => user.FullName, cancellationToken);

        foreach (var resource in resources)
        {
            if (creatorNames.TryGetValue(resource.CreatedByUserId, out var creatorName))
                resource.MentorName = creatorName;
        }
    }

    public Task AddAsync(Resource resource, CancellationToken cancellationToken)
    {
        dbContext.Resources.Add(resource);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) => dbContext.SaveChangesAsync(cancellationToken);

    public void Remove(Resource resource) => dbContext.Resources.Remove(resource);

    public Task<bool> FavoriteExistsAsync(Guid resourceId, Guid userId, CancellationToken cancellationToken) =>
        dbContext.ResourceFavorites.AnyAsync(favorite => favorite.ResourceId == resourceId && favorite.UserId == userId, cancellationToken);

    public Task AddFavoriteAsync(ResourceFavorite favorite, CancellationToken cancellationToken)
    {
        dbContext.ResourceFavorites.Add(favorite);
        return Task.CompletedTask;
    }

    public Task<ResourceFavorite?> GetFavoriteAsync(Guid resourceId, Guid userId, CancellationToken cancellationToken) =>
        dbContext.ResourceFavorites.FindAsync([resourceId, userId], cancellationToken).AsTask();

    public void RemoveFavorite(ResourceFavorite favorite) => dbContext.ResourceFavorites.Remove(favorite);

    public Task AddNotificationAsync(Notification notification, CancellationToken cancellationToken)
    {
        dbContext.Notifications.Add(notification);
        return Task.CompletedTask;
    }

    public async Task<IReadOnlyList<Notification>> GetNotificationsAsync(Guid userId, CancellationToken cancellationToken) =>
        await dbContext.Notifications.AsNoTracking()
            .Where(notification => notification.RecipientUserId == userId)
            .OrderByDescending(notification => notification.CreatedAt)
            .ToListAsync(cancellationToken);

    public Task<Notification?> GetNotificationAsync(Guid id, Guid userId, CancellationToken cancellationToken) =>
        dbContext.Notifications.SingleOrDefaultAsync(
            notification => notification.Id == id && notification.RecipientUserId == userId,
            cancellationToken);
}
