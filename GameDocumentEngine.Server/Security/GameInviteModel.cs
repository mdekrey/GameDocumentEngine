namespace GameDocumentEngine.Server.Security;

#nullable disable warnings

public class GameInviteModel
{
	public Guid GameId { get; set; }
	public string InviteId { get; set; }
	public DateTimeOffset Expiration { get; set; }
	public int UsesRemaining { get; set; }
	public string GameRole { get; set; }

	public Documents.GameModel Game { get; set; }

}
