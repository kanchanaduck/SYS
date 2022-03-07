using Microsoft.EntityFrameworkCore.Migrations;

namespace api_hrgis.Migrations
{
    public partial class AlterSurvey2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                name: "emp_no",
                table: "tr_survey_detail",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "org_code",
                table: "tr_survey_detail",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_tr_survey_detail_emp_no",
                table: "tr_survey_detail",
                column: "emp_no");

            migrationBuilder.CreateIndex(
                name: "IX_tr_survey_detail_org_code",
                table: "tr_survey_detail",
                column: "org_code");

            migrationBuilder.AddForeignKey(
                name: "FK_tr_survey_detail_tb_employee_emp_no",
                table: "tr_survey_detail",
                column: "emp_no",
                principalTable: "tb_employee",
                principalColumn: "emp_no",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tr_survey_detail_tb_organization_org_code",
                table: "tr_survey_detail",
                column: "org_code",
                principalTable: "tb_organization",
                principalColumn: "org_code",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tr_survey_detail_tb_employee_emp_no",
                table: "tr_survey_detail");

            migrationBuilder.DropForeignKey(
                name: "FK_tr_survey_detail_tb_organization_org_code",
                table: "tr_survey_detail");

            migrationBuilder.DropIndex(
                name: "IX_tr_survey_detail_emp_no",
                table: "tr_survey_detail");

            migrationBuilder.DropIndex(
                name: "IX_tr_survey_detail_org_code",
                table: "tr_survey_detail");

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
                name: "emp_no",
                table: "tr_survey_detail",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
