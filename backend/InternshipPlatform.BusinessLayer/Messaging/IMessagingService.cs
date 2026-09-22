namespace InternshipPlatform.BusinessLayer.Messaging;

public interface IMessagingService
{
    /// <summary>Loads the whole inbox for one user and refreshes their presence.</summary>
    Task<MessagingDataDto> GetDataAsync(Guid userId);

    Task<ConversationDto> StartDirectAsync(Guid userId, Guid otherUserId);
    Task<MessageDto> SendMessageAsync(Guid userId, Guid conversationId, SendMessageRequest request);
    Task MarkConversationReadAsync(Guid userId, Guid conversationId);

    Task<ConversationDto> CreateChannelAsync(Guid userId, CreateChannelRequest request);
    Task<ConversationDto> UpdateChannelAsync(Guid userId, Guid channelId, UpdateChannelRequest request);
    Task DeleteChannelAsync(Guid userId, Guid channelId);
    Task<ConversationDto> JoinChannelAsync(Guid userId, Guid channelId);
    Task RemoveMemberAsync(Guid userId, Guid channelId, Guid memberId);

    Task<UserDto> UpdateContactAsync(Guid userId, ContactInfoDto contact);

    Task<NotificationDto> SendAnnouncementAsync(Guid userId, AnnouncementRequest request);
    Task MarkNotificationsReadAsync(Guid userId, IReadOnlyList<Guid> notificationIds);
}

public class MessagingNotFoundException(string message) : Exception(message);
public class MessagingForbiddenException(string message) : Exception(message);
public class MessagingValidationException(string message) : Exception(message);
