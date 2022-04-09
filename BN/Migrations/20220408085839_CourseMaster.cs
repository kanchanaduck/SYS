using Microsoft.EntityFrameworkCore.Migrations;

namespace api_hrgis.Migrations
{
    public partial class CourseMaster : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tr_course_tb_organization_org_code",
                table: "tr_course");

            migrationBuilder.AlterColumn<string>(
                name: "org_code",
                table: "tr_course",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "open_register",
                table: "tr_course",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "course_name_th",
                table: "tr_course",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "master_course_no",
                table: "tr_course",
                type: "nvarchar(10)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_tr_course_master_course_no",
                table: "tr_course",
                column: "master_course_no");

            migrationBuilder.AddForeignKey(
                name: "FK_tr_course_tb_organization_org_code",
                table: "tr_course",
                column: "org_code",
                principalTable: "tb_organization",
                principalColumn: "org_code",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tr_course_tr_course_master_master_course_no",
                table: "tr_course",
                column: "master_course_no",
                principalTable: "tr_course_master",
                principalColumn: "course_no",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tr_course_tb_organization_org_code",
                table: "tr_course");

            migrationBuilder.DropForeignKey(
                name: "FK_tr_course_tr_course_master_master_course_no",
                table: "tr_course");

            migrationBuilder.DropIndex(
                name: "IX_tr_course_master_course_no",
                table: "tr_course");

            migrationBuilder.DropColumn(
                name: "master_course_no",
                table: "tr_course");

            migrationBuilder.AlterColumn<string>(
                name: "org_code",
                table: "tr_course",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<bool>(
                name: "open_register",
                table: "tr_course",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "course_name_th",
                table: "tr_course",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddForeignKey(
                name: "FK_tr_course_tb_organization_org_code",
                table: "tr_course",
                column: "org_code",
                principalTable: "tb_organization",
                principalColumn: "org_code",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
