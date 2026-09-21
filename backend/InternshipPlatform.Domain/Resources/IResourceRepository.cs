using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.Domain.Resources;

public interface IResourceRepository
{
    Task<IReadOnlyList<Resource>> GetAsync(ResourceQuery query, CancellationToken cancellationToken);
    Task<Resource?> GetBySlugAsync(string slug, Guid userId, CancellationToken cancellationToken);
    Task<Resource?> GetOwnedAsync(Guid id, Guid userId, CancellationToken cancellationToken);
    Task<Resource?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<string?> GetUserNameAsync(Guid userId, CancellationToken cancellationToken);
    Task<bool> SlugExistsAsync(string slug, CancellationToken cancellationToken);
    Task AddAsync(Resource resource, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
    void Remove(Resource resource);
    Task<bool> FavoriteExistsAsync(Guid resourceId, Guid userId, CancellationToken cancellationToken);
    Task AddFavoriteAsync(ResourceFavorite favorite, CancellationToken cancellationToken);
    Task<ResourceFavorite?> GetFavoriteAsync(Guid resourceId, Guid userId, CancellationToken cancellationToken);
    void RemoveFavorite(ResourceFavorite favorite);
    Task AddNotificationAsync(Notification notification, CancellationToken cancellationToken);
    Task<IReadOnlyList<Notification>> GetNotificationsAsync(Guid userId, CancellationToken cancellationToken);
    Task<Notification?> GetNotificationAsync(Guid id, Guid userId, CancellationToken cancellationToken);
}

public sealed record ResourceQuery(
    string? Search,
    string? Category,
    bool? Favorites,
    bool? Mine,
    bool? Drafts,
    Guid UserId);