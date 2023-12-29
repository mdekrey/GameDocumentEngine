using System;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace GameDocumentEngine.Server.Migrations
{
	/// <inheritdoc />
	public partial class CompositeIds : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.AddColumn<long>(
				name: "PlayerId",
				table: "GameUsers",
				type: "bigint",
				nullable: false,
				defaultValue: 0L);

			migrationBuilder.AddColumn<long>(
				name: "NewId",
				table: "Documents",
				type: "bigint",
				nullable: false,
				defaultValue: 0L);

			migrationBuilder.AddColumn<long>(
				name: "NewGameId",
				table: "DocumentUsers",
				type: "bigint",
				nullable: false,
				defaultValue: 0L);

			migrationBuilder.AddColumn<long>(
				name: "NewDocumentId",
				table: "DocumentUsers",
				type: "bigint",
				nullable: false,
				defaultValue: 0L);

			migrationBuilder.AddColumn<long>(
				name: "PlayerId",
				table: "DocumentUsers",
				type: "bigint",
				nullable: false,
				defaultValue: 0L);

			migrationBuilder.AddColumn<long>(
				name: "NewFolderId",
				table: "Documents",
				type: "bigint",
				nullable: true);

			migrationBuilder.AddColumn<long>(
				name: "NewGameId",
				table: "Invites",
				type: "bigint",
				nullable: false,
				defaultValue: 0L);

			migrationBuilder.AddColumn<long>(
				name: "NewGameId",
				table: "GameUsers",
				type: "bigint",
				nullable: false,
				defaultValue: 0L);

			migrationBuilder.AddColumn<long>(
				name: "NewId",
				table: "Games",
				type: "bigint",
				nullable: false)
				.Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

			migrationBuilder.AddColumn<long>(
				name: "NewGameId",
				table: "Documents",
				type: "bigint",
				nullable: false,
				defaultValue: 0L);

			migrationBuilder.Sql(@"UPDATE ""Invites"" SET ""NewGameId"" = ""Games"".""NewId"" FROM ""Games"" WHERE ""Games"".""Id"" = ""Invites"".""GameId"" ");
			migrationBuilder.Sql(@"UPDATE ""GameUsers"" SET ""NewGameId"" = ""Games"".""NewId"" FROM ""Games"" WHERE ""Games"".""Id"" = ""GameUsers"".""GameId"" ");
			migrationBuilder.Sql(@"UPDATE ""GameUsers"" SET ""PlayerId"" = ('x' || translate(gen_random_uuid()::text, '-', ''))::bit(64)::bigint");
			migrationBuilder.Sql(@"UPDATE ""Documents"" SET ""NewGameId"" = ""Games"".""NewId"" FROM ""Games"" WHERE ""Games"".""Id"" = ""Documents"".""GameId"" ");
			migrationBuilder.Sql(@"UPDATE ""Documents"" SET ""NewId"" = ('x' || translate(""Id""::text, '-', ''))::bit(64)::bigint");
			migrationBuilder.Sql(@"UPDATE ""DocumentUsers"" SET ""NewDocumentId"" = ""Documents"".""NewId"", ""NewGameId"" = ""Documents"".""NewGameId"" FROM ""Documents"" WHERE ""DocumentUsers"".""GameId"" = ""Documents"".""GameId"" AND ""DocumentUsers"".""DocumentId"" = ""Documents"".""Id""");
			migrationBuilder.Sql(@"UPDATE ""DocumentUsers"" SET ""PlayerId"" = ""GameUsers"".""PlayerId"" FROM ""GameUsers"" WHERE ""DocumentUsers"".""GameId"" = ""GameUsers"".""GameId"" AND ""DocumentUsers"".""UserId"" = ""GameUsers"".""UserId""");
			migrationBuilder.Sql(@"UPDATE ""Documents"" SET ""NewFolderId"" = folder.""NewId"" FROM ""Documents"" AS folder WHERE ""Documents"".""GameId"" = folder.""GameId"" AND ""Documents"".""FolderId"" = folder.""Id""");

			migrationBuilder.DropForeignKey(
				name: "FK_DocumentUsers_Documents_GameId_DocumentId",
				table: "DocumentUsers");

			migrationBuilder.DropForeignKey(
				name: "FK_Documents_Games_GameId",
				table: "Documents");

			migrationBuilder.DropForeignKey(
				name: "FK_Documents_Documents_FolderId",
				table: "Documents");

			migrationBuilder.DropForeignKey(
				name: "FK_DocumentUsers_GameUsers_UserId_GameId",
				table: "DocumentUsers");

			migrationBuilder.DropForeignKey(
				name: "FK_DocumentUsers_Users_UserId",
				table: "DocumentUsers");

			migrationBuilder.DropPrimaryKey(
				name: "PK_GameUsers",
				table: "GameUsers");

			migrationBuilder.DropForeignKey(
				name: "FK_GameUsers_Games_GameId",
				table: "GameUsers");

			migrationBuilder.DropIndex(
				name: "IX_GameUsers_GameId",
				table: "GameUsers");

			migrationBuilder.DropPrimaryKey(
				name: "PK_DocumentUsers",
				table: "DocumentUsers");

			migrationBuilder.DropIndex(
				name: "IX_DocumentUsers_DocumentId",
				table: "DocumentUsers");

			migrationBuilder.DropIndex(
				name: "IX_DocumentUsers_UserId_GameId",
				table: "DocumentUsers");

			migrationBuilder.DropUniqueConstraint(
				name: "AK_Documents_GameId_Id",
				table: "Documents");

			migrationBuilder.DropPrimaryKey(
				name: "PK_Documents",
				table: "Documents");

			migrationBuilder.DropIndex(
				name: "IX_Documents_FolderId",
				table: "Documents");

			migrationBuilder.DropIndex(
				name: "IX_Documents_GameId_Id",
				table: "Documents");

			migrationBuilder.DropColumn(
				name: "UserId",
				table: "DocumentUsers");

			migrationBuilder.DropColumn(
				name: "DocumentId",
				table: "DocumentUsers");

			migrationBuilder.DropColumn(
				name: "GameId",
				table: "DocumentUsers");

			migrationBuilder.DropColumn(
				name: "FolderId",
				table: "Documents");

			migrationBuilder.DropColumn(
				name: "Id",
				table: "Documents");

			migrationBuilder.DropColumn(
				name: "GameId",
				table: "Invites");

			migrationBuilder.DropColumn(
				name: "GameId",
				table: "GameUsers");

			migrationBuilder.DropColumn(
				name: "Id",
				table: "Games");

			migrationBuilder.DropColumn(
				name: "GameId",
				table: "Documents");

			migrationBuilder.RenameColumn(
				name: "NewGameId",
				table: "DocumentUsers",
				newName: "GameId");

			migrationBuilder.RenameColumn(
				name: "NewDocumentId",
				table: "DocumentUsers",
				newName: "DocumentId");

			migrationBuilder.RenameColumn(
				name: "NewFolderId",
				table: "Documents",
				newName: "FolderId");

			migrationBuilder.RenameColumn(
				name: "NewId",
				table: "Documents",
				newName: "Id");

			migrationBuilder.RenameColumn(
				name: "NewGameId",
				newName: "GameId",
				table: "Invites");

			migrationBuilder.RenameColumn(
				name: "NewGameId",
				newName: "GameId",
				table: "GameUsers");

			migrationBuilder.RenameColumn(
				name: "NewId",
				newName: "Id",
				table: "Games");

			migrationBuilder.RenameColumn(
				name: "NewGameId",
				newName: "GameId",
				table: "Documents");

			migrationBuilder.AlterColumn<long>(
				name: "DocumentId",
				table: "DocumentUsers",
				oldDefaultValue: 0L,
				defaultValue: null
			);

			migrationBuilder.AlterColumn<long>(
				name: "Id",
				table: "Documents",
				oldDefaultValue: 0L,
				defaultValue: null
			);

			migrationBuilder.AlterColumn<long>(
				name: "GameId",
				table: "Documents",
				oldDefaultValue: 0L,
				defaultValue: null
			);

			migrationBuilder.AlterColumn<long>(
				name: "GameId",
				table: "DocumentUsers",
				oldDefaultValue: 0L,
				defaultValue: null
			);

			migrationBuilder.AlterColumn<long>(
				name: "GameId",
				table: "Invites",
				oldDefaultValue: 0L,
				defaultValue: null
			);

			migrationBuilder.AlterColumn<long>(
				name: "GameId",
				table: "GameUsers",
				oldDefaultValue: 0L,
				defaultValue: null
			);

			migrationBuilder.AddPrimaryKey(
				name: "PK_Games",
				table: "Games",
				columns: new[] { "Id" });

			migrationBuilder.AddPrimaryKey(
				name: "PK_GameUsers",
				table: "GameUsers",
				columns: new[] { "GameId", "PlayerId" });

			migrationBuilder.AddPrimaryKey(
				name: "PK_DocumentUsers",
				table: "DocumentUsers",
				columns: new[] { "GameId", "PlayerId", "DocumentId" });

			migrationBuilder.AddPrimaryKey(
				name: "PK_Documents",
				table: "Documents",
				columns: new[] { "GameId", "Id" });

			migrationBuilder.CreateIndex(
				name: "IX_GameUsers_UserId_GameId",
				table: "GameUsers",
				columns: new[] { "UserId", "GameId" },
				unique: true);

			migrationBuilder.AddForeignKey(
				name: "FK_GameUsers_Games_GameId",
				table: "GameUsers",
				column: "GameId",
				principalTable: "Games",
				principalColumn: "Id",
				onDelete: ReferentialAction.Cascade);

			migrationBuilder.AddForeignKey(
				name: "FK_Documents_Games_GameId",
				table: "Documents",
				column: "GameId",
				principalTable: "Games",
				principalColumn: "Id",
				onDelete: ReferentialAction.Cascade);

			migrationBuilder.AddForeignKey(
				name: "FK_Documents_Documents_GameId_FolderId",
				table: "Documents",
				columns: new[] { "GameId", "FolderId" },
				principalTable: "Documents",
				principalColumns: new[] { "GameId", "Id" },
				onDelete: ReferentialAction.Cascade);

			migrationBuilder.AddForeignKey(
				name: "FK_DocumentUsers_GameUsers_GameId_PlayerId",
				table: "DocumentUsers",
				columns: new[] { "GameId", "PlayerId" },
				principalTable: "GameUsers",
				principalColumns: new[] { "GameId", "PlayerId" },
				onDelete: ReferentialAction.Cascade);

			migrationBuilder.AddForeignKey(
				name: "FK_DocumentUsers_Documents_GameId_DocumentId",
				table: "DocumentUsers",
				columns: new[] { "GameId", "DocumentId" },
				principalTable: "Documents",
				principalColumns: new[] { "GameId", "Id" });

			migrationBuilder.AddForeignKey(
				name: "FK_Invites_Games_GameId",
				table: "Invites",
				column: "GameId",
				principalTable: "Games",
				principalColumn: "Id",
				onDelete: ReferentialAction.Cascade);

			migrationBuilder.CreateIndex(
				name: "IX_DocumentUsers_GameId_DocumentId",
				table: "DocumentUsers",
				columns: new[] { "GameId", "DocumentId" });

			migrationBuilder.CreateIndex(
				name: "IX_Documents_GameId_FolderId_Name",
				table: "Documents",
				columns: new[] { "GameId", "FolderId", "Name" });

			migrationBuilder.CreateIndex(
				name: "IX_Documents_GameId_Type_Name",
				table: "Documents",
				columns: new[] { "GameId", "Type", "Name" });

			migrationBuilder.CreateIndex(
				name: "IX_Invites_GameId_Expiration",
				table: "Invites",
				columns: new[] { "GameId", "Expiration" });
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			throw new NotImplementedException();
		}
	}
}
