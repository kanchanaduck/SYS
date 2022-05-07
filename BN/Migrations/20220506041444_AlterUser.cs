using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace api_hrgis.Migrations
{
    public partial class AlterUser : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_tb_user",
                table: "tb_user");

            migrationBuilder.DropColumn(
                name: "id",
                table: "tb_user");

            migrationBuilder.AlterColumn<string>(
                name: "username",
                table: "tb_user",
                type: "nvarchar(8)",
                maxLength: 8,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldMaxLength: 450,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "tb_user",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "tb_user",
                type: "datetime",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "created_by",
                table: "tb_user",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "removed_at",
                table: "tb_user",
                type: "datetime",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "removed_by",
                table: "tb_user",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "reset_password_at",
                table: "tb_user",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "reset_password_by",
                table: "tb_user",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "tb_user",
                type: "datetime",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "updated_by",
                table: "tb_user",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_tb_user",
                table: "tb_user",
                column: "username");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_tb_user",
                table: "tb_user");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "tb_user");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "tb_user");

            migrationBuilder.DropColumn(
                name: "removed_at",
                table: "tb_user");

            migrationBuilder.DropColumn(
                name: "removed_by",
                table: "tb_user");

            migrationBuilder.DropColumn(
                name: "reset_password_at",
                table: "tb_user");

            migrationBuilder.DropColumn(
                name: "reset_password_by",
                table: "tb_user");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "tb_user");

            migrationBuilder.DropColumn(
                name: "updated_by",
                table: "tb_user");

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "tb_user",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "username",
                table: "tb_user",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(8)",
                oldMaxLength: 8);

            migrationBuilder.AddColumn<int>(
                name: "id",
                table: "tb_user",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddPrimaryKey(
                name: "PK_tb_user",
                table: "tb_user",
                column: "id");
        }
    }
}
