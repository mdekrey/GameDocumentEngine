using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.IO.Compression;
using System.Text.RegularExpressions;

namespace GameDocumentEngine.Server.ImportExport;

public partial class GameArchiveVersion1
{
	private readonly DocumentDbContext dbContext;

	private const string NewVersion = "v1.0.0";
	private const string ManifestType = "vault-vtt-game";
	private const string ManifestPath = "manifest.json";
	private const string GamePath = "game.json";

	private string DocumentPath(long documentId) => $"documents/{Api.Identifier.ToString(documentId)}.json";
	[GeneratedRegex("documents/(?<documentId>[^./]+)\\.json")] private static partial Regex DocumentPathRegex();
	private Identifier? IsDocumentPath(string path) => DocumentPathRegex().Match(path) is not { Success: true, Groups: var g } ? null
		: Identifier.FromString(g["documentId"].Value);

	private string PlayerPath(long playerId) => $"players/{Api.Identifier.ToString(playerId)}.json";
	[GeneratedRegex("players/(?<playerId>[^./]+)\\.json")] private static partial Regex PlayerPathRegex();
	private Identifier? IsPlayerPath(string path) => PlayerPathRegex().Match(path) is not { Success: true, Groups: var g } ? null
		: Identifier.FromString(g["playerId"].Value);

	private string PlayerDocumentPath(long playerId, long documentId) => $"players/{Api.Identifier.ToString(playerId)}/{Api.Identifier.ToString(documentId)}.json";
	[GeneratedRegex("players/(?<playerId>[^./]+)/(?<documentId>[^./]+)\\.json")] private static partial Regex PlayerDocumentPathRegex();
	private (Identifier PlayerId, Identifier DocumentId)? IsPlayerDocumentPath(string path) => PlayerDocumentPathRegex().Match(path) is not { Success: true, Groups: var g } ? null
		: (PlayerId: Identifier.FromString(g["playerId"].Value), DocumentId: Identifier.FromString(g["documentId"].Value));

	private record Manifest(string Version, DateTimeOffset CreatedAt, Identifier OriginalGameId, string ManifestType);
	private record GameInfo(Identifier Id, string Name, string GameType)
	{
		public static GameInfo FromGame(GameModel game)
		{
			return new GameInfo(Identifier.FromLong(game.Id), game.Name, game.Type);
		}

		public GameModel ToGame()
		{
			var result = new GameModel();
			Apply(result);
			return result;
		}

		public void Apply(GameModel game)
		{
			game.Name = Name;
			game.Type = GameType;
		}
	}
	private record DocumentInfo(string Name, string DocumentType, long? FolderId, System.Text.Json.Nodes.JsonNode Details)
	{
		public static DocumentInfo FromDocument(DocumentModel document)
		{
			return new DocumentInfo(document.Name, document.Type, document.FolderId, document.Details);
		}

		public DocumentModel ToDocument(Identifier id)
		{
			var result = new DocumentModel();
			result.Id = id.Value;
			Apply(result);
			return result;
		}

		public void Apply(DocumentModel document)
		{
			document.Name = Name;
			document.Type = DocumentType;
			document.Details = Details;
			document.FolderId = FolderId;
		}
	}
	private record PlayerInfo(string? Name, string Role, System.Text.Json.Nodes.JsonNode Options)
	{
		public static PlayerInfo FromGameUser(GameUserModel player)
		{
			return new PlayerInfo(player.NameOverride ?? player.User?.Name, player.Role, player.Options);
		}

		public GameUserModel ToPlayer(Identifier id)
		{
			var result = new GameUserModel();
			result.PlayerId = id.Value;
			Apply(result);
			return result;
		}

		public void Apply(GameUserModel player)
		{
			if (player.User == null || player.User.Name != Name) player.NameOverride = Name;
			player.Role = Role;
			player.Options = Options;
		}
	}
	private record PlayerDocumentInfo(string Role, System.Text.Json.Nodes.JsonNode Options)
	{
		public static PlayerDocumentInfo FromDocumentGameUser(DocumentUserModel playerDocument)
		{
			return new PlayerDocumentInfo(playerDocument.Role, playerDocument.Options);
		}

