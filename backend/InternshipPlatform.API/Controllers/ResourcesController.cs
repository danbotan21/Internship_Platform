using InternshipPlatform.BusinessLayer.Resources;
using InternshipPlatform.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

[ApiController]
[Route("api/resources")]
public class ResourcesController(ResourceService resourceService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ResourceResponse>>> GetResources(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] bool? favorites,
        [FromQuery] bool? mine,
        [FromQuery] bool? drafts,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var resources = await resourceService.GetAsync(
            new ResourceQuery(search, category, favorites, mine, drafts, userId),
            cancellationToken);

        return Ok(resources.Select(resource => ToResponse(resource, userId)).ToList());
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<ResourceResponse>> GetResource(string slug, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var resource = await resourceService.GetBySlugAsync(slug, userId, cancellationToken);
        return resource is null ? NotFound() : Ok(ToResponse(resource, userId));
    }

    [HttpPost]
    public async Task<ActionResult<ResourceResponse>> CreateResource(CreateResourceRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var resource = await resourceService.CreateAsync(
                new CreateResourceCommand(request.Title, request.Description, request.ContentHtml, request.Type,
                    request.Format, request.Category, request.Owner, request.MentorName, request.Tags,
                    request.TargetGroup, request.IsDraft),
                GetUserId(), GetUserRole(), cancellationToken);

            return CreatedAtAction(nameof(GetResource), new { slug = resource.Slug }, ToResponse(resource, GetUserId()));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(StatusCodes.Status403Forbidden, exception.Message);
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ResourceResponse>> UpdateResource(
        Guid id, UpdateResourceRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var resource = await resourceService.UpdateAsync(
                id,
                new UpdateResourceCommand(request.Title, request.Description, request.ContentHtml, request.Type,
                    request.Category, request.Owner, request.MentorName, request.Format, request.Tags,
                    request.TargetGroup, request.IsDraft),
                GetUserId(), GetUserRole(), cancellationToken);

            return resource is null ? NotFound() : Ok(ToResponse(resource, GetUserId()));
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(StatusCodes.Status403Forbidden, exception.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteResource(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            return await resourceService.DeleteAsync(id, GetUserId(), GetUserRole(), cancellationToken)
                ? NoContent()
                : NotFound();
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(StatusCodes.Status403Forbidden, exception.Message);
        }
    }

    [HttpPost("{id:guid}/favorite")]
    public async Task<IActionResult> AddFavorite(Guid id, CancellationToken cancellationToken) =>
        await resourceService.AddFavoriteAsync(id, GetUserId(), cancellationToken) ? NoContent() : NotFound();

    [HttpDelete("{id:guid}/favorite")]
    public async Task<IActionResult> RemoveFavorite(Guid id, CancellationToken cancellationToken) =>
        await resourceService.RemoveFavoriteAsync(id, GetUserId(), cancellationToken) ? NoContent() : NotFound();

    [HttpGet("/api/notifications")]
    public async Task<ActionResult<IReadOnlyList<NotificationResponse>>> GetNotifications(CancellationToken cancellationToken)
    {
        var notifications = await resourceService.GetNotificationsAsync(GetUserId(), cancellationToken);
        return Ok(notifications.Select(notification => new NotificationResponse(
            notification.Id, notification.Title, notification.Message, notification.IsRead, notification.CreatedAt)));
    }

    [HttpPost("/api/notifications/{id:guid}/read")]
    public async Task<IActionResult> MarkNotificationAsRead(Guid id, CancellationToken cancellationToken) =>
        await resourceService.MarkNotificationAsReadAsync(id, GetUserId(), cancellationToken) ? NoContent() : NotFound();

    private Guid GetUserId() =>
        Guid.TryParse(Request.Headers["X-User-Id"].FirstOrDefault(), out var userId) ? userId : Guid.Empty;

    private string GetUserRole() => Request.Headers["X-User-Role"].FirstOrDefault() ?? string.Empty;

    private static ResourceResponse ToResponse(Resource resource, Guid userId) =>
        new(resource.Id, resource.CreatedByUserId, resource.Slug, resource.Type, resource.Format,
            resource.Title, resource.Description, resource.Owner, resource.ContentHtml, resource.Category,
            resource.MentorName, resource.Tags, resource.IsDraft, resource.UpdatedAt,
            resource.Favorites.Any(favorite => favorite.UserId == userId));
}

public record CreateResourceRequest(
    string Title, string? Description, string? ContentHtml, string? Type, string? Format,
    string? Category, string? Owner, string? MentorName, string[]? Tags, string? TargetGroup, bool IsDraft = true);

public record UpdateResourceRequest(
    string Title, string? Description, string? ContentHtml, string? Type, string? Category,
    string? Owner, string? MentorName, string? Format, string[]? Tags, string? TargetGroup, bool IsDraft);

public record ResourceResponse(
    Guid Id, Guid CreatedByUserId, string Slug, string Type, string Format, string Title,
    string Description, string Owner, string ContentHtml, string Category, string MentorName,
    string[] Tags, bool IsDraft, DateTime UpdatedAt, bool IsFavorite);

public record NotificationResponse(Guid Id, string Title, string Message, bool IsRead, DateTime CreatedAt);
