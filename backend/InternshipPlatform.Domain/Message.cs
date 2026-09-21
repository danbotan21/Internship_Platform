namespace InternshipPlatform.Domain;

public class Message
{
    public Guid Id { get; set; }

    public Guid ConversationId { get; set; }
    public Conversation Conversation { get; set; } = null!;

    public Guid AuthorId { get; set; }
    public User Author { get; set; } = null!;

    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    /// <summary>Replies within a channel thread point at their parent message.</summary>
    public Guid? ParentId { get; set; }
    public Message? Parent { get; set; }
    public List<Message> Replies { get; set; } = [];

    public string? AttachmentName { get; set; }
    public long? AttachmentSize { get; set; }

    public List<MessageDelivery> Deliveries { get; set; } = [];
    public List<MessageRead> Reads { get; set; } = [];
}
