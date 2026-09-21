using System.Globalization;
using InternshipPlatform.DataAccess.Context;
using InternshipPlatform.Domain;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Messaging;

public class MessagingService(AppDbContext db) : IMessagingService
{
    public async Task<MessagingDataDto> GetDataAsync(Guid userId)
    {
        var now = DateTime.UtcNow;
        var me = await LoadUserAsync(userId);

        // Loading the inbox is what keeps the presence dot alive.
        me.LastSeenAt = now;

        var users = await db.Users.OrderBy(u => u.FullName).ToListAsync();

        // The user's own conversations, plus the public channels they could join
        // from "Browse channels".
        var conversations = await db.Conversations
            .Include(c => c.Members)
            .Where(c => c.Members.Any(m => m.UserId == userId)
                || (c.Type == ConversationType.Channel
                    && c.Visibility == ChannelVisibility.Public
                    && !c.Archived))
            .ToListAsync();

        var myConversationIds = conversations
            .Where(c => c.Members.Any(m => m.UserId == userId))
            .Select(c => c.Id)
            .ToHashSet();

        var messages = await db.Messages
            .Include(m => m.Deliveries)
            .Include(m => m.Reads)
            .Where(m => myConversationIds.Contains(m.ConversationId))
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();

        // Anything waiting in a conversation the user belongs to counts as
        // delivered the moment they open the app.
        foreach (var message in messages)
        {
            if (message.AuthorId == userId) continue;
            if (message.Deliveries.Any(d => d.UserId == userId)) continue;
            message.Deliveries.Add(new MessageDelivery { MessageId = message.Id, UserId = userId, DeliveredAt = now });
        }

        var notifications = await db.Notifications
            .Include(n => n.Recipients)
            .Where(n => n.SenderId == userId || n.Recipients.Any(r => r.UserId == userId))
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        await db.SaveChangesAsync();

        return new MessagingDataDto(
            CurrentUserId: userId.ToString(),
            Users: users.Select(u => MessagingMapper.ToDto(u, me, now)).ToList(),
            Conversations: conversations.Select(MessagingMapper.ToDto).ToList(),
            Messages: messages.Select(MessagingMapper.ToDto).ToList(),
            Notifications: notifications.Select(MessagingMapper.ToDto).ToList());
    }

    // ---------- Conversations ----------

    public async Task<ConversationDto> StartDirectAsync(Guid userId, Guid otherUserId)
    {
        if (userId == otherUserId)
        {
            throw new MessagingValidationException("You cannot start a conversation with yourself.");
        }

        if (!await db.Users.AnyAsync(u => u.Id == otherUserId))
        {
            throw new MessagingNotFoundException("That user no longer exists.");
        }

        var existing = await db.Conversations
            .Include(c => c.Members)
            .FirstOrDefaultAsync(c => c.Type == ConversationType.Direct
                && c.Members.Any(m => m.UserId == userId)
                && c.Members.Any(m => m.UserId == otherUserId));

        if (existing is not null) return MessagingMapper.ToDto(existing);

        var now = DateTime.UtcNow;
        var conversation = new Conversation
        {
            Id = Guid.NewGuid(),
            Type = ConversationType.Direct,
            CreatedAt = now,
            Members =
            [
                new ConversationMember { UserId = userId, JoinedAt = now },
                new ConversationMember { UserId = otherUserId, JoinedAt = now },
            ],
        };

        db.Conversations.Add(conversation);
        await db.SaveChangesAsync();

        return MessagingMapper.ToDto(conversation);
    }

    public async Task<MessageDto> SendMessageAsync(Guid userId, Guid conversationId, SendMessageRequest request)
    {
        var conversation = await LoadConversationAsync(conversationId);
        RequireMember(conversation, userId);

        if (conversation.Archived)
        {
            throw new MessagingForbiddenException("This channel is archived.");
        }

        var body = (request.Body ?? string.Empty).Trim();
        if (body.Length == 0 && request.Attachment is null)
        {
            throw new MessagingValidationException("A message needs text or an attachment.");
        }

        if (request.ParentId is { } parentId
            && !await db.Messages.AnyAsync(m => m.Id == parentId && m.ConversationId == conversationId))
        {
            throw new MessagingValidationException("The message being replied to is not in this conversation.");
        }

        var message = new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            AuthorId = userId,
            Body = body,
            CreatedAt = DateTime.UtcNow,
            ParentId = request.ParentId,
            AttachmentName = request.Attachment?.Name,
            AttachmentSize = request.Attachment?.Size,
        };

