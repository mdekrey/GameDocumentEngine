using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents;
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
	[GeneratedRegex("documents/(?<documentId>[^.]+)\\.json")] private static partial Regex DocumentPathRegex();
	private string? IsDocumentPath(string path) => DocumentPathRegex().Match(path) is not { Success: true, Groups: var g } ? null
		: g["documentId"].Value;

	private record Manifest(string Version, DateTimeOffset CreatedAt, Identifier OriginalGameId, string ManifestType);
	private record GameInfo(string Name, string GameType)
	{
		public static GameInfo FromGame(GameModel game)
		{
			return new GameInfo(game.Name, game.Type);
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

	public GameArchiveVersion1(DocumentDbContext dbContext)
	{
		this.dbContext = dbContext;
	}

	public async Task<Stream> CreateArchive(long gameId)
	{
		var result = new MemoryStream();

		var game = await dbContext.Games.FirstAsync(g => g.Id == gameId);

		// TODO: paginate? something? Make this more efficieint.
		var allDocuments = await (from doc in dbContext.Documents
								  where doc.GameId == gameId
								  select doc).ToArrayAsync();

		using (var zipArchive = new ZipArchive(result, ZipArchiveMode.Create, true))
		{
			await AddManifest(zipArchive, (Identifier)gameId);
			await AddJsonFile(zipArchive, GamePath, GameInfo.FromGame(game));

			foreach (var doc in allDocuments)
				await AddJsonFile(zipArchive, DocumentPath(doc.Id), DocumentInfo.FromDocument(doc));
		}

		result.Position = 0;
		return result;
	}

	internal static async Task<bool> IsValid(ZipArchive zipArchive)
	{
		var manifest = await ReadJsonFile<Manifest>(zipArchive, ManifestPath);
		if (manifest is not { Version: NewVersion, ManifestType: ManifestType }) return false;
		return true;
	}

	public async Task<GameModel?> UnpackNewGame(ZipArchive zipArchive)
	{
		var gameInfo = await ReadJsonFile<GameInfo>(zipArchive, "game.json");
		if (gameInfo == null) return null;
		var game = gameInfo.ToGame();

		var entries = (
			from e in zipArchive.Entries
			let docId = IsDocumentPath(e.FullName)
			where docId != null
			select (ZipEntry: e, OriginalId: docId!)
		).ToArray();

		foreach (var entry in entries)
		{
			var docInfo = await ReadJsonFile<DocumentInfo>(entry.ZipEntry);
			if (docInfo == null) continue;
			game.Documents.Add(docInfo.ToDocument(Identifier.FromString(entry.OriginalId)));
		}

		return game;
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