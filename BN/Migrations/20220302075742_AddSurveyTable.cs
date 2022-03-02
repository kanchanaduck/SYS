using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace api_hrgis.Migrations
{
    public partial class AddSurveyTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tr_survey_detail",
                columns: table => new
                {
                    year = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: true),
                    division = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    department = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    emp_no = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    course_no = table.Column<string>(type: "nvarchar(max)", nullable: false, comment: "เลขคอร์ส 6 หลัก"),
                    month = table.Column<int>(type: "int", nullable: false, comment: "เก็บเดือนที่ต้องการเรียน"),
                    file_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    created_by = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    updated_by = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                },
                comment: "ตารางเก็บข้อมูลการ survey");

            migrationBuilder.CreateTable(
                name: "tr_survey_file",
                columns: table => new
                {
                    file_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    year = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: true),
                    file_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    approved = table.Column<bool>(type: "bit", nullable: false),
                    organization = table.Column<string>(type: "nvarchar(max)", nullable: false, comment: "เก็บ division หรือ department ที่ committee คนนั้นรับผิดชอบ"),
                    level = table.Column<string>(type: "nvarchar(max)", nullable: false, comment: "Level"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    created_by = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tr_survey_file", x => x.file_id);
                },
                comment: "ตารางเก็บไฟล์ในการ survey");

            migrationBuilder.CreateTable(
                name: "tr_survey_setting",
                columns: table => new
                {
                    year = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: false),
                    date_start = table.Column<DateTime>(type: "date", nullable: false),
                    date_end = table.Column<DateTime>(type: "date", nullable: false),
                    org_code = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    created_by = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    updated_by = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tr_survey_setting", x => x.year);
                    table.ForeignKey(
                        name: "FK_tr_survey_setting_tb_organization_org_code",
                        column: x => x.org_code,
                        principalTable: "tb_organization",
                        principalColumn: "org_code",
                        onDelete: ReferentialAction.Restrict);
                },
                comment: "ตารางเก็บ period การ survey เฉพาะคอร์สของ MTP");

            migrationBuilder.CreateIndex(
                name: "IX_tr_survey_setting_org_code",
                table: "tr_survey_setting",
                column: "org_code");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tr_survey_detail");

            migrationBuilder.DropTable(
                name: "tr_survey_file");

            migrationBuilder.DropTable(
                name: "tr_survey_setting");
        }
    }
}
