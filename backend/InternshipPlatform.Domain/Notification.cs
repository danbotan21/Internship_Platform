namespace InternshipPlatform.Domain;

public class Notification
{
    public Guid Id { get; set; }
    public NotificationCategory Category { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? DueAt { get; set; }
    public NotificationSource Source { get; set; }

    /// <summary>Null when the notification was raised by the system.</summary>
    public Guid? SenderId { get; set; }
    public User? Sender { get; set; }

    /// <summary>Set when the notification deep-links into a conversation.</summary>
    public Guid? ConversationId { get; set; }
    public Conversation? Conversation { get; set; }

    public List<NotificationRecipient> Recipients { get; set; } = [];
}
