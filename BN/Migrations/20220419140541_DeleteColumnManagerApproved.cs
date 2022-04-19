using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace api_hrgis.Migrations
{
    public partial class DeleteColumnManagerApproved : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "manager_approved_at",
                table: "tr_course_registration");

            migrationBuilder.DropColumn(
                name: "manager_approved_by",
                table: "tr_course_registration");

            migrationBuilder.DropColumn(
                name: "manager_approved_checked",
                table: "tr_course_registration");

            migrationBuilder.AlterColumn<string>(
                name: "master_course_no",
                table: "tr_course",
                type: "nvarchar(10)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_tr_course_tr_course_master_master_course_no",
                table: "tr_course",
                column: "master_course_no",
                principalTable: "tr_course_master",
                principalColumn: "course_no",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "manager_approved_at",
                table: "tr_course_registration",
                type: "datetime",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "manager_approved_by",
                table: "tr_course_registration",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "manager_approved_checked",
                table: "tr_course_registration",
                type: "bit",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "master_course_no",
                table: "tr_course",
                type: "nvarchar(10)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)");
        }
    }
}
