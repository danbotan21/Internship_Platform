using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Resources;

namespace InternshipPlatform.BusinessLayer.Resources;

public sealed class ResourceService(IResourceRepository repository)
{
    public Task<IReadOnlyList<Resource>> GetAsync(ResourceQuery query, CancellationToken cancellationToken) =>
        repository.GetAsync(query, cancellationToken);

    public Task<Resource?> GetBySlugAsync(string slug, Guid userId, CancellationToken cancellationToken) =>
        repository.GetBySlugAsync(slug, userId, cancellationToken);

    public async Task<Resource> CreateAsync(
        CreateResourceCommand command,
        Guid userId,
        string role,
        CancellationToken cancellationToken)
    {
        if (!IsContentManager(role))
            throw new UnauthorizedAccessException("Only mentors and administrators can create resources.");

        var creatorName = await repository.GetUserNameAsync(userId, cancellationToken)
            ?? throw new UnauthorizedAccessException("The current user was not found.");

        if (string.IsNullOrWhiteSpace(command.Title))
            throw new ArgumentException("Title is required.", nameof(command));

        var title = command.Title.Trim();
        var baseSlug = string.Join('-', title.ToLowerInvariant()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries));
        if (string.IsNullOrWhiteSpace(baseSlug))
            baseSlug = "resource";

        var slug = baseSlug;
        var suffix = 2;
        while (await repository.SlugExistsAsync(slug, cancellationToken))
            slug = $"{baseSlug}-{suffix++}";

        var resource = new Resource
        {
            Id = Guid.NewGuid(),
            CreatedByUserId = userId,
            TargetGroup = command.TargetGroup?.Trim(),
            Slug = slug,
            Title = title,
            Description = command.Description?.Trim() ?? string.Empty,
            ContentHtml = command.ContentHtml ?? string.Empty,
            Type = command.Type?.Trim() ?? "Guide",
            Format = command.Format?.Trim() ?? "Article",
            Category = command.Category?.Trim() ?? "Guides and learning",
            Owner = command.Owner?.Trim() ?? "Programme team",
            MentorName = creatorName,
            Tags = command.Tags ?? Array.Empty<string>(),
            IsDraft = command.IsDraft
        };

        await repository.AddAsync(resource, cancellationToken);
        if (!resource.IsDraft && !string.IsNullOrWhiteSpace(resource.TargetGroup))
            await AddGroupNotificationAsync(resource, userId, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return resource;
    }

    private static bool IsContentManager(string role) =>
        string.Equals(role, "Mentor", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(role, "Administrator", StringComparison.OrdinalIgnoreCase);

    private static bool IsAdministrator(string role) =>
        string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(role, "Administrator", StringComparison.OrdinalIgnoreCase);

    public async Task<Resource?> UpdateAsync(
        Guid id,
        UpdateResourceCommand command,
        Guid userId,
        string role,
        CancellationToken cancellationToken)
    {
        if (!IsContentManager(role))
            throw new UnauthorizedAccessException("Only mentors and administrators can manage resources.");

        var resource = IsAdministrator(role)
            ? await repository.GetByIdAsync(id, cancellationToken)
            : await repository.GetOwnedAsync(id, userId, cancellationToken);
        if (resource is null) return null;

        resource.Title = command.Title.Trim();
        resource.Description = command.Description?.Trim() ?? string.Empty;
        resource.ContentHtml = command.ContentHtml ?? string.Empty;
        resource.Type = command.Type?.Trim() ?? resource.Type;
        resource.Format = command.Format?.Trim() ?? resource.Format;
        resource.Category = command.Category?.Trim() ?? resource.Category;
        resource.Owner = command.Owner?.Trim() ?? resource.Owner;
        resource.MentorName = command.MentorName?.Trim() ?? resource.MentorName;
        resource.Tags = command.Tags ?? resource.Tags;
        var wasDraft = resource.IsDraft;
        resource.IsDraft = command.IsDraft;
        resource.TargetGroup = command.TargetGroup?.Trim() ?? resource.TargetGroup;
        resource.UpdatedAt = DateTime.UtcNow;

        if (wasDraft && !resource.IsDraft && !string.IsNullOrWhiteSpace(resource.TargetGroup))
            await AddGroupNotificationAsync(resource, userId, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return resource;
    }

    public Task<IReadOnlyList<Notification>> GetNotificationsAsync(Guid userId, CancellationToken cancellationToken) =>
        repository.GetNotificationsAsync(userId, cancellationToken);

    public async Task<bool> MarkNotificationAsReadAsync(Guid id, Guid userId, CancellationToken cancellationToken)
    {
        var notification = await repository.GetNotificationAsync(id, userId, cancellationToken);
        if (notification is null) return false;

        notification.IsRead = true;
        await repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    private Task AddGroupNotificationAsync(Resource resource, Guid userId, CancellationToken cancellationToken) =>
        repository.AddNotificationAsync(new Notification
        {
            Id = Guid.NewGuid(),
            RecipientUserId = userId,
            ResourceId = resource.Id,
            Title = "New resource in your group",
            Message = $"A new article was published for group \"{resource.TargetGroup}\"."
        }, cancellationToken);

    public async Task<bool> DeleteAsync(
        Guid id,
        Guid userId,
        string role,
        CancellationToken cancellationToken)
    {
        if (!IsContentManager(role))
            throw new UnauthorizedAccessException("Only mentors and administrators can delete resources.");

        var resource = await repository.GetByIdAsync(id, cancellationToken);
        if (resource is null) return false;

        repository.Remove(resource);
        await repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> AddFavoriteAsync(Guid id, Guid userId, CancellationToken cancellationToken)
    {
        var resource = await repository.GetByIdAsync(id, cancellationToken);
        if (resource is null) return false;

        if (!await repository.FavoriteExistsAsync(id, userId, cancellationToken))
        {
            await repository.AddFavoriteAsync(new ResourceFavorite { ResourceId = id, UserId = userId }, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
        }

        return true;
    }

    public async Task<bool> RemoveFavoriteAsync(Guid id, Guid userId, CancellationToken cancellationToken)
    {
        var favorite = await repository.GetFavoriteAsync(id, userId, cancellationToken);
        if (favorite is null) return false;

        repository.RemoveFavorite(favorite);
        await repository.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public sealed record CreateResourceCommand(
    string Title,
    string? Description,
    string? ContentHtml,
    string? Type,
    string? Format,
    string? Category,
    string? Owner,
    string? MentorName,
    string[]? Tags,
    string? TargetGroup,
    bool IsDraft);

public sealed record UpdateResourceCommand(
    string Title,
    string? Description,
    string? ContentHtml,
    string? Type,
    string? Category,
    string? Owner,
    string? MentorName,
    string? Format,
    string[]? Tags,
    string? TargetGroup,
    bool IsDraft);
