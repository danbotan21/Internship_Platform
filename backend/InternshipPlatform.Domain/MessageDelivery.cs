namespace InternshipPlatform.Domain;

public class MessageDelivery
{
    public Guid MessageId { get; set; }
    public Message Message { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime DeliveredAt { get; set; }
}