		public DocumentUserModel ToPlayerDocument(Identifier playerId, Identifier documentId)
		{
			var result = new DocumentUserModel();
			result.PlayerId = playerId.Value;
			result.DocumentId = documentId.Value;
			Apply(result);
			return result;
		}

		public void Apply(DocumentUserModel player)
		{
			player.Role = Role;
			player.Options = Options;
		}
	}

	public GameArchiveVersion1(DocumentDbContext dbContext)
	{
		this.dbContext = dbContext;
	}

	public async Task AddToArchive(long gameId, Stream stream)
	{
		var game = await dbContext.Games.FirstAsync(g => g.Id == gameId);

		// TODO: paginate? something? Make this more efficieint.
		var allDocuments = await dbContext.Documents.Where(doc => doc.GameId == gameId).ToArrayAsync();
		var allPlayers = await dbContext.GameUsers.Where(gu => gu.GameId == gameId).Include(doc => doc.Documents).Include(doc => doc.User).ToArrayAsync();


		using var zipArchive = new ZipArchive(stream, ZipArchiveMode.Create, true);
		await AddManifest(zipArchive, (Identifier)gameId);
		await AddJsonFile(zipArchive, GamePath, GameInfo.FromGame(game));

		foreach (var doc in allDocuments)
			await AddJsonFile(zipArchive, DocumentPath(doc.Id), DocumentInfo.FromDocument(doc));
		foreach (var player in allPlayers)
		{
			await AddJsonFile(zipArchive, PlayerPath(player.PlayerId), PlayerInfo.FromGameUser(player));
			foreach (var document in player.Documents)
				await AddJsonFile(zipArchive, PlayerDocumentPath(player.PlayerId, document.DocumentId), PlayerDocumentInfo.FromDocumentGameUser(document));
		}
	}

	internal static async Task<bool> IsValid(ZipArchive zipArchive)
	{
		var manifest = await ReadJsonFile<Manifest>(zipArchive, ManifestPath);
		if (manifest is not { Version: NewVersion, ManifestType: ManifestType }) return false;
		return true;
	}

	public async Task<GameModel?> UnpackNewGame(ZipArchive zipArchive)
	{
		var gameInfo = await ReadGame(zipArchive);
		if (gameInfo == null) return null;
		var game = gameInfo.ToGame();

		foreach (var entry in from e in zipArchive.Entries
							  let docId = IsDocumentPath(e.FullName)
							  where docId != null
							  select (ZipEntry: e, OriginalId: docId))
		{
			var docInfo = await ReadJsonFile<DocumentInfo>(entry.ZipEntry);
			if (docInfo == null) continue;
			game.Documents.Add(docInfo.ToDocument(entry.OriginalId));
		}

		var players = new List<GameUserModel>();
		foreach (var entry in from e in zipArchive.Entries
							  let playerId = IsPlayerPath(e.FullName)
							  where playerId != null
							  select (ZipEntry: e, OriginalId: playerId))
		{
			var playerInfo = await ReadJsonFile<PlayerInfo>(entry.ZipEntry);
			if (playerInfo == null) continue;
			var id = entry.OriginalId;
			var player = playerInfo.ToPlayer(id);
			game.Players.Add(player);
			players.Add(player);
		}

		foreach (var entry in from e in zipArchive.Entries
							  let ids = IsPlayerDocumentPath(e.FullName)
							  where ids != null
							  select (ZipEntry: e, ids.Value.PlayerId, ids.Value.DocumentId))
		{
			var player = players.FirstOrDefault(p => p.PlayerId == entry.PlayerId.Value);
			if (player == null) continue;
			var playerDocumentInfo = await ReadJsonFile<PlayerDocumentInfo>(entry.ZipEntry);
			if (playerDocumentInfo == null) continue;
			var playerDocument = playerDocumentInfo.ToPlayerDocument(entry.PlayerId, entry.DocumentId);
			player.Documents.Add(playerDocument);
		}

		return game;
	}

