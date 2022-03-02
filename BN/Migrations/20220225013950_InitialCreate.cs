using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace api_hrgis.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tb_band",
                columns: table => new
                {
                    band = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    band_seq = table.Column<int>(type: "int", nullable: false),
                    status_active = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_band", x => x.band);
                });

            migrationBuilder.CreateTable(
                name: "tb_employee",
                columns: table => new
                {
                    emp_no = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    old_emp_no = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    title_name_en = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    firstname_en = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    lastname_en = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    title_name_th = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    firstname_th = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    lastname_th = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    sex_en = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    sex_th = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    center_code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    center_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    div_code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    div_abb = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    div_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    dept_code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    dept_abb = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    dept_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    wc_code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    wc_abb = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    wc_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    band = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    position_code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    position_name_en = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    position_name_th = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    entrance_date = table.Column<DateTime>(type: "date", nullable: true),
                    probation_date = table.Column<DateTime>(type: "date", nullable: true),
                    resign_date = table.Column<DateTime>(type: "date", nullable: true),
                    birthday = table.Column<DateTime>(type: "date", nullable: true),
                    id_card_no = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    rfid_no = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    email_active_date = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    email_active = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_employee", x => x.emp_no);
                });

            migrationBuilder.CreateTable(
                name: "tb_holiday",
                columns: table => new
                {
                    holiday = table.Column<DateTime>(type: "date", nullable: false),
                    mark = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_holiday", x => x.holiday);
                });

            migrationBuilder.CreateTable(
                name: "tb_menus",
                columns: table => new
                {
                    menu_code = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    menu_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    parent_menu_code = table.Column<int>(type: "int", nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    spare1 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    spare2 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    spare3 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    spare4 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    updated_by = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_menus", x => x.menu_code);
                    table.ForeignKey(
                        name: "FK_tb_menus_tb_menus_parent_menu_code",
                        column: x => x.parent_menu_code,
                        principalTable: "tb_menus",
                        principalColumn: "menu_code",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tb_organization",
                columns: table => new
                {
                    org_code = table.Column<string>(type: "nvarchar(450)", nullable: false, comment: "Center (1) > Division (2) > Department(3) > Work center(4)"),
                    level_seq = table.Column<int>(type: "int", nullable: false),
                    level_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    org_abb = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    org_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    parent_org_code = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_organization", x => x.org_code);
                    table.ForeignKey(
                        name: "FK_tb_organization_tb_organization_parent_org_code",
                        column: x => x.parent_org_code,
                        principalTable: "tb_organization",
                        principalColumn: "org_code",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tb_role",
                columns: table => new
                {
                    role_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    role_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    active = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    spare1 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    spare2 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    spare3 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    spare4 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    updated_by = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_role", x => x.role_id);
                });

            migrationBuilder.CreateTable(
                name: "tb_user",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    username = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    emailconfirmed = table.Column<bool>(type: "bit", nullable: true),
                    passwordhash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    storedsalt = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    phonenumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    phonenumberconfirmed = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_user", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tr_center",
                columns: table => new
                {
                    emp_no = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    created_by = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    updated_by = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tr_center", x => x.emp_no);
                },
                comment: "ตารางเก็บข้อมูลcenter");

            migrationBuilder.CreateTable(
                name: "tr_trainer",
                columns: table => new
                {
                    trainer_no = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    emp_no = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: true),
                    title_name_en = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    firstname_en = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    lastname_en = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    title_name_th = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    firstname_th = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    lastname_th = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    trainer_type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    organization = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status_active = table.Column<bool>(type: "bit", nullable: true),
                    remark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    created_by = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    updated_by = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tr_trainer", x => x.trainer_no);
                },
                comment: "ตารางเก็บข้อมูลเทรนเนอร์");

            migrationBuilder.CreateTable(
                name: "tr_course",
                columns: table => new
                {
                    course_no = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    course_name_th = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    course_name_en = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    org_code = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    days = table.Column<int>(type: "int", nullable: false),
                    capacity = table.Column<int>(type: "int", nullable: false),
                    open_register = table.Column<bool>(type: "bit", nullable: true),
                    date_start = table.Column<DateTime>(type: "date", nullable: false),
                    date_end = table.Column<DateTime>(type: "date", nullable: false),
                    time_in = table.Column<TimeSpan>(type: "time", nullable: false),
                    time_out = table.Column<TimeSpan>(type: "time", nullable: false),
                    place = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    created_by = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    updated_by = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    status_active = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tr_course", x => x.course_no);
                    table.ForeignKey(
                        name: "FK_tr_course_tb_organization_org_code",
                        column: x => x.org_code,
                        principalTable: "tb_organization",
                        principalColumn: "org_code",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tr_course_master",
                columns: table => new
                {
                    course_no = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    course_name_th = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    course_name_en = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    org_code = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    capacity = table.Column<int>(type: "int", nullable: false),
                    days = table.Column<int>(type: "int", nullable: false),
                    category = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    level = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    created_by = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    updated_by = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    status_active = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tr_course_master", x => x.course_no);
                    table.ForeignKey(
                        name: "FK_tr_course_master_tb_organization_org_code",
                        column: x => x.org_code,
                        principalTable: "tb_organization",
                        principalColumn: "org_code",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "ตารางเก็บข้อมูลคอร์ส 6 หลัก เพื่อช่วยในการเปิดคอร์ส");

            migrationBuilder.CreateTable(
                name: "tr_stakeholder",
                columns: table => new
                {
                    emp_no = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    role = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    org_code = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    remark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    created_by = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    updated_by = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tr_stakeholder", x => new { x.emp_no, x.org_code, x.role });
                    table.ForeignKey(
                        name: "FK_tr_stakeholder_tb_employee_emp_no",
                        column: x => x.emp_no,
                        principalTable: "tb_employee",
                        principalColumn: "emp_no",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tr_stakeholder_tb_organization_org_code",
                        column: x => x.org_code,
                        principalTable: "tb_organization",
                        principalColumn: "org_code",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "ตารางเก็บข้อมูลผู้ที่เกี่ยวข้อง");

            migrationBuilder.CreateTable(
                name: "tr_course_band",
                columns: table => new
                {
                    course_no = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    band = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tr_course_band", x => new { x.course_no, x.band });
                    table.ForeignKey(
                        name: "FK_tr_course_band_tb_band_band",
                        column: x => x.band,
                        principalTable: "tb_band",
                        principalColumn: "band",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tr_course_band_tr_course_course_no",
                        column: x => x.course_no,
                        principalTable: "tr_course",
                        principalColumn: "course_no",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tr_course_registration",
                columns: table => new
                {
                    course_no = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    emp_no = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    seq_no = table.Column<int>(type: "int", nullable: false),
                    last_status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    remark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    register_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    register_by = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    manager_approved_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    manager_approved_by = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    manager_approved_checked = table.Column<bool>(type: "bit", nullable: true),
                    center_approved_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    center_approved_by = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    center_approved_checked = table.Column<bool>(type: "bit", nullable: true),
                    pre_test_score = table.Column<int>(type: "int", nullable: true),
                    pre_test_grade = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    post_test_score = table.Column<int>(type: "int", nullable: true),
                    post_test_grade = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    scored_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    scored_by = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tr_course_registration", x => new { x.course_no, x.emp_no });
                    table.ForeignKey(
                        name: "FK_tr_course_registration_tb_employee_emp_no",
                        column: x => x.emp_no,
                        principalTable: "tb_employee",
                        principalColumn: "emp_no",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tr_course_registration_tr_course_course_no",
                        column: x => x.course_no,
                        principalTable: "tr_course",
                        principalColumn: "course_no",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tr_course_trainer",
                columns: table => new
                {
                    course_no = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    trainer_no = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tr_course_trainer", x => new { x.course_no, x.trainer_no });
                    table.ForeignKey(
                        name: "FK_tr_course_trainer_tr_course_course_no",
                        column: x => x.course_no,
                        principalTable: "tr_course",
                        principalColumn: "course_no",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tr_course_trainer_tr_trainer_trainer_no",
                        column: x => x.trainer_no,
                        principalTable: "tr_trainer",
                        principalColumn: "trainer_no",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tr_course_master_band",
                columns: table => new
                {
                    course_no = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    band = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tr_course_master_band", x => new { x.course_no, x.band });
                    table.ForeignKey(
                        name: "FK_tr_course_master_band_tb_band_band",
                        column: x => x.band,
                        principalTable: "tb_band",
                        principalColumn: "band",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tr_course_master_band_tr_course_master_course_no",
                        column: x => x.course_no,
                        principalTable: "tr_course_master",
                        principalColumn: "course_no",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "ตารางจับคู่คอร์สมาสเตอร์และแบนด์");

            migrationBuilder.CreateTable(
                name: "tr_course_master_previous",
                columns: table => new
                {
                    course_no = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    prev_course_no = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tr_course_master_previous", x => new { x.course_no, x.prev_course_no });
                    table.ForeignKey(
                        name: "FK_tr_course_master_previous_tr_course_master_course_no",
                        column: x => x.course_no,
                        principalTable: "tr_course_master",
                        principalColumn: "course_no",
                        onDelete: ReferentialAction.Restrict);
                },
                comment: "ตารางจับคู่คอร์สและคอร์สก่อนหน้า");

            migrationBuilder.CreateIndex(
                name: "IX_tb_menus_parent_menu_code",
                table: "tb_menus",
                column: "parent_menu_code");

            migrationBuilder.CreateIndex(
                name: "IX_tb_organization_parent_org_code",
                table: "tb_organization",
                column: "parent_org_code");

            migrationBuilder.CreateIndex(
                name: "IX_tr_course_org_code",
                table: "tr_course",
                column: "org_code");

            migrationBuilder.CreateIndex(
                name: "IX_tr_course_band_band",
                table: "tr_course_band",
                column: "band");

            migrationBuilder.CreateIndex(
                name: "IX_tr_course_master_org_code",
                table: "tr_course_master",
                column: "org_code");

            migrationBuilder.CreateIndex(
                name: "IX_tr_course_master_band_band",
                table: "tr_course_master_band",
                column: "band");

            migrationBuilder.CreateIndex(
                name: "IX_tr_course_registration_emp_no",
                table: "tr_course_registration",
                column: "emp_no");

            migrationBuilder.CreateIndex(
                name: "IX_tr_course_trainer_trainer_no",
                table: "tr_course_trainer",
                column: "trainer_no");

            migrationBuilder.CreateIndex(
                name: "IX_tr_stakeholder_org_code",
                table: "tr_stakeholder",
                column: "org_code");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tb_holiday");

            migrationBuilder.DropTable(
                name: "tb_menus");

            migrationBuilder.DropTable(
                name: "tb_role");

            migrationBuilder.DropTable(
                name: "tb_user");

            migrationBuilder.DropTable(
                name: "tr_center");

            migrationBuilder.DropTable(
                name: "tr_course_band");

            migrationBuilder.DropTable(
                name: "tr_course_master_band");

            migrationBuilder.DropTable(
                name: "tr_course_master_previous");

            migrationBuilder.DropTable(
                name: "tr_course_registration");

            migrationBuilder.DropTable(
                name: "tr_course_trainer");

            migrationBuilder.DropTable(
                name: "tr_stakeholder");

            migrationBuilder.DropTable(
                name: "tb_band");

            migrationBuilder.DropTable(
                name: "tr_course_master");

            migrationBuilder.DropTable(
                name: "tr_course");

            migrationBuilder.DropTable(
                name: "tr_trainer");

            migrationBuilder.DropTable(
                name: "tb_employee");

            migrationBuilder.DropTable(
                name: "tb_organization");
        }
    }
}
