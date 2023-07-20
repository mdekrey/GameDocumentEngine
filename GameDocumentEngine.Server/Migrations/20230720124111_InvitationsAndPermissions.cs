using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameDocumentEngine.Server.Migrations
{
	/// <inheritdoc />
	public partial class InvitationsAndPermissions : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.AddColumn<string>(
				name: "Role",
				table: "DocumentUsers",
				type: "nvarchar(max)",
				nullable: false,
				defaultValue: "");

			migrationBuilder.CreateTable(
				name: "Invites",
				columns: table => new
				{
					InviteId = table.Column<string>(type: "nvarchar(450)", nullable: false),
					GameId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					Expiration = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
					UsesRemaining = table.Column<int>(type: "int", nullable: false),
					GameRole = table.Column<string>(type: "nvarchar(max)", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_Invites", x => x.InviteId);
					table.ForeignKey(
						name: "FK_Invites_Games_GameId",
						column: x => x.GameId,
						principalTable: "Games",
						principalColumn: "Id",
						onDelete: ReferentialAction.Cascade);
				});

			migrationBuilder.CreateIndex(
				name: "IX_Invites_Expiration",
				table: "Invites",
				column: "Expiration");

			migrationBuilder.CreateIndex(
				name: "IX_Invites_GameId_Expiration",
				table: "Invites",
				columns: new[] { "GameId", "Expiration" });
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropTable(
				name: "Invites");

			migrationBuilder.DropColumn(
				name: "Role",
				table: "DocumentUsers");
		}
	}
}
