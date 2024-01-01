using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameDocumentEngine.Server.Migrations
{
	/// <inheritdoc />
	public partial class OptionalGameUser : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropForeignKey(
				name: "FK_GameUsers_Users_UserId",
				table: "GameUsers");

			migrationBuilder.AlterColumn<Guid>(
				name: "UserId",
				table: "GameUsers",
				type: "uuid",
				nullable: true,
				oldClrType: typeof(Guid),
				oldType: "uuid");

			migrationBuilder.AddForeignKey(
				name: "FK_GameUsers_Users_UserId",
				table: "GameUsers",
				column: "UserId",
				principalTable: "Users",
				principalColumn: "Id");
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropForeignKey(
				name: "FK_GameUsers_Users_UserId",
				table: "GameUsers");

			migrationBuilder.AlterColumn<Guid>(
				name: "UserId",
				table: "GameUsers",
				type: "uuid",
				nullable: false,
				defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
				oldClrType: typeof(Guid),
				oldType: "uuid",
				oldNullable: true);

			migrationBuilder.AddForeignKey(
				name: "FK_GameUsers_Users_UserId",
				table: "GameUsers",
				column: "UserId",
				principalTable: "Users",
				principalColumn: "Id",
				onDelete: ReferentialAction.Cascade);
		}
	}
}
