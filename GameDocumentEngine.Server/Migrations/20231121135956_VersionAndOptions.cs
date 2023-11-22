using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameDocumentEngine.Server.Migrations
{
	/// <inheritdoc />
	public partial class VersionAndOptions : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.AddColumn<string>(
				name: "Options",
				table: "Users",
				type: "text",
				nullable: false,
				defaultValue: "{}");

			migrationBuilder.AddColumn<string>(
				name: "NameOverride",
				table: "GameUsers",
				type: "text",
				nullable: true);

			migrationBuilder.AddColumn<string>(
				name: "Options",
				table: "GameUsers",
				type: "text",
				nullable: false,
				defaultValue: "{}");

			migrationBuilder.AddColumn<Guid>(
				name: "Version",
				table: "Games",
				type: "uuid",
				nullable: false,
				defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

			migrationBuilder.AddColumn<string>(
				name: "Options",
				table: "DocumentUsers",
				type: "text",
				nullable: false,
				defaultValue: "{}");

			migrationBuilder.AlterColumn<string>(
				name: "Details",
				table: "Documents",
				type: "text",
				nullable: false,
				defaultValue: "{}",
				oldClrType: typeof(string),
				oldType: "text");

			migrationBuilder.AddColumn<Guid>(
				name: "Version",
				table: "Documents",
				type: "uuid",
				nullable: false,
				defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropColumn(
				name: "Options",
				table: "Users");

			migrationBuilder.DropColumn(
				name: "NameOverride",
				table: "GameUsers");

			migrationBuilder.DropColumn(
				name: "Options",
				table: "GameUsers");

			migrationBuilder.DropColumn(
				name: "Version",
				table: "Games");

			migrationBuilder.DropColumn(
				name: "Options",
				table: "DocumentUsers");

			migrationBuilder.DropColumn(
				name: "Version",
				table: "Documents");

			migrationBuilder.AlterColumn<string>(
				name: "Details",
				table: "Documents",
				type: "text",
				nullable: false,
				oldClrType: typeof(string),
				oldType: "text",
				oldDefaultValue: "{}");
		}
	}
}
