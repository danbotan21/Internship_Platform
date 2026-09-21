namespace InternshipPlatform.BusinessLayer.Messaging;

// The shapes below mirror frontend/src/types/messaging.ts one-to-one. Enum-like
// values travel as the exact strings the UI expects ("intern", "channel",
// "public", ...) rather than as .NET enums, so the two vocabularies can differ
// without a converter having to bridge them implicitly.

public record ContactInfoDto(
    string Email,
    string Phone,
    string Location,
    string Availability,
    string PreferredChannel);

public record UserDto(
    string Id,
    string Name,
    string Initials,
    string Role,
    string Organization,
    string Color,
    bool Online,
    string LastSeenAt,
    ContactInfoDto Contact,
    string? MentorId);

public record ConversationDto(
    string Id,
    string Type,
    IReadOnlyList<string> MemberIds,
    string CreatedAt,
    string? Name,
    string? Description,
    string? Kind,
    string? Visibility,
    string? OwnerId,
    bool? Archived);

public record AttachmentDto(string Name, long Size);

public record MessageDto(
    string Id,
    string ConversationId,
    string AuthorId,
    string Body,
    string CreatedAt,
    string? ParentId,
    AttachmentDto? Attachment,
    IReadOnlyList<string> DeliveredTo,
    IReadOnlyList<string> ReadBy);

public record NotificationDto(
    string Id,
    string Category,
    string Title,
    string Body,
    string CreatedAt,
    string Source,
    string? SenderId,
    IReadOnlyList<string> RecipientIds,
    IReadOnlyList<string> ReadBy,
    string? DueAt,
    string? ConversationId);

/// <summary>Everything the Messages page needs for the signed-in user.</summary>
public record MessagingDataDto(
    string CurrentUserId,
    IReadOnlyList<UserDto> Users,
    IReadOnlyList<ConversationDto> Conversations,
    IReadOnlyList<MessageDto> Messages,
    IReadOnlyList<NotificationDto> Notifications);

// ---------- Requests ----------

public record StartDirectRequest(Guid UserId);

public record SendMessageRequest(string Body, Guid? ParentId, AttachmentDto? Attachment);

public record CreateChannelRequest(
    string Name,
    string? Description,
    string Kind,
    string Visibility,
    IReadOnlyList<Guid>? MemberIds);

/// <summary>A patch: every property left null keeps its current value.</summary>
public record UpdateChannelRequest(
    string? Name,
    string? Description,
    string? Kind,
    string? Visibility,
    bool? Archived,
    IReadOnlyList<Guid>? MemberIds);

public record AnnouncementRequest(
    string Category,
    string Title,
    string Body,
    string Audience,
    string? DueAt);

public record MarkNotificationsReadRequest(IReadOnlyList<Guid> Ids);
