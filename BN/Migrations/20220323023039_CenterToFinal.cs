using Microsoft.EntityFrameworkCore.Migrations;

namespace api_hrgis.Migrations
{
    public partial class CenterToFinal : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "center_approved_checked",
                table: "tr_course_registration",
                newName: "final_approved_checked");

            migrationBuilder.RenameColumn(
                name: "center_approved_by",
                table: "tr_course_registration",
                newName: "final_approved_by");

            migrationBuilder.RenameColumn(
                name: "center_approved_at",
                table: "tr_course_registration",
                newName: "final_approved_at");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "final_approved_checked",
                table: "tr_course_registration",
                newName: "center_approved_checked");

            migrationBuilder.RenameColumn(
                name: "final_approved_by",
                table: "tr_course_registration",
                newName: "center_approved_by");

            migrationBuilder.RenameColumn(
                name: "final_approved_at",
                table: "tr_course_registration",
                newName: "center_approved_at");
        }
    }
}
