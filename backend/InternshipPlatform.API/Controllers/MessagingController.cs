using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using InternshipPlatform.BusinessLayer.Messaging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPlatform.API.Controllers;

[ApiController]
[Authorize]
[Route("api/messaging")]
public class MessagingController(IMessagingService messaging) : ControllerBase
{
    [HttpGet]
    public Task<ActionResult<MessagingDataDto>> Get() =>
        Run(() => messaging.GetDataAsync(CurrentUserId));

    // ---------- Conversations ----------

    [HttpPost("conversations/direct")]
    public Task<ActionResult<ConversationDto>> StartDirect(StartDirectRequest request) =>
        Run(() => messaging.StartDirectAsync(CurrentUserId, request.UserId));

    [HttpPost("conversations/{conversationId:guid}/messages")]
    public Task<ActionResult<MessageDto>> SendMessage(Guid conversationId, SendMessageRequest request) =>
        Run(() => messaging.SendMessageAsync(CurrentUserId, conversationId, request));

    [HttpPost("conversations/{conversationId:guid}/read")]
    public Task<IActionResult> MarkRead(Guid conversationId) =>
        RunVoid(() => messaging.MarkConversationReadAsync(CurrentUserId, conversationId));

    // ---------- Channels ----------

    [HttpPost("channels")]
    public Task<ActionResult<ConversationDto>> CreateChannel(CreateChannelRequest request) =>
        Run(() => messaging.CreateChannelAsync(CurrentUserId, request));

    [HttpPatch("channels/{channelId:guid}")]
    public Task<ActionResult<ConversationDto>> UpdateChannel(Guid channelId, UpdateChannelRequest request) =>
        Run(() => messaging.UpdateChannelAsync(CurrentUserId, channelId, request));

    [HttpDelete("channels/{channelId:guid}")]
    public Task<IActionResult> DeleteChannel(Guid channelId) =>
        RunVoid(() => messaging.DeleteChannelAsync(CurrentUserId, channelId));

    [HttpPost("channels/{channelId:guid}/join")]
    public Task<ActionResult<ConversationDto>> JoinChannel(Guid channelId) =>
        Run(() => messaging.JoinChannelAsync(CurrentUserId, channelId));

    [HttpDelete("channels/{channelId:guid}/members/{memberId:guid}")]
    public Task<IActionResult> RemoveMember(Guid channelId, Guid memberId) =>
        RunVoid(() => messaging.RemoveMemberAsync(CurrentUserId, channelId, memberId));

    // ---------- Contacts & notifications ----------

    [HttpPut("me/contact")]
    public Task<ActionResult<UserDto>> UpdateContact(ContactInfoDto request) =>
        Run(() => messaging.UpdateContactAsync(CurrentUserId, request));

    [HttpPost("announcements")]
    public Task<ActionResult<NotificationDto>> SendAnnouncement(AnnouncementRequest request) =>
        Run(() => messaging.SendAnnouncementAsync(CurrentUserId, request));

    [HttpPost("notifications/read")]
    public Task<IActionResult> MarkNotificationsRead(MarkNotificationsReadRequest request) =>
        RunVoid(() => messaging.MarkNotificationsReadAsync(CurrentUserId, request.Ids ?? []));

    // ---------- Plumbing ----------

    private Guid CurrentUserId =>
        Guid.TryParse(User.FindFirstValue(JwtRegisteredClaimNames.Sub), out var id)
            ? id
            : throw new MessagingForbiddenException("The signed-in user could not be identified.");

    /// <summary>
    /// Turns the service's exceptions into the status codes the client expects.
    /// Every action funnels through here so the mapping stays in one place.
    /// </summary>
    private async Task<ActionResult<T>> Run<T>(Func<Task<T>> action)
    {
        try
        {
            return Ok(await action());
        }
        catch (MessagingNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (MessagingForbiddenException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (MessagingValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private async Task<IActionResult> RunVoid(Func<Task> action)
    {
        try
        {
            await action();
            return NoContent();
        }
        catch (MessagingNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (MessagingForbiddenException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (MessagingValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
