using Microsoft.EntityFrameworkCore.Migrations;

namespace api_hrgis.Migrations
{
    public partial class AlterKeyofSurveySetting : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tr_survey_setting_tb_organization_org_code",
                table: "tr_survey_setting");

            migrationBuilder.DropPrimaryKey(
                name: "PK_tr_survey_setting",
                table: "tr_survey_setting");

            migrationBuilder.AlterColumn<string>(
                name: "org_code",
                table: "tr_survey_setting",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_tr_survey_setting",
                table: "tr_survey_setting",
                columns: new[] { "year", "org_code" });

            migrationBuilder.AddForeignKey(
                name: "FK_tr_survey_setting_tb_organization_org_code",
                table: "tr_survey_setting",
                column: "org_code",
                principalTable: "tb_organization",
                principalColumn: "org_code",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tr_survey_setting_tb_organization_org_code",
                table: "tr_survey_setting");

            migrationBuilder.DropPrimaryKey(
                name: "PK_tr_survey_setting",
                table: "tr_survey_setting");

            migrationBuilder.AlterColumn<string>(
                name: "org_code",
                table: "tr_survey_setting",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddPrimaryKey(
                name: "PK_tr_survey_setting",
                table: "tr_survey_setting",
                column: "year");

            migrationBuilder.AddForeignKey(
                name: "FK_tr_survey_setting_tb_organization_org_code",
                table: "tr_survey_setting",
                column: "org_code",
                principalTable: "tb_organization",
                principalColumn: "org_code",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
