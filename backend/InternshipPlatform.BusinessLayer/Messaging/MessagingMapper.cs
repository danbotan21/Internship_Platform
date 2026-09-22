using InternshipPlatform.Domain;

namespace InternshipPlatform.BusinessLayer.Messaging;

/// <summary>
/// Translates domain entities into the payload the Messages page consumes.
/// The two sides use different words for the same roles, so the mapping is
/// explicit and lives in one place.
/// </summary>
public static class MessagingMapper
{
    /// <summary>A user counts as online when they last loaded their inbox recently.</summary>
    public static readonly TimeSpan OnlineWindow = TimeSpan.FromMinutes(5);

    /// <summary>Avatar background colours, picked deterministically from the user id.</summary>
    private static readonly string[] Palette =
    [
        "#1e3a2c", "#2f6f4e", "#b4532a", "#3b5b8c", "#7a4b8f",
        "#a3782c", "#2b6b74", "#8c3b52",
    ];

    public static string Iso(DateTime value) =>
        DateTime.SpecifyKind(value, value.Kind == DateTimeKind.Unspecified ? DateTimeKind.Utc : value.Kind)
            .ToUniversalTime()
            .ToString("yyyy-MM-ddTHH:mm:ss.fffZ");

    public static string RoleToApi(UserRole role) => role switch
    {
        UserRole.Student => "intern",
        UserRole.Mentor => "mentor",
        UserRole.Company => "coordinator",
        UserRole.Admin => "admin",
        _ => "intern",
    };

    public static UserRole? RoleFromApi(string? role) => role?.ToLowerInvariant() switch
    {
        "intern" => UserRole.Student,
        "mentor" => UserRole.Mentor,
        "coordinator" => UserRole.Company,
        "admin" => UserRole.Admin,
        _ => null,
    };

    public static string Initials(string fullName)
    {
        var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        return parts.Length switch
        {
            0 => "?",
            1 => parts[0][..Math.Min(2, parts[0].Length)].ToUpperInvariant(),
            _ => $"{parts[0][0]}{parts[^1][0]}".ToUpperInvariant(),
        };
    }

    public static string Color(Guid id) => Palette[(int)((uint)id.GetHashCode() % Palette.Length)];

    /// <summary>
    /// Contact details are shared between an intern and their mentor, and
    /// coordinators/admins can see and be seen by everyone. Mirrors
    /// canViewContact() in the frontend store so the API never ships details
    /// the UI would refuse to render.
    /// </summary>
    public static bool CanViewContact(User viewer, User target)
    {
        if (viewer.Id == target.Id) return true;
        if (IsStaff(viewer.Role) || IsStaff(target.Role)) return true;
        if (viewer.Role == UserRole.Student) return viewer.MentorId == target.Id;
        if (viewer.Role == UserRole.Mentor) return target.MentorId == viewer.Id;
        return false;
    }

    public static bool IsStaff(UserRole role) => role is UserRole.Company or UserRole.Admin;

    public static UserDto ToDto(User user, User viewer, DateTime now)
    {
        var lastSeen = user.LastSeenAt ?? user.CreatedAt.UtcDateTime;
        var contact = CanViewContact(viewer, user) ? user.Contact : new ContactInfo();

        return new UserDto(
            Id: user.Id.ToString(),
            Name: user.FullName,
            Initials: Initials(user.FullName),
            Role: RoleToApi(user.Role),
            Organization: user.Organization,
            Color: Color(user.Id),
            Online: user.LastSeenAt is not null && now - user.LastSeenAt.Value <= OnlineWindow,
            LastSeenAt: Iso(lastSeen),
            Contact: new ContactInfoDto(
                contact.Email,
                contact.Phone,
                contact.Location,
                contact.Availability,
                contact.PreferredChannel.ToString()),
            MentorId: user.MentorId?.ToString());
    }

    public static ConversationDto ToDto(Conversation conversation)
    {
        var isChannel = conversation.Type == ConversationType.Channel;

        return new ConversationDto(
            Id: conversation.Id.ToString(),
            Type: isChannel ? "channel" : "direct",
            MemberIds: conversation.Members.Select(m => m.UserId.ToString()).ToList(),
            CreatedAt: Iso(conversation.CreatedAt),
            Name: conversation.Name,
            Description: conversation.Description,
            Kind: conversation.Kind?.ToString().ToLowerInvariant(),
            Visibility: conversation.Visibility?.ToString().ToLowerInvariant(),
            OwnerId: conversation.OwnerId?.ToString(),
            Archived: isChannel ? conversation.Archived : null);
    }

    public static MessageDto ToDto(Message message) => new(
        Id: message.Id.ToString(),
        ConversationId: message.ConversationId.ToString(),
        AuthorId: message.AuthorId.ToString(),
        Body: message.Body,
        CreatedAt: Iso(message.CreatedAt),
        ParentId: message.ParentId?.ToString(),
        Attachment: message.AttachmentName is null
            ? null
            : new AttachmentDto(message.AttachmentName, message.AttachmentSize ?? 0),
        DeliveredTo: message.Deliveries.Select(d => d.UserId.ToString()).ToList(),
        ReadBy: message.Reads.Select(r => r.UserId.ToString()).ToList());

    public static NotificationDto ToDto(Notification notification) => new(
        Id: notification.Id.ToString(),
        Category: notification.Category.ToString().ToLowerInvariant(),
        Title: notification.Title,
        Body: notification.Body,
        CreatedAt: Iso(notification.CreatedAt),
        Source: notification.Source.ToString().ToLowerInvariant(),
        SenderId: notification.SenderId?.ToString(),
        RecipientIds: notification.Recipients.Select(r => r.UserId.ToString()).ToList(),
        ReadBy: notification.Recipients.Where(r => r.ReadAt is not null).Select(r => r.UserId.ToString()).ToList(),
        DueAt: notification.DueAt is null ? null : Iso(notification.DueAt.Value),
        ConversationId: notification.ConversationId?.ToString());
}
