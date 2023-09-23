using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameDocumentEngine.Server.Migrations
{
	/// <inheritdoc />
	public partial class FolderOrganization : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.AddColumn<Guid>(
				name: "FolderId",
				table: "Documents",
				type: "uuid",
				nullable: true);

			migrationBuilder.CreateIndex(
				name: "IX_Documents_FolderId",
				table: "Documents",
				column: "FolderId");

			migrationBuilder.CreateIndex(
				name: "IX_Documents_GameId_FolderId_Name",
				table: "Documents",
				columns: new[] { "GameId", "FolderId", "Name" });

			migrationBuilder.CreateIndex(
				name: "IX_Documents_GameId_Type_Name",
				table: "Documents",
				columns: new[] { "GameId", "Type", "Name" });

			migrationBuilder.AddForeignKey(
				name: "FK_Documents_Documents_FolderId",
				table: "Documents",
				column: "FolderId",
				principalTable: "Documents",
				principalColumn: "Id",
				onDelete: ReferentialAction.Cascade);
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropForeignKey(
				name: "FK_Documents_Documents_FolderId",
				table: "Documents");

			migrationBuilder.DropIndex(
				name: "IX_Documents_FolderId",
				table: "Documents");

			migrationBuilder.DropIndex(
				name: "IX_Documents_GameId_FolderId_Name",
				table: "Documents");

			migrationBuilder.DropIndex(
				name: "IX_Documents_GameId_Type_Name",
				table: "Documents");

			migrationBuilder.DropColumn(
				name: "FolderId",
				table: "Documents");
		}
	}
}
