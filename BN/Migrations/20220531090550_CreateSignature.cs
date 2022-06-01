using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace api_hrgis.Migrations
{
    public partial class CreateSignature : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tr_setting");

            migrationBuilder.CreateTable(
                name: "tr_signature",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    position = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    updated_by = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tr_signature", x => x.id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tr_signature");

            migrationBuilder.CreateTable(
                name: "tr_setting",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    created_by = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    menu = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    property = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    updated_by = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tr_setting", x => x.id);
                },
                comment: "ตารางตั้งค่า");
        }
    }
}