        db.Messages.Add(message);
        await db.SaveChangesAsync();

        return MessagingMapper.ToDto(message);
    }

    public async Task MarkConversationReadAsync(Guid userId, Guid conversationId)
    {
        var conversation = await LoadConversationAsync(conversationId);
        RequireMember(conversation, userId);

        var now = DateTime.UtcNow;

        var unread = await db.Messages
            .Include(m => m.Deliveries)
            .Include(m => m.Reads)
            .Where(m => m.ConversationId == conversationId
                && m.AuthorId != userId
                && !m.Reads.Any(r => r.UserId == userId))
            .ToListAsync();

        foreach (var message in unread)
        {
            message.Reads.Add(new MessageRead { MessageId = message.Id, UserId = userId, ReadAt = now });
            if (message.Deliveries.All(d => d.UserId != userId))
            {
                message.Deliveries.Add(new MessageDelivery { MessageId = message.Id, UserId = userId, DeliveredAt = now });
            }
        }

        // Notifications that deep-link into this conversation are read along with it.
        var alerts = await db.NotificationRecipients
            .Where(r => r.UserId == userId && r.ReadAt == null && r.Notification.ConversationId == conversationId)
            .ToListAsync();

        foreach (var alert in alerts) alert.ReadAt = now;

        await db.SaveChangesAsync();
    }

    // ---------- Channels ----------

    public async Task<ConversationDto> CreateChannelAsync(Guid userId, CreateChannelRequest request)
    {
        var me = await LoadUserAsync(userId);

        if (me.Role == UserRole.Student)
        {
            throw new MessagingForbiddenException("Only mentors, coordinators and admins can create channels.");
        }

        var name = (request.Name ?? string.Empty).Trim();
        await ValidateChannelNameAsync(name, excludingChannelId: null);

        var now = DateTime.UtcNow;
        var memberIds = await ResolveMemberIdsAsync(request.MemberIds, owner: userId);

        var channel = new Conversation
        {
            Id = Guid.NewGuid(),
            Type = ConversationType.Channel,
            CreatedAt = now,
            Name = name,
            Description = (request.Description ?? string.Empty).Trim(),
            Kind = ParseKind(request.Kind),
            Visibility = ParseVisibility(request.Visibility),
            OwnerId = userId,
            Members = memberIds.Select(id => new ConversationMember { UserId = id, JoinedAt = now }).ToList(),
        };

        db.Conversations.Add(channel);
        await db.SaveChangesAsync();

        return MessagingMapper.ToDto(channel);
    }

    public async Task<ConversationDto> UpdateChannelAsync(Guid userId, Guid channelId, UpdateChannelRequest request)
    {
        var me = await LoadUserAsync(userId);
        var channel = await LoadChannelAsync(channelId);
        RequireChannelManager(me, channel);

        if (request.Name is not null)
        {
            var name = request.Name.Trim();
            await ValidateChannelNameAsync(name, excludingChannelId: channelId);
            channel.Name = name;
        }

        if (request.Description is not null) channel.Description = request.Description.Trim();
        if (request.Kind is not null) channel.Kind = ParseKind(request.Kind);
        if (request.Visibility is not null) channel.Visibility = ParseVisibility(request.Visibility);
        if (request.Archived is { } archived) channel.Archived = archived;

        if (request.MemberIds is not null)
        {
            // The owner and the editor always stay in, matching the channel form.
            var keep = await ResolveMemberIdsAsync(request.MemberIds, owner: channel.OwnerId ?? userId);
            keep.Add(userId);

            channel.Members.RemoveAll(m => !keep.Contains(m.UserId));

            var now = DateTime.UtcNow;
            foreach (var id in keep.Where(id => channel.Members.All(m => m.UserId != id)))
            {
                channel.Members.Add(new ConversationMember { UserId = id, JoinedAt = now });
            }
        }

        await db.SaveChangesAsync();

        return MessagingMapper.ToDto(channel);
    }

    public async Task DeleteChannelAsync(Guid userId, Guid channelId)
    {
        var me = await LoadUserAsync(userId);
        var channel = await LoadChannelAsync(channelId);
        RequireChannelManager(me, channel);

        db.Conversations.Remove(channel);
        await db.SaveChangesAsync();
    }

    public async Task<ConversationDto> JoinChannelAsync(Guid userId, Guid channelId)
    {
        var channel = await LoadChannelAsync(channelId);

        if (channel.Members.Any(m => m.UserId == userId)) return MessagingMapper.ToDto(channel);

        if (channel.Visibility != ChannelVisibility.Public || channel.Archived)
        {
            throw new MessagingForbiddenException("This channel is invite only.");
        }

        channel.Members.Add(new ConversationMember { UserId = userId, JoinedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();

        return MessagingMapper.ToDto(channel);
    }

    public async Task RemoveMemberAsync(Guid userId, Guid channelId, Guid memberId)
    {
        var me = await LoadUserAsync(userId);
        var channel = await LoadChannelAsync(channelId);

        // Anyone may leave; removing somebody else takes management rights.
        if (memberId != userId) RequireChannelManager(me, channel);

        if (channel.OwnerId == memberId)
        {
            throw new MessagingForbiddenException("The channel owner cannot be removed. Delete the channel instead.");
        }

        var member = channel.Members.FirstOrDefault(m => m.UserId == memberId);
        if (member is null) return;

        channel.Members.Remove(member);
        await db.SaveChangesAsync();
    }

    // ---------- Contacts ----------

    public async Task<UserDto> UpdateContactAsync(Guid userId, ContactInfoDto contact)
    {
        var me = await LoadUserAsync(userId);

        me.Contact = new ContactInfo
        {
            Email = (contact.Email ?? string.Empty).Trim(),
            Phone = (contact.Phone ?? string.Empty).Trim(),
            Location = (contact.Location ?? string.Empty).Trim(),
            Availability = (contact.Availability ?? string.Empty).Trim(),
            PreferredChannel = Enum.TryParse<PreferredChannel>(contact.PreferredChannel, ignoreCase: true, out var channel)
                ? channel
                : PreferredChannel.Chat,
        };

        await db.SaveChangesAsync();

        return MessagingMapper.ToDto(me, me, DateTime.UtcNow);
    }

    // ---------- Notifications ----------

    public async Task<NotificationDto> SendAnnouncementAsync(Guid userId, AnnouncementRequest request)
    {
        var me = await LoadUserAsync(userId);

        if (!MessagingMapper.IsStaff(me.Role))
        {
            throw new MessagingForbiddenException("Only coordinators and admins can send announcements.");
        }

        var title = (request.Title ?? string.Empty).Trim();
        var body = (request.Body ?? string.Empty).Trim();
        if (title.Length == 0 || body.Length == 0)
        {
            throw new MessagingValidationException("An announcement needs a title and a message.");
        }

        var category = ParseCategory(request.Category);
        var dueAt = ParseDueAt(request.DueAt);

        if (category is NotificationCategory.Deadline or NotificationCategory.Event && dueAt is null)
        {
            throw new MessagingValidationException("Deadlines and events need a date.");
        }

        // The audience is resolved here rather than trusted from the client.
        UserRole[] roles = (request.Audience ?? "all").ToLowerInvariant() switch
        {
            "interns" => [UserRole.Student],
            "mentors" => [UserRole.Mentor],
            "all" => [UserRole.Student, UserRole.Mentor],
            _ => throw new MessagingValidationException("Unknown audience."),
        };

        var recipientIds = await db.Users
            .Where(u => u.Id != userId && roles.Contains(u.Role))
            .Select(u => u.Id)
            .ToListAsync();

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            Category = category,
            Title = title,
            Body = body,
            CreatedAt = DateTime.UtcNow,
            DueAt = dueAt,
            Source = NotificationSource.Coordinator,
            SenderId = userId,
            Recipients = recipientIds.Select(id => new NotificationRecipient { UserId = id }).ToList(),
        };

        db.Notifications.Add(notification);
        await db.SaveChangesAsync();

        return MessagingMapper.ToDto(notification);
    }

    public async Task MarkNotificationsReadAsync(Guid userId, IReadOnlyList<Guid> notificationIds)
    {
        if (notificationIds.Count == 0) return;

        var ids = notificationIds.ToHashSet();
        var recipients = await db.NotificationRecipients
            .Where(r => r.UserId == userId && r.ReadAt == null && ids.Contains(r.NotificationId))
            .ToListAsync();

        if (recipients.Count == 0) return;

        var now = DateTime.UtcNow;
        foreach (var recipient in recipients) recipient.ReadAt = now;

        await db.SaveChangesAsync();
    }

    // ---------- Helpers ----------

    private async Task<User> LoadUserAsync(Guid userId) =>
        await db.Users.FirstOrDefaultAsync(u => u.Id == userId)
        ?? throw new MessagingNotFoundException("Your account could not be found.");

    private async Task<Conversation> LoadConversationAsync(Guid conversationId) =>
        await db.Conversations.Include(c => c.Members).FirstOrDefaultAsync(c => c.Id == conversationId)
        ?? throw new MessagingNotFoundException("That conversation no longer exists.");

    private async Task<Conversation> LoadChannelAsync(Guid channelId)
    {
        var channel = await LoadConversationAsync(channelId);
        if (channel.Type != ConversationType.Channel)
        {
            throw new MessagingValidationException("That conversation is not a channel.");
        }
        return channel;
    }

    private static void RequireMember(Conversation conversation, Guid userId)
    {
        if (conversation.Members.All(m => m.UserId != userId))
        {
            throw new MessagingForbiddenException("You are not a member of this conversation.");
        }
    }

    /// <summary>Mirrors canManageChannel() in the frontend store.</summary>
    private static void RequireChannelManager(User user, Conversation channel)
    {
        if (!MessagingMapper.IsStaff(user.Role) && channel.OwnerId != user.Id)
        {
            throw new MessagingForbiddenException("You cannot manage this channel.");
        }
    }

    private async Task ValidateChannelNameAsync(string name, Guid? excludingChannelId)
    {
        if (name.Length < 3)
        {
            throw new MessagingValidationException("A channel name needs at least 3 characters.");
        }

        var lowered = name.ToLowerInvariant();
        var others = db.Conversations.Where(c =>
            c.Type == ConversationType.Channel && c.Name != null && c.Name.ToLower() == lowered);

        // Comparing against a null Guid in SQL would never match, so the channel
        // being edited is excluded only when there is one.
        if (excludingChannelId is { } currentId)
        {
            others = others.Where(c => c.Id != currentId);
        }

        if (await others.AnyAsync())
        {
            throw new MessagingValidationException("A channel with this name already exists.");
        }
    }

    private async Task<HashSet<Guid>> ResolveMemberIdsAsync(IReadOnlyList<Guid>? requested, Guid owner)
    {
        var ids = (requested ?? []).Append(owner).ToHashSet();

        var known = await db.Users.CountAsync(u => ids.Contains(u.Id));
        if (known != ids.Count)
        {
            throw new MessagingValidationException("One of the selected members no longer exists.");
        }

        return ids;
    }

    private static DateTime? ParseDueAt(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;

        const DateTimeStyles styles = DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal;
        if (!DateTime.TryParse(value, CultureInfo.InvariantCulture, styles, out var parsed))
        {
            throw new MessagingValidationException("The date on this announcement could not be read.");
        }

        return DateTime.SpecifyKind(parsed, DateTimeKind.Utc);
    }

    private static ChannelKind ParseKind(string? value) =>
        Enum.TryParse<ChannelKind>(value, ignoreCase: true, out var kind)
            ? kind
            : throw new MessagingValidationException("Unknown channel kind.");

    private static ChannelVisibility ParseVisibility(string? value) =>
        Enum.TryParse<ChannelVisibility>(value, ignoreCase: true, out var visibility)
            ? visibility
            : throw new MessagingValidationException("Unknown channel visibility.");

    private static NotificationCategory ParseCategory(string? value) =>
        Enum.TryParse<NotificationCategory>(value, ignoreCase: true, out var category)
        && category != NotificationCategory.Message
            ? category
            : throw new MessagingValidationException("Unknown notification type.");
}
