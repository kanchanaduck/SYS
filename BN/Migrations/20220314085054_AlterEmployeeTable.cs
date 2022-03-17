using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace api_hrgis.Migrations
{
    public partial class AlterEmployeeTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tb_employee_diff");

            migrationBuilder.DropTable(
                name: "tb_organization_diff");

            migrationBuilder.AddColumn<string>(
                name: "employed_status",
                table: "tb_employee_temp",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "employed_status",
                table: "tb_employee",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "employed_status",
                table: "tb_employee_temp");

            migrationBuilder.DropColumn(
                name: "employed_status",
                table: "tb_employee");

            migrationBuilder.CreateTable(
                name: "tb_employee_diff",
                columns: table => new
                {
                    emp_no = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    band = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    birthday = table.Column<DateTime>(type: "date", nullable: true),
                    center_code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    center_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    dept_abb = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    dept_code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    dept_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    div_abb = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    div_code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    div_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    email_active = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    email_active_date = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    entrance_date = table.Column<DateTime>(type: "date", nullable: true),
                    firstname_en = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    firstname_th = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    id_card_no = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    lastname_en = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    lastname_th = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    old_emp_no = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    position_code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    position_name_en = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    position_name_th = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    probation_date = table.Column<DateTime>(type: "date", nullable: true),
                    resign_date = table.Column<DateTime>(type: "date", nullable: true),
                    rfid_no = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    sex_en = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    sex_th = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    title_name_en = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    title_name_th = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    wc_abb = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    wc_code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    wc_name = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_employee_diff", x => x.emp_no);
                });

            migrationBuilder.CreateTable(
                name: "tb_organization_diff",
                columns: table => new
                {
                    org_code = table.Column<string>(type: "nvarchar(450)", nullable: false, comment: "Center (1) > Division (2) > Department(3) > Work center(4)"),
                    level_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    level_seq = table.Column<int>(type: "int", nullable: false),
                    org_abb = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    org_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    parent_org_code = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_organization_diff", x => x.org_code);
                });
        }
    }
}
