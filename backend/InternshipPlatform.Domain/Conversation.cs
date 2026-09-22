namespace InternshipPlatform.Domain;

public class Conversation
{
    public Guid Id { get; set; }
    public ConversationType Type { get; set; }
    public DateTime CreatedAt { get; set; }

    // Channel-only fields. Null for direct conversations.
    public string? Name { get; set; }
    public string? Description { get; set; }
    public ChannelKind? Kind { get; set; }
    public ChannelVisibility? Visibility { get; set; }
    public bool Archived { get; set; }

    public Guid? OwnerId { get; set; }
    public User? Owner { get; set; }

    public List<ConversationMember> Members { get; set; } = [];
    public List<Message> Messages { get; set; } = [];
}
