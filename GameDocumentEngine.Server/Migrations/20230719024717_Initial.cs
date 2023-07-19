using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameDocumentEngine.Server.Migrations
{
	/// <inheritdoc />
	public partial class Initial : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.CreateTable(
				name: "Games",
				columns: table => new
				{
					Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
					Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
					CreatedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
					CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
					LastModifiedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
					LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_Games", x => x.Id);
				});

			migrationBuilder.CreateTable(
				name: "Users",
				columns: table => new
				{
					Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
					GoogleNameId = table.Column<string>(type: "nvarchar(450)", nullable: false),
					EmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_Users", x => x.Id);
				});

			migrationBuilder.CreateTable(
				name: "Documents",
				columns: table => new
				{
					Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					GameId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
					Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
					Details = table.Column<string>(type: "nvarchar(max)", nullable: false),
					CreatedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
					CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
					LastModifiedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
					LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_Documents", x => x.Id);
					table.UniqueConstraint("AK_Documents_GameId_Id", x => new { x.GameId, x.Id });
					table.ForeignKey(
						name: "FK_Documents_Games_GameId",
						column: x => x.GameId,
						principalTable: "Games",
						principalColumn: "Id",
						onDelete: ReferentialAction.Cascade);
				});

			migrationBuilder.CreateTable(
				name: "GameUsers",
				columns: table => new
				{
					GameId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
					CreatedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
					CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
					LastModifiedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
					LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_GameUsers", x => new { x.UserId, x.GameId });
					table.ForeignKey(
						name: "FK_GameUsers_Games_GameId",
						column: x => x.GameId,
						principalTable: "Games",
						principalColumn: "Id",
						onDelete: ReferentialAction.Cascade);
					table.ForeignKey(
						name: "FK_GameUsers_Users_UserId",
						column: x => x.UserId,
						principalTable: "Users",
						principalColumn: "Id",
						onDelete: ReferentialAction.Cascade);
				});

			migrationBuilder.CreateTable(
				name: "DocumentUsers",
				columns: table => new
				{
					DocumentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					GameId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					CreatedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
					CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
					LastModifiedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
					LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_DocumentUsers", x => new { x.UserId, x.DocumentId });
					table.ForeignKey(
						name: "FK_DocumentUsers_Documents_GameId_DocumentId",
						columns: x => new { x.GameId, x.DocumentId },
						principalTable: "Documents",
						principalColumns: new[] { "GameId", "Id" });
					table.ForeignKey(
						name: "FK_DocumentUsers_GameUsers_UserId_GameId",
						columns: x => new { x.UserId, x.GameId },
						principalTable: "GameUsers",
						principalColumns: new[] { "UserId", "GameId" },
						onDelete: ReferentialAction.Cascade);
					table.ForeignKey(
						name: "FK_DocumentUsers_Users_UserId",
						column: x => x.UserId,
						principalTable: "Users",
						principalColumn: "Id");
				});

			migrationBuilder.CreateIndex(
				name: "IX_Documents_GameId_Id",
				table: "Documents",
				columns: new[] { "GameId", "Id" });

			migrationBuilder.CreateIndex(
				name: "IX_DocumentUsers_DocumentId",
				table: "DocumentUsers",
				column: "DocumentId");

			migrationBuilder.CreateIndex(
				name: "IX_DocumentUsers_GameId_DocumentId",
				table: "DocumentUsers",
				columns: new[] { "GameId", "DocumentId" });

			migrationBuilder.CreateIndex(
				name: "IX_DocumentUsers_UserId_GameId",
				table: "DocumentUsers",
				columns: new[] { "UserId", "GameId" });

			migrationBuilder.CreateIndex(
				name: "IX_GameUsers_GameId",
				table: "GameUsers",
				column: "GameId");

			migrationBuilder.CreateIndex(
				name: "IX_Users_GoogleNameId",
				table: "Users",
				column: "GoogleNameId");
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropTable(
				name: "DocumentUsers");

			migrationBuilder.DropTable(
				name: "Documents");

			migrationBuilder.DropTable(
				name: "GameUsers");

			migrationBuilder.DropTable(
				name: "Games");

			migrationBuilder.DropTable(
				name: "Users");
		}
	}
}
