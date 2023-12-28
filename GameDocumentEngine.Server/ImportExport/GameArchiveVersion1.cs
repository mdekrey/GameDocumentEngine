using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents;
using Microsoft.EntityFrameworkCore;
using System.IO.Compression;

namespace GameDocumentEngine.Server.ImportExport;

public class GameArchiveVersion1
{
	private readonly DocumentDbContext dbContext;

	private const string NewVersion = "v1.0.0";
	private const string ManifestType = "vault-vtt-game";
	private record Manifest(string Version, DateTimeOffset CreatedAt, Guid OriginalGameId, string ManifestType);
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
	private record DocumentInfo(string Name, string DocumentType, Guid? FolderId, System.Text.Json.Nodes.JsonNode Details)
	{
		public static DocumentInfo FromDocument(DocumentModel document)
		{
			return new DocumentInfo(document.Name, document.Type, document.FolderId, document.Details);
		}

		public DocumentModel ToDocument(Guid id)
		{
			var result = new DocumentModel();
			result.Id = id;
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

	public GameArchiveVersion1(Data.DocumentDbContext dbContext)
	{
		this.dbContext = dbContext;
	}

	public async Task<Stream> CreateArchive(Guid gameId)
	{
		var result = new MemoryStream();

		var game = await dbContext.Games.FirstAsync(g => g.Id == gameId);

		// TODO: paginate? something? Make this more efficieint.
		var allDocuments = await (from doc in dbContext.Documents
								  where doc.GameId == gameId
								  select doc).ToArrayAsync();

		using (var zipArchive = new ZipArchive(result, ZipArchiveMode.Create, true))
		{
			await AddManifest(zipArchive, gameId);
			await AddJsonFile(zipArchive, "game.json", GameInfo.FromGame(game));

			foreach (var doc in allDocuments)
				await AddJsonFile(zipArchive, $"documents/{doc.Id}.json", DocumentInfo.FromDocument(doc));
		}

		result.Position = 0;
		return result;
	}

	private Task AddManifest(ZipArchive zipArchive, Guid gameId)
	{
		return AddJsonFile(zipArchive, "manifest.json", new Manifest(
			Version: NewVersion,
			CreatedAt: DateTimeOffset.Now,
			OriginalGameId: gameId,
			ManifestType: ManifestType
		));
	}

	private async Task AddJsonFile<T>(ZipArchive zipArchive, string entryName, T contents)
	{
		var entry = zipArchive.CreateEntry(entryName);
		using (var manifestOutput = entry.Open())
		{
			await System.Text.Json.JsonSerializer.SerializeAsync(manifestOutput, contents);
		}
	}
}
