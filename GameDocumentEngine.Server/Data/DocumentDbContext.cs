﻿using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.Users;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json.Nodes;

namespace GameDocumentEngine.Server.Data;

public class DocumentDbContext : DbContext
{
	public DocumentDbContext(DbContextOptions<DocumentDbContext> options) : base(options)
	{
	}

	public DbSet<Users.UserModel> Users { get; set; }
	public DbSet<Documents.GameModel> Games { get; set; }
	public DbSet<Security.GameInviteModel> Invites { get; set; }
	public DbSet<Documents.GameUserModel> GameUsers { get; set; }
	public DbSet<Documents.DocumentModel> Documents { get; set; }
	public DbSet<Documents.DocumentUserModel> DocumentUsers { get; set; }

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);

		var emptyObject = JsonNode.Parse("{}");

		modelBuilder.Entity<Users.UserModel>(entity =>
		{
			entity.HasKey(u => u.Id);
			entity.HasIndex(u => u.GoogleNameId);

			entity.HasMany(u => u.Games).WithOne(u => u.User).HasForeignKey(u => u.UserId);

			entity.Property(d => d.Options)
				.HasDefaultValue(emptyObject)
				.HasConversion(JsonValueConverter.Instance);
		});

		modelBuilder.Entity<Documents.GameModel>(entity =>
		{
			entity.HasKey(g => g.Id);
			entity.HasMany(g => g.Players).WithOne(u => u.Game).HasForeignKey(u => u.GameId);

			entity.HasMany(g => g.Documents).WithOne(d => d.Game).HasForeignKey(du => du.GameId);

			entity.HasMany(g => g.ActiveInvites).WithOne(link => link.Game).HasForeignKey(link => link.GameId);
		});

		modelBuilder.Entity<Documents.DocumentModel>(entity =>
		{
			entity.HasKey(d => new { d.GameId, d.Id });
			entity.Property(d => d.Id).HasValueGenerator<RandomLongValueGenerator>();
			entity.HasIndex(d => new { d.GameId, d.FolderId, d.Name });
			entity.HasIndex(d => new { d.GameId, d.Type, d.Name });

			entity.HasMany(d => d.Players).WithOne(du => du.Document).HasPrincipalKey(d => new { d.GameId, d.Id }).HasForeignKey(du => new { du.GameId, du.DocumentId }).OnDelete(DeleteBehavior.NoAction);

			entity.Property(d => d.Details)
				.HasDefaultValue(emptyObject)
				.HasConversion(JsonValueConverter.Instance);
			entity.HasMany(d => d.FolderContents).WithOne(d => d.Folder).HasForeignKey(d => new { d.GameId, d.FolderId }).HasPrincipalKey(d => new { d.GameId, d.Id }).OnDelete(DeleteBehavior.Cascade);
		});

		modelBuilder.Entity<Documents.GameUserModel>(entity =>
		{
			entity.HasKey(d => new { d.GameId, d.PlayerId });
			entity.HasIndex(gu => new { gu.UserId, gu.GameId }).IsUnique();
			entity.HasMany(gu => gu.Documents).WithOne(du => du.GameUser).HasForeignKey(du => new { du.GameId, du.PlayerId }).HasPrincipalKey(gu => new { gu.GameId, gu.PlayerId });

			entity.Property(d => d.PlayerId).HasValueGenerator<RandomLongValueGenerator>();
			entity.Property(gu => gu.Role).IsRequired();
			entity.Property(d => d.Options)
				.HasDefaultValue(emptyObject)
				.HasConversion(JsonValueConverter.Instance);
		});

		modelBuilder.Entity<Documents.DocumentUserModel>(entity =>
		{
			entity.HasKey(du => new { du.GameId, du.PlayerId, du.DocumentId });
			entity.HasIndex(d => new { d.GameId, d.DocumentId });

			entity.Property(gu => gu.Role).IsRequired();
			entity.Property(d => d.Options)
				.HasDefaultValue(emptyObject)
				.HasConversion(JsonValueConverter.Instance);
		});

		modelBuilder.Entity<Security.GameInviteModel>(entity =>
		{
			entity.HasKey(link => link.InviteId);
			entity.HasIndex(link => new { link.GameId, link.Expiration });
			entity.HasIndex(link => link.Expiration);
		});
	}

	internal Task<GameUserModel> GetPlayerOrThrow(ClaimsPrincipal user, long gameId)
	{
		var userId = user.GetUserIdOrThrow();
		return GameUsers.FirstAsync(gu => gu.GameId == gameId && gu.UserId == userId);
	}
}
