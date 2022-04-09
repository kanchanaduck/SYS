using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using api_hrgis.Data;
using api_hrgis.Models;
using System.IO;
using OfficeOpenXml;
using System.Globalization;
using Microsoft.Extensions.Configuration;

namespace api_hrgis.Controllers
{    
	[Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CourseMastersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config; // using Microsoft.Extensions.Configuration;

        public CourseMastersController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // GET: api/CourseMasters
        [HttpGet]
        public async Task<ActionResult<IEnumerable<tr_course_master>>> get_course_master()
        {

            return await _context.tr_course_master
                        .Include(e => e.organization)
                        .OrderBy(e=>e.course_no)
                        .AsNoTracking()
                        .ToListAsync();
        }

        // GET: api/CourseMasters/{course_no}
        [HttpGet("{course_no}")]
        public async Task<ActionResult<tr_course_master>> search_from_course_no(string course_no)
        {
            var tr_course_master = await _context.tr_course_master
                                        .Include(e => e.master_courses_bands)
                                        .Include(e => e.master_courses_previous_courses)
                                        .Include(e => e.organization)
                                        .Where(e => e.course_no == course_no)
                                        .AsNoTracking()
                                        .FirstOrDefaultAsync();

            if (tr_course_master == null)
            {
                return NotFound("Course no. is not found");
            }

            return tr_course_master;
        }

        // GET: api/CourseMasters/Employee/{emp_no}
        [HttpGet("Employee/{emp_no}")]
        public async Task<ActionResult<IEnumerable<tr_course_master>>> search_from_emp_no(string emp_no)
        {
            var employee = await _context.tb_employee.FindAsync(emp_no);

            var tr_course_master = await _context.tr_course_master
                                        .Include(e => e.organization)
                                        .Where(e => e.org_code==employee.div_code || e.org_code==employee.dept_code)
                                        .AsNoTracking()
                                        .OrderBy(e=>e.course_no)
                                        .ToListAsync();

            if (tr_course_master == null)
            {
                return NotFound();
            }

            return tr_course_master;
        }

        // GET: api/CourseMasters/Org/{org_code}
        // GET: api/CourseMasters/Org/55
        // GET: api/CourseMasters/Org/5510
        [HttpGet("Org/{org_code}")]
        public async Task<ActionResult<IEnumerable<tr_course_master>>> search_from_org(string org_code)
        {
            var tr_course_master = await _context.tr_course_master
                                        .Include(e => e.master_courses_bands)
                                        .Include(e => e.organization)
                                        .Where(e => e.org_code == org_code)
                                        .OrderBy(e=>e.course_no)
                                        .AsNoTracking()
                                        .ToListAsync();

            if (tr_course_master == null)
            {
                return NotFound();
            }

            return tr_course_master;
        }
        [AllowAnonymous]
        // GET: api/CourseMasters/SearchCourse/{course_no}/{org_code}
        [HttpGet("SearchCourse/{course_no}/{org_code}")]
        public async Task<ActionResult<tr_course_master>> SearchCourse(string course_no, string org_code)
        {
            var tr_course_master = await _context.tr_course_master
                                    .Include(e => e.master_courses_bands)
                                    .Include(e => e.organization)
                                    .Where(e => e.course_no == course_no &&
                                    e.org_code == org_code)
                                    .AsNoTracking()
                                    .FirstOrDefaultAsync();

            if (tr_course_master == null)
            {
                return NotFound();
            }

            return tr_course_master;
        }

        // GET: api/CourseMasters/GetBand
        [HttpGet("GetBand")]
        public async Task<ActionResult<IEnumerable<tb_band>>> GetBand()
        {
            return await _context.tb_band.ToListAsync();
        }

        // GET: api/CourseMasters/Search/{course_no}
        [HttpGet("Search")]
        public async Task<ActionResult<tr_course_master>> Search(string course_no)
        {
            var tr_course_master = await _context.tr_course_master
                                        .Where(
                                        e => e.course_no == course_no
                                        ).FirstOrDefaultAsync();
            if (tr_course_master == null)
            {
                return NotFound();
            }
            return tr_course_master;
        }

        // PUT: api/CourseMasters/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{course_no}")]
        public async Task<IActionResult> edit_course_master(string course_no, tr_course_master tr_course_master)
        {
            Console.WriteLine("Edit course master");
            if(!user_is_commitee())
            {
                return StatusCode(403,"Permission denied, only committee can manage data");
            }

            if (course_no != tr_course_master.course_no)
            {
                var course_delete = await _context.tr_course_master
                            .Include(b => b.master_courses_bands)
                            .Include(b => b.master_courses_previous_courses)
                            .Where(b => b.course_no==course_no)
                            .FirstOrDefaultAsync();
                Console.WriteLine("Course delete: "+course_delete.course_no);
            
                if(course_delete == null)
                {
                    return StatusCode(400,"Course is not found");
                } 

                _context.tr_course_master.Remove(course_delete);
                _context.SaveChanges();

                await this.add_course_master(tr_course_master);

            }

            Console.WriteLine("COURSE NO TEMP: "+course_no);
            Console.WriteLine("COURSE NO: "+tr_course_master.course_no);

            var course = await _context.tr_course_master
                            .Include(b => b.master_courses_bands)
                            .Include(b => b.master_courses_previous_courses)
                            .Where(b => b.course_no==tr_course_master.course_no)
                            .FirstOrDefaultAsync();

            Console.WriteLine("Course new: "+course.course_no);
            
            if(course == null)
            {
                return StatusCode(400,"Course is not found");
            }

            Console.WriteLine("COURSE: "+course.course_no);

            course.course_no = tr_course_master.course_no;
            course.course_name_th = tr_course_master.course_name_th;
            course.course_name_en = tr_course_master.course_name_en;
            course.org_code = tr_course_master.org_code;
            course.capacity = tr_course_master.capacity;
            course.days = tr_course_master.days;
            course.category = tr_course_master.category;
            course.level = tr_course_master.level;
            course.master_courses_bands = tr_course_master.master_courses_bands;
            course.master_courses_previous_courses = tr_course_master.master_courses_previous_courses;
            course.updated_at = DateTime.Now;
            course.updated_by = User.FindFirst("emp_no").Value;
            _context.Entry(course).State = EntityState.Modified;
            await _context.SaveChangesAsync(); 

            return NoContent();
        }

        // POST: api/CourseMasters
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<tr_course_master>> add_course_master(tr_course_master tr_course_master)
        {
            if(!user_is_commitee())
            {
                return StatusCode(403,"Permission denied, only committee can manage data");
            }

            var course = await _context.tr_course_master
                                        .Include(e=>e.master_courses_bands)
                                        .Include(e=>e.master_courses_previous_courses)
                                        .Where(e => e.course_no == tr_course_master.course_no)
                                        .FirstOrDefaultAsync();
                                        
            if (course == null)
            {
                tr_course_master.created_at = DateTime.Now;
                tr_course_master.created_by = User.FindFirst("emp_no").Value;
                tr_course_master.updated_at = DateTime.Now;
                tr_course_master.updated_by = User.FindFirst("emp_no").Value;
                _context.tr_course_master.Add(tr_course_master);
                await _context.SaveChangesAsync();

                /* if(tr_course_master.master_courses_bands!=null){
                    Console.WriteLine("COUNT BAND"+tr_course_master.master_courses_bands.Count());
                    foreach(var i in tr_course_master.master_courses_bands){
                        Console.WriteLine(tr_course_master.course_no+": "+i.band);
                        course.master_courses_bands.Add(new tr_course_master_band {
                            course_no = tr_course_master.course_no,
                            band = i.band
                        });
                    } 
                    // await _context.SaveChangesAsync();                          
                } 

                if(tr_course_master.master_courses_previous_courses!=null){
                    foreach(var i in tr_course_master.master_courses_previous_courses.ToList()){
                        Console.WriteLine(tr_course_master.course_no+": "+i.prev_course_no);
                        course.master_courses_previous_courses.Add(new tr_course_master_previous {
                            course_no = tr_course_master.course_no,
                            prev_course_no = i.prev_course_no
                        });
                    } 
                    await _context.SaveChangesAsync();                          
                }  */

                return CreatedAtAction("Gettr_course_master", new { id = tr_course_master.course_no }, tr_course_master);
            }
            else
            {
                return Conflict("Cannot add duplicate course no.");
            }
        }
        // DELETE: api/CourseMasters/5
        [HttpDelete("{course_no}")]
        public async Task<IActionResult> delete_course_master(string course_no)
        {
            if(!user_is_commitee())
            {
                return StatusCode(403,"Permission denied, only committee can manage data");
            }

            var tr_course_master = await _context.tr_course_master
                                .Include(e=>e.master_courses_bands)
                                .Include(e=>e.master_courses_previous_courses)
                                .Where(e=>e.course_no==course_no)
                                .FirstOrDefaultAsync();
            if (tr_course_master == null)
            {
                return NotFound();
            }

            _context.tr_course_master.Remove(tr_course_master);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        private bool course_master_exists(string course_no)
        {            
			return _context.tr_course_master.Any(e => e.course_no == course_no);
        }
        private bool user_is_center()
        {
            string emp_no = User.FindFirst("emp_no").Value;
            return _context.tr_center.Any(e => e.emp_no == emp_no);
        }
        private bool user_is_commitee()
        {
            string emp_no = User.FindFirst("emp_no").Value;
            string div_code = User.FindFirst("div_code").Value;
            string dept_code = User.FindFirst("dept_code").Value;
            return _context.tr_stakeholder
                .Any(e => e.emp_no == emp_no && (
                        e.org_code == div_code ||
                        e.org_code == dept_code ) &&
                        e.role.ToUpper()=="COMMITTEE");
        }
        // GET: api/CourseMasters/Course_Assessment_File
        [AllowAnonymous]
        [HttpGet("Course_Assessment_File/{course_no}")]
        public async Task<ActionResult<IEnumerable<tr_trainer>>> trainer_history_excel(string course_no)
        {
            var course = await _context.tr_course
                                .Include(t => t.organization)
                                .Include(t => t.courses_trainers)
                                .AsNoTracking()
                                .Where(t => t.course_no==course_no)
                                .FirstOrDefaultAsync();

            if(course == null)
            {
                return NotFound("Course is not found");
            }

            var c = new List<int>();
            foreach (var item in course.courses_trainers)
            {
                c.Add(item.trainer_no);
            }
            var trainers = await (from trainer in _context.tr_trainer
                            join data in  _context.tb_employee on trainer.emp_no equals data.emp_no into z
                            from emp in z.DefaultIfEmpty()
                            select new { 
                                    trainer_no = trainer.trainer_no,
                                    emp_no = trainer.emp_no,
                                    title_name_en = trainer.title_name_en?? emp.title_name_en,
                                    firstname_en = trainer.firstname_en?? emp.firstname_en,
                                    lastname_en = trainer.lastname_en?? emp.lastname_en,
                                    div_abb = emp.div_abb,
                                    dept_abb = emp.dept_abb,
                                    trainer_type = trainer.trainer_type,
                            })
                            .Where(trainer=> c.Contains(trainer.trainer_no))
                            .ToListAsync();

            var trainer_arr = new List<string>();
            foreach (var item in trainers)
            {
                string dept =  "";
                if(item.dept_abb!=null) {
                   dept = "("+item.dept_abb+")";
                }
                Console.WriteLine(dept);
                trainer_arr.Add(item.firstname_en+" "+item.lastname_en.Substring(0,1)+"."+dept );
            }

            var registrant = await (
                from tb1 in _context.tr_course_registration
                join tb3 in _context.tr_course on tb1.course_no equals tb3.course_no
                join tb2 in _context.tb_employee on tb1.emp_no equals tb2.emp_no into tb
                from table in tb.DefaultIfEmpty()
                where tb1.course_no == course_no && (tb1.last_status == _config.GetValue<string>("Status:approved"))
                select new
                {
                    tb1.course_no,
                    tb3.course_name_en,
                    tb1.emp_no,
                    tb1.seq_no,
                    tb1.last_status,
                    tb1.remark,
                    tb1.manager_approved_checked,
                    tb1.final_approved_checked,
                    table.div_code,
                    table.div_abb,
                    table.dept_code,
                    table.dept_abb,
                    table.lastname_en,
                    table.firstname_en,
                    table.title_name_en,
                    table.band,
                    table.position_code,
                    table.position_name_en
                }).OrderBy(x => x.seq_no).ToListAsync();

            if(registrant == null)
            {
                return NotFound("Registrant is not found");
            }

            var time = DateTime.Now.ToString("yyyyMMddHHmmss");
            var fileName = $"Course_Assessment_{time}_{course_no}.xlsx";
            var filepath = $"wwwroot/excel/Course_Assessment/{fileName}";
            var originalFileName = $"Course_Assessment.xlsx";
            var originalFilePath = $"wwwroot/excel/Course_Assessment/{originalFileName}";

            Console.WriteLine(originalFilePath);
            Console.WriteLine(filepath);

            using(var package = new ExcelPackage(new FileInfo(originalFilePath)))
            {
                string trainer_joined = string.Join(",", trainer_arr);

                ExcelWorksheet worksheet = package.Workbook.Worksheets["ประเมินหลักสูตร"];
                worksheet.Cells["D6"].Value = course.course_no;
                worksheet.Cells["G6"].Value = course.course_name_th;
                worksheet.Cells["G7"].Value = course.course_name_en;
                worksheet.Cells["D8"].Value = ( course.date_start==null && course.date_end==null)? null:(course.date_start?.ToString("dd/MM/yy")+" - "+course.date_end?.ToString("dd/MM/yy")); 
                worksheet.Cells["G8"].Value = course.date_start?.ToString(@"hh\:mm")+" - "+course.date_end?.ToString(@"hh\:mm"); 
                worksheet.Cells["K8"].Value = course.place; 
                worksheet.Cells["D9"].Value = trainer_joined; 
                worksheet.Cells["K9"].Value = course.organization.org_abb;


                //
                    //ประเมิน Trainee รายคน
                //

                worksheet = package.Workbook.Worksheets["ประเมิน Trainee รายคน"];

                Console.WriteLine(registrant.Count());
                int page_size = 10; 
                int pages = (int) Math.Ceiling((decimal)(registrant.Count()/page_size));
                int data = 1;
                int page;


                for (page=0; page<=pages; page++)
                {
                    string worksheet_name_new = "_Page"+(page+1);
                    package.Workbook.Worksheets.Copy("ประเมิน Trainee รายคน", "ประเมิน Trainee รายคน"+worksheet_name_new);
                }

                page=1;
                int start_col=5;
                worksheet = package.Workbook.Worksheets["ประเมิน Trainee รายคน"];
                foreach (var item in registrant)
                {
                    if ((data-1) % page_size == 0)
                    {    
                        // Console.WriteLine("ขึ้นหน้าใหม่");  
                        worksheet.Cells["W1"].Value = "Page: "+(page-1);  
                        start_col = 5;    
                        worksheet = package.Workbook.Worksheets["ประเมิน Trainee รายคน_Page"+(page)];
                        page++;  
                        
                    }
                  
                    // Console.WriteLine(worksheet.Name+" "+data+" "+item.emp_no+" "+item.firstname_en+" "+item.lastname_en.Substring(0,1)+"."+" "+item.dept_abb+" "+start_col);
                    worksheet.Cells[14, start_col].Value = item.firstname_en+" "+item.lastname_en.Substring(0,1)+"."; 
                    worksheet.Cells[15, start_col].Value = item.emp_no;
                    worksheet.Cells[16, start_col].Value = item.dept_abb;
                    start_col = start_col+2;
                    data++;
                } 
                package.Workbook.Worksheets.Delete("ประเมิน Trainee รายคน");



                worksheet = package.Workbook.Worksheets["แบบประเมินผู้สอน"];
                worksheet.Cells["D6"].Value = course.course_no;
                worksheet.Cells["G6"].Value = course.course_name_th;
                worksheet.Cells["G7"].Value = course.course_name_en;
                worksheet.Cells["D8"].Value = course.date_start?.ToString("dd/MM/yy")+" - "+course.date_end?.ToString("dd/MM/yy");  
                worksheet.Cells["G8"].Value = course.date_start?.ToString(@"hh\:mm")+" - "+course.date_end?.ToString(@"hh\:mm"); 
                worksheet.Cells["J8"].Value = course.place; 
                worksheet.Cells["D9"].Value = trainer_joined; 
                worksheet.Cells["J9"].Value = course.organization.org_abb;
                
                worksheet = package.Workbook.Worksheets["Score of trainee"];
                string eng_course = "";
                if(course.course_name_en!=null){
                    eng_course = "("+course.course_name_en+")";
                }
                worksheet.Cells["D8"].Value = course.course_no;
                worksheet.Cells["G8"].Value = course.course_name_th+eng_course;
                worksheet.Cells["D9"].Value = course.date_start?.ToString("dd/MM/yy")+" - "+course.date_end?.ToString("dd/MM/yy"); 
                worksheet.Cells["G9"].Value = course.date_start?.ToString(@"hh\:mm")+" - "+course.date_end?.ToString(@"hh\:mm"); 
                worksheet.Cells["L9"].Value = course.place; 
                worksheet.Cells["D10"].Value = trainer_joined; 
                worksheet.Cells["L10"].Value = course.organization.org_abb;

                data = 1;

                for (page=0; page<=pages; page++)
                {
                    string worksheet_name_new = "_Page"+(page+1);
                    package.Workbook.Worksheets.Copy("Score of trainee", "Score of trainee"+worksheet_name_new);
                }

                page=1;
                int start_row=16;
                worksheet = package.Workbook.Worksheets["Score of trainee"];
                foreach (var item in registrant)
                {
                    if ((data-1) % page_size == 0)
                    {    
                        // Console.WriteLine("ขึ้นหน้าใหม่");
                        worksheet.Cells["N1"].Value = "Page: "+(page-1);  
                        start_row = 16;    
                        worksheet = package.Workbook.Worksheets["Score of trainee_Page"+(page)];
                        page++;  
                        
                    }
                    worksheet.Cells[start_row, 3].Value = item.emp_no; 
                    worksheet.Cells[start_row, 4].Value = item.firstname_en+" "+item.lastname_en;
                    worksheet.Cells[start_row, 6].Value = item.position_name_en;
                    worksheet.Cells[start_row, 7].Value = item.div_abb;
                    worksheet.Cells[start_row, 8].Value = item.dept_abb;
                    start_row++;  
                    data++;
                } 
                package.Workbook.Worksheets.Delete("Score of trainee");

                worksheet = package.Workbook.Worksheets["ประเมินหลักสูตร"];

                package.SaveAs(new FileInfo(filepath));
                package.Dispose();
            }  

            byte[] fileBytes = System.IO.File.ReadAllBytes(filepath);
            return File(fileBytes, "application/x-msdownload", fileName); 
        }

        [AllowAnonymous]
        [HttpGet("Mock")]
        public async Task<ActionResult<IEnumerable<tr_course_master>>> CourseMaster()
        {
            // var itemsToDelete = _context.Set<tr_course_master>();
            // _context.tr_course_master.RemoveRange(itemsToDelete);
            // _context.SaveChanges();

            string filePath = Path.Combine("./wwwroot/", $"Mockdata.xlsx");

            if(System.IO.File.Exists(filePath)){
                Console.WriteLine("File exists.");
                using(var package = new ExcelPackage(new FileInfo(filePath)))
                {
                    ExcelWorksheet worksheet = package.Workbook.Worksheets["tr_course_master"];
                    int rowCount = worksheet.Dimension.Rows;
                    int colCount = worksheet.Dimension.Columns;
                    for (int row = 2; row <= rowCount; row++){
                        Console.WriteLine("กาญจนา"+worksheet.Cells[row, 6].Value);
                        Console.WriteLine(worksheet.Cells[row, 6].Value==null? "Y":"N");
                        _context.Add(new tr_course_master
                        {
                            course_no = worksheet.Cells[row, 1].Value==null ? null:worksheet.Cells[row, 1].Value.ToString().Trim(),
                            course_name_th = worksheet.Cells[row, 2].Value==null ? null:worksheet.Cells[row, 2].Value.ToString().Trim(),
                            course_name_en = worksheet.Cells[row, 3].Value==null ? null:worksheet.Cells[row, 3].Value.ToString().Trim(),
                            org_code = worksheet.Cells[row, 4].Value==null ? null:worksheet.Cells[row, 4].Value.ToString().Trim(),
                            capacity = int.Parse(worksheet.Cells[row, 5].Value.ToString().Trim()),
                            days = int.Parse(worksheet.Cells[row, 6].Value.ToString().Trim()),
                            category = worksheet.Cells[row, 7].Value==null ? null:worksheet.Cells[row, 7].Value.ToString().Trim(),
                            level = worksheet.Cells[row, 8].Value==null ? null:worksheet.Cells[row, 8].Value.ToString().Trim(),
                            created_at = DateTime.Now,
                            created_by = "014496",
                            updated_at = DateTime.Now,
                            updated_by = "014496",
                        });
                        await _context.SaveChangesAsync();
                    }
               }

                Console.WriteLine("File exists.");
                using(var package = new ExcelPackage(new FileInfo(filePath)))
                {
                    ExcelWorksheet worksheet = package.Workbook.Worksheets["tr_course_master_band"];
                    int rowCount = worksheet.Dimension.Rows;
                    int colCount = worksheet.Dimension.Columns;
                    for (int row = 2; row <= rowCount; row++){
                        _context.Add(new tr_course_master_band
                        {
                            course_no = worksheet.Cells[row, 1].Value.ToString().Trim()==null ? null:worksheet.Cells[row, 1].Value.ToString().Trim(),
                            band = worksheet.Cells[row, 2].Value.ToString().Trim()==null ? null:worksheet.Cells[row, 2].Value.ToString().Trim(),
                        });
                        await _context.SaveChangesAsync();
                    }
                }

                Console.WriteLine("File exists.");
                using(var package = new ExcelPackage(new FileInfo(filePath)))
                {
                    ExcelWorksheet worksheet = package.Workbook.Worksheets["tr_course_master_previous"];
                    int rowCount = worksheet.Dimension.Rows;
                    int colCount = worksheet.Dimension.Columns;
                    for (int row = 2; row <= rowCount; row++){
                        _context.Add(new tr_course_master_previous
                        {
                            course_no = worksheet.Cells[row, 1].Value.ToString().Trim()==null ? null:worksheet.Cells[row, 1].Value.ToString().Trim(),
                            prev_course_no = worksheet.Cells[row, 2].Value.ToString().Trim()==null ? null:worksheet.Cells[row, 2].Value.ToString().Trim(),
                        });
                        await _context.SaveChangesAsync();
                    }
               }

            }

            return await _context.tr_course_master
                .Include(e=> e.master_courses_bands).ToListAsync();
        } 
    }
}