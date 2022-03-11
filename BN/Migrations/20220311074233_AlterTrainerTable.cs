using Microsoft.EntityFrameworkCore.Migrations;

namespace api_hrgis.Migrations
{
    public partial class AlterTrainerTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "organization",
                table: "tr_trainer",
                newName: "company");

            migrationBuilder.AddColumn<string>(
                name: "org_code",
                table: "tr_trainer",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "trainer_text",
                table: "tr_course",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_tr_trainer_org_code",
                table: "tr_trainer",
                column: "org_code");

            migrationBuilder.AddForeignKey(
                name: "FK_tr_trainer_tb_organization_org_code",
                table: "tr_trainer",
                column: "org_code",
                principalTable: "tb_organization",
                principalColumn: "org_code",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tr_trainer_tb_organization_org_code",
                table: "tr_trainer");

            migrationBuilder.DropIndex(
                name: "IX_tr_trainer_org_code",
                table: "tr_trainer");

            migrationBuilder.DropColumn(
                name: "org_code",
                table: "tr_trainer");

            migrationBuilder.DropColumn(
                name: "trainer_text",
                table: "tr_course");

            migrationBuilder.RenameColumn(
                name: "company",
                table: "tr_trainer",
                newName: "organization");
        }
    }
}
