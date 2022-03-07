using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace api_hrgis.Migrations
{
    public partial class AlterSurvey : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tr_survey_file");

            migrationBuilder.DropColumn(
                name: "department",
                table: "tr_survey_detail");

            migrationBuilder.DropColumn(
                name: "division",
                table: "tr_survey_detail");

            migrationBuilder.AlterColumn<string>(
                name: "course_no",
                table: "tr_survey_detail",
                type: "nvarchar(10)",
                nullable: false,
                comment: "เลขคอร์ส 6 หลัก",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldComment: "เลขคอร์ส 6 หลัก");

            migrationBuilder.AddColumn<DateTime>(
                name: "approved_at",
                table: "tr_survey_detail",
                type: "datetime",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "approved_by",
                table: "tr_survey_detail",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_tr_survey_detail_course_no",
                table: "tr_survey_detail",
                column: "course_no");

            migrationBuilder.AddForeignKey(
                name: "FK_tr_survey_detail_tr_course_master_course_no",
                table: "tr_survey_detail",
                column: "course_no",
                principalTable: "tr_course_master",
                principalColumn: "course_no",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tr_survey_detail_tr_course_master_course_no",
                table: "tr_survey_detail");

            migrationBuilder.DropIndex(
                name: "IX_tr_survey_detail_course_no",
                table: "tr_survey_detail");

            migrationBuilder.DropColumn(
                name: "approved_at",
                table: "tr_survey_detail");

            migrationBuilder.DropColumn(
                name: "approved_by",
                table: "tr_survey_detail");

            migrationBuilder.AlterColumn<string>(
                name: "course_no",
                table: "tr_survey_detail",
                type: "nvarchar(max)",
                nullable: false,
                comment: "เลขคอร์ส 6 หลัก",
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldComment: "เลขคอร์ส 6 หลัก");

            migrationBuilder.AddColumn<string>(
                name: "department",
                table: "tr_survey_detail",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "division",
                table: "tr_survey_detail",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "tr_survey_file",
                columns: table => new
                {
                    file_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    approved = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    created_by = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    file_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    level = table.Column<string>(type: "nvarchar(max)", nullable: false, comment: "Level"),
                    organization = table.Column<string>(type: "nvarchar(max)", nullable: false, comment: "เก็บ division หรือ department ที่ committee คนนั้นรับผิดชอบ"),
                    year = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tr_survey_file", x => x.file_id);
                },
                comment: "ตารางเก็บไฟล์ในการ survey");
        }
    }
}