	public async Task<bool> UnpackIntoGame(ZipArchive zipArchive, GameModel game, ImportIntoExistingGameOptions options)
	{
		var gameInfo = await ReadGame(zipArchive);
		if (gameInfo == null) return false;
		if (gameInfo.GameType != game.Type) return false;
		gameInfo.Apply(game);

		foreach (var entry in from e in zipArchive.Entries
							  let docId = IsDocumentPath(e.FullName)
							  where docId != null
							  select (ZipEntry: e, OriginalId: docId))
		{
			var docInfo = await ReadJsonFile<DocumentInfo>(entry.ZipEntry);
			if (docInfo == null) continue;
			var id = entry.OriginalId;
			var document = await dbContext.Documents.Where(d => d.GameId == game.Id && d.Id == id.Value).FirstOrDefaultAsync();
			if (document == null)
			{
				document = docInfo.ToDocument(id);
				game.Documents.Add(document);
			}
			else
				docInfo.Apply(document);
		}

		var players = new List<GameUserModel>();
		foreach (var entry in from e in zipArchive.Entries
							  let playerId = IsPlayerPath(e.FullName)
							  where playerId != null
							  select (ZipEntry: e, OriginalId: playerId))
		{
			var playerInfo = await ReadJsonFile<PlayerInfo>(entry.ZipEntry);
			if (playerInfo == null) continue;
			var id = entry.OriginalId;
			var player = await dbContext.GameUsers.Where(d => d.GameId == game.Id && d.PlayerId == id.Value).Include(doc => doc.Documents).Include(doc => doc.User).FirstOrDefaultAsync();
			if (player == null)
			{
				player = playerInfo.ToPlayer(id);
				game.Players.Add(player);
			}
			else
				playerInfo.Apply(player);
			players.Add(player);
		}

		foreach (var entry in from e in zipArchive.Entries
							  let ids = IsPlayerDocumentPath(e.FullName)
							  where ids != null
							  select (ZipEntry: e, ids.Value.PlayerId, ids.Value.DocumentId))
		{
			var player = players.FirstOrDefault(p => p.PlayerId == entry.PlayerId.Value);
			if (player == null) continue;
			var playerDocumentInfo = await ReadJsonFile<PlayerDocumentInfo>(entry.ZipEntry);
			if (playerDocumentInfo == null) continue;
			var playerDocument = player.Documents.FirstOrDefault(d => d.DocumentId == entry.DocumentId.Value);
			if (playerDocument == null)
			{
				playerDocument = playerDocumentInfo.ToPlayerDocument(entry.PlayerId, entry.DocumentId);
				player.Documents.Add(playerDocument);
			}
			else
				playerDocumentInfo.Apply(playerDocument);
		}

		return true;
	}

	public async Task<InspectGameArchiveResponse?> GetArchiveDetails(ZipArchive zipArchive)
	{
		var gameInfo = await ReadGame(zipArchive);
		if (gameInfo == null) return null;

		return new InspectGameArchiveResponse(
			Game: new GameSummary(gameInfo.Id, gameInfo.Name)
		);
	}

	private Task AddManifest(ZipArchive zipArchive, Identifier gameId)
	{
		return AddJsonFile(zipArchive, ManifestPath, new Manifest(
			Version: NewVersion,
			CreatedAt: DateTimeOffset.Now,
			OriginalGameId: gameId,
			ManifestType: ManifestType
		));
	}

	private async Task<GameInfo?> ReadGame(ZipArchive zipArchive)
	{
		return await ReadJsonFile<GameInfo>(zipArchive, "game.json");
	}

	private static async Task AddJsonFile<T>(ZipArchive zipArchive, string entryName, T contents)
	{
		var entry = zipArchive.CreateEntry(entryName);
		using var manifestOutput = entry.Open();
		await System.Text.Json.JsonSerializer.SerializeAsync(manifestOutput, contents);
	}

	private static async Task<T?> ReadJsonFile<T>(ZipArchive zipArchive, string entryName)
	{
		if (zipArchive.GetEntry(entryName) is not ZipArchiveEntry entry) return default;
		return await ReadJsonFile<T>(entry);
	}

	private static async Task<T?> ReadJsonFile<T>(ZipArchiveEntry entry)
	{
		using var fileStream = entry.Open();
		return await System.Text.Json.JsonSerializer.DeserializeAsync<T>(fileStream);
	}
}