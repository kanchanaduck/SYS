using Microsoft.EntityFrameworkCore.Migrations;

namespace api_hrgis.Migrations
{
    public partial class DeleteCourseMasterInCourse : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tr_course_tr_course_master_master_course_no",
                table: "tr_course");

            migrationBuilder.DropIndex(
                name: "IX_tr_course_master_course_no",
                table: "tr_course");

            migrationBuilder.AlterColumn<string>(
                name: "master_course_no",
                table: "tr_course",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "master_course_no",
                table: "tr_course",
                type: "nvarchar(10)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_tr_course_master_course_no",
                table: "tr_course",
                column: "master_course_no");

            migrationBuilder.AddForeignKey(
                name: "FK_tr_course_tr_course_master_master_course_no",
                table: "tr_course",
                column: "master_course_no",
                principalTable: "tr_course_master",
                principalColumn: "course_no",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
