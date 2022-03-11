using Microsoft.EntityFrameworkCore.Migrations;

namespace api_hrgis.Migrations
{
    public partial class AlterSurvey2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tr_survey_detail_tr_course_master_course_no",
                table: "tr_survey_detail");

            migrationBuilder.DropIndex(
                name: "IX_tr_survey_detail_course_no",
                table: "tr_survey_detail");

            migrationBuilder.AlterColumn<string>(
                name: "year",
                table: "tr_survey_detail",
                type: "nvarchar(4)",
                maxLength: 4,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(4)",
                oldMaxLength: 4,
                oldNullable: true);

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
                name: "org_code",
                table: "tr_survey_detail",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "org_code",
                table: "tr_survey_detail");

            migrationBuilder.AlterColumn<string>(
                name: "year",
                table: "tr_survey_detail",
                type: "nvarchar(4)",
                maxLength: 4,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(4)",
                oldMaxLength: 4);

            migrationBuilder.AlterColumn<string>(
                name: "course_no",
                table: "tr_survey_detail",
                type: "nvarchar(10)",
                nullable: false,
                comment: "เลขคอร์ส 6 หลัก",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldComment: "เลขคอร์ส 6 หลัก");

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
    }
}
