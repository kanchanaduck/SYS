using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;
using api_hrgis.Data;
using api_hrgis.Models;
using System.Net.Mail;
using OfficeOpenXml;
using System.IO;

namespace api_hrgis.Controllers
{
    [Authorize] // Microsoft.AspNetCore.Authorization; // [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class CoursesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config; // using Microsoft.Extensions.Configuration;

        public CoursesController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // GET: api/Courses
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<tr_course>>> get_courses(string open_register)
        {
            return await _context.tr_course
                        .Include(e => e.courses_bands)
                        .Include(e => e.courses_trainers)
                        .Include(e => e.organization)
                        .AsNoTracking()
                        .OrderBy(e=>e.date_start)
                        .ToListAsync();
        }

        // GET: api/Courses/5
        [HttpGet("{course_no}")]
        public async Task<ActionResult<tr_course>> get_course(string course_no)
        {
            var tr_course = await _context.tr_course
                        .Include(e => e.courses_bands)
                        .Include(e => e.courses_trainers)
                        .Include(e => e.courses_registrations)
                        .Include(e => e.organization)
                        .AsNoTracking()
                        .Where(e => e.course_no == course_no)
                        .FirstOrDefaultAsync();

            if (tr_course == null)
            {
                return NotFound("Course no. is not found");
            }

            return tr_course;
        }

        // GET: api/Courses/Open
        [HttpGet("Open")]
        public async Task<ActionResult<IEnumerable<tr_course>>> course_open()
        {
            var tr_course = await _context.tr_course
                        .Include(e => e.courses_bands)
                        .Include(e => e.courses_trainers)
                        .Include(e => e.courses_registrations)
                        .Include(e => e.organization)
                        .Where(e => e.open_register == true)
                        .AsNoTracking()
                        .ToListAsync();

            if (tr_course == null)
            {
                return NotFound("Have no data");
            }

            return tr_course;
        }

        // GET: api/Courses/Owner/1210
        [HttpGet("Owner/{org_code}")]
        public async Task<ActionResult<IEnumerable<tr_course>>> course_owner(string org_code)
        {
            var tr_course = await _context.tr_course
                        .Include(e => e.courses_bands)
                        .Include(e => e.courses_trainers)
                        .Include(e => e.courses_registrations)
                        .Include(e => e.organization)
                        .Where(e => e.org_code==org_code)
                        .AsNoTracking()
                        .ToListAsync();

            if (tr_course == null)
            {
                return NotFound("Course is not found");
            }

            return tr_course;
        }

        // GET: api/Courses/Owner/1210/Open
        [HttpGet("Owner/{org_code}/Open")]
        public async Task<ActionResult<IEnumerable<tr_course>>> course_open_owner(string org_code)
        {
            var tr_course = await _context.tr_course
                        .Include(e => e.courses_bands)
                        .Include(e => e.courses_trainers)
                        .Include(e => e.courses_registrations)
                        .Include(e => e.organization)
                        .Where(e => e.open_register == true && e.org_code==org_code)
                        .AsNoTracking()
                        .ToListAsync();

            if (tr_course == null)
            {
                return NotFound("Course is not found");
            }

            return tr_course;
        }
        // GET: api/Courses/SuggestionCourseNumber/CPT-001
        [HttpGet("SuggestionCourseNumber/{master_course_no}")]
        public async Task<ActionResult<IEnumerable<tr_course>>> Suggestion_Course_Number(string master_course_no)
        {
            var last_course = await _context.tr_course
                                    .OrderByDescending(p => p.course_no)
                                    .Where(p=>p.master_course_no==master_course_no)
                                    .FirstOrDefaultAsync();
        
            var result = last_course.course_no.Substring(last_course.course_no.LastIndexOf('-') + 1);
            return Ok(result);
        }

        // GET: api/Courses/Open/5
        [HttpGet("Open/{course_no}")]
        public async Task<ActionResult<tr_course>> Gettr_course_all(string course_no)
        {
            var tr_course = await _context.tr_course
                        .Include(e => e.courses_bands)
                        .Include(e => e.courses_trainers)
                        .Include(e => e.courses_registrations)
                        .Include(e => e.organization)
                        .Where(e => e.course_no == course_no
                        && e.open_register == true)
                        .AsNoTracking()
                        .FirstOrDefaultAsync();

            if (tr_course == null)
            {
                return NotFound("Course no. is not found");
            }

            return tr_course;
        }

        // GET: api/Courses/Trainers/5
        [HttpGet("Trainers/{course_no}")]
        public async Task<ActionResult<tr_course>> course_with_trainer(string course_no)
        {
            var tr_course = await _context.tr_course
                        .Include(e => e.courses_bands)
                        .Include(e => e.courses_trainers)
                        .Include(e => e.courses_registrations)
                        .Include(e => e.organization)
                        .Where(e => e.course_no == course_no)
                        .AsNoTracking()
                        .FirstOrDefaultAsync();

  
            if (tr_course == null)
            {
                return NotFound();
            }

            var trainers_arr = new List<int>();
            if(tr_course.courses_trainers.Count() > 0){
                foreach (var item in tr_course.courses_trainers)
                {
                   trainers_arr.Add(item.trainer_no); 
                }
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
                display_name = trainer.trainer_type=="External"? trainer.firstname_en+" "+trainer.lastname_en.Substring(0,1)+".":emp.firstname_en+" "+emp.lastname_en.Substring(0,1)+". ("+emp.dept_abb+")",
                div_abb = emp.div_abb,
                dept_abb = emp.dept_abb,
                company = trainer.company,
                trainer_owner_code = trainer.org_code,
                trainer_owner_abb = trainer.organization.org_abb,
                employed_status = emp.employed_status,
                trainer_type = trainer.trainer_type,
            })
            .Where(trainer=>trainers_arr.Contains(trainer.trainer_no))
            .ToListAsync();

            return Ok(new { courses=tr_course, trainers=trainers});
        }

        // GET: api/Courses/Wait-Approve/1210
        [HttpGet("Wait-Approve/{org_code}")]
        public async Task<ActionResult<IEnumerable<tr_course>>> GetCourseWaitingForApprove(string org_code)
        {

            var registrator = await _context.tr_course_registration
                            .Where(c=>c.last_status!="Approved")
                            .Select(c => c.course_no)
                            .Distinct()
                            .ToListAsync();

            var courses_arr = new List<string>();
            if(registrator.Count() > 0){
                foreach (var item in registrator)
                {
                   courses_arr.Add(item); 
                }
            }

            var tr_course = await _context.tr_course
                            .Include(e => e.courses_bands)
                            .Include(e => e.courses_trainers)
                            .Include(e => e.organization)
                            .Where(e=>courses_arr.Contains(e.course_no)
                            && e.org_code==org_code)
                            .ToListAsync();

            if (tr_course == null)
            {
                return NotFound();
            }

            return tr_course;
        }



        // GET: api/Courses/GetCourseRegister
        [HttpGet("GetCourseRegister")]
        public async Task<ActionResult<IEnumerable<tr_course>>> GetCourseRegister()
        {
            var tr_course = await _context.tr_course
                        .Include(e => e.courses_bands)
                        .Include(e => e.courses_trainers)
                        .Include(e => e.courses_registrations)
                        .Include(e => e.organization)
                        .Where(e => e.status_active == true).ToListAsync();

            if (tr_course == null)
            {
                return NotFound();
            }

            return tr_course;
        }

        // GET: api/Courses/GetCourseALL
        [HttpGet("GetCourseALL")]
        public async Task<ActionResult<IEnumerable<tr_course>>> GetCourseALL()
        {
            var tr_course = await (from tb1 in _context.tr_course
                                   join tb2 in _context.tb_organization on tb1.org_code equals tb2.org_code
                                   where tb1.status_active == true
                                   select new
                                   {
                                       tb1.course_no,
                                       tb1.course_name_en,
                                       tb1.course_name_th,
                                       tb1.org_code,
                                       tb2.org_abb
                                   }
                                        ).Distinct().ToListAsync();
            if (tr_course == null)
            {
                return NotFound();
            }

            return Ok(tr_course);

            // var tr_course = await _context.tr_course
            //             .Include(e => e.courses_bands)
            //             .Include(e => e.courses_trainers)
            //             .Include(e => e.courses_registrations)
            //             .Include(e => e.organization)
            //             .Where(e => e.status_active == true).ToListAsync();

            // if (tr_course == null)
            // {
            //     return NotFound();
            // }

            // return tr_course;
        }

        // GET: api/Courses/Owner/{org_code}/NotOver10WorkingDays
        [HttpGet("Owner/{org_code}/NotOver10WorkingDays")]
        public async Task<ActionResult<IEnumerable<tr_course>>> get_course_not_over_10_working_days(string org_code)
        {
            var tr_course = await _context.tr_course
                                .Where(e => e.org_code==org_code && e.date_end.Value.Date.AddDays(10) <= DateTime.Now.Date)
                                .Include(e=>e.organization)
                                .AsNoTracking()
                                .ToListAsync();

            if (tr_course == null)
            {
                return NotFound();
            }

            return tr_course;
        }

        // PUT: api/Course/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{course_no}")]
        public async Task<IActionResult> Puttr_course(string course_no, tr_course tr_course)
        {
            if(!user_is_commitee())
            {
                return StatusCode(403,"Permission denied, only committee can manage data");
            }

            Console.WriteLine("COURSE NO TEMP: "+course_no);
            Console.WriteLine("COURSE NO: "+tr_course.course_no);

            var course = await _context.tr_course
                            .Include(b => b.courses_bands)
                            .Include(b => b.courses_trainers)
                            .Where(b => b.course_no==tr_course.course_no)
                            .FirstOrDefaultAsync();

            Console.WriteLine("Course new: "+course.course_no);
            
            if(course == null)
            {
                return StatusCode(400,"Course is not found");
            }

            Console.WriteLine("COURSE: "+course.course_no);

            course.course_no = tr_course.course_no;
            course.course_name_th = tr_course.course_name_th;
            course.course_name_en = tr_course.course_name_en;
            course.org_code = tr_course.org_code;
            course.date_start = tr_course.date_start;
            course.date_end = tr_course.date_end;
            course.place = tr_course.place;
            course.capacity = tr_course.capacity;
            course.days = tr_course.days;
            course.open_register = tr_course.open_register;
            course.courses_bands = tr_course.courses_bands;
            course.courses_trainers = tr_course.courses_trainers;
            course.updated_at = DateTime.Now;
            course.updated_by = User.FindFirst("emp_no").Value;
            _context.Entry(course).State = EntityState.Modified;
            await _context.SaveChangesAsync(); 

            return NoContent();
        }

        // POST: api/Courses
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<tr_course>> create_course(tr_course tr_course)
        {
            if(!user_is_commitee())
            {
                return StatusCode(403,"Permission denied, only committee can manage data");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var course = await _context.tr_course
                                        .Include(e=>e.courses_bands)
                                        .Include(e=>e.courses_trainers)
                                        .Where(e => e.course_no == tr_course.course_no)
                                        .FirstOrDefaultAsync();
                                        
            if (course == null)
            {
                tr_course.created_at = DateTime.Now;
                tr_course.created_by = User.FindFirst("emp_no").Value;
                tr_course.updated_at = DateTime.Now;
                tr_course.updated_by = User.FindFirst("emp_no").Value;
                _context.tr_course.Add(tr_course);
                await _context.SaveChangesAsync();
                return CreatedAtAction("get_course", new { course_no = tr_course.course_no }, tr_course);
            }
            else
            {
                return Conflict("Cannot add duplicate course no.");
            }
        }

        // DELETE: api/Courses/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Deletetr_course(string id)
        {
            // ต้อง update [tr_course] status_active = false
            var tr_course = await _context.tr_course.Where(x => x.course_no == id).FirstOrDefaultAsync();

            if (tr_course == null)
            {
                return NotFound(_config.GetValue<string>("Text:not_found"));
            }

            _context.tr_course.Remove(tr_course);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [AllowAnonymous]
        // GET: api/Courses/Close
        [HttpGet("Close")]
        public async Task<ActionResult<tr_course>> course_close(){
            var course_close = await _context.tr_course
                                .Where(x => x.date_end.Value.Date.AddDays(10) <= DateTime.Now.Date).ToListAsync();

            foreach (var item in course_close)
            {
                item.open_register = false;
                _context.Entry(item).State = EntityState.Modified;
            }

            await _context.SaveChangesAsync(); 
            return NoContent();
        }
        [AllowAnonymous]
        // GET: api/Courses/ConfirmationSheet
        [HttpGet("ConfirmationSheet/{course_no}")]
        public async Task<ActionResult<IEnumerable<tr_course>>> ConfirmationSheet(string course_no){
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
                                    email = emp.email
                            })
                            .Where(trainer=> c.Contains(trainer.trainer_no))
                            .ToListAsync();

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
                    table.position_name_en,
                    table.email
                }).OrderBy(x => x.seq_no).ToListAsync();

            if(registrant == null)
            {
                return NotFound("Registrant is not found");
            }

            var registrant_arr = new List<string>();
            foreach (var item in registrant)
            {
                registrant_arr.Add(item.div_code);
                registrant_arr.Add(item.dept_code);
            }

            var approver = await _context.tr_stakeholder
                            .Where( e=>e.role.ToUpper()=="APPROVER" && registrant_arr.Contains(e.org_code))
                            .Include(e=>e.employee)
                            .ToListAsync();

            var course_committee = await _context.tr_stakeholder
                            .Where( e=>e.role.ToUpper()=="COMMITTEE" && course.org_code == e.org_code)
                            .Include(e=>e.employee)
                            .ToListAsync();

            return Ok(new
            {
                registrant = registrant,
                trainer = trainers,
                course_committee = course_committee,
            });
        }
        // GET: api/Courses/ConfirmationSheet
        /* [HttpGet("ConfirmationSheet/{course_no}")]
        public async Task<ActionResult<IEnumerable<tr_course>>> ConfirmationSheet(string course_no="AOF-001-001"){
            MailMessage mail = new MailMessage();
            SmtpClient SmtpServer = new SmtpClient("nonauth-smtp.global.canon.co.jp");
            mail.From = new MailAddress("<kanchana@mail.canon>");
            mail.Subject = "Hello ";

            string msg = "This E-mail have both Thai and English version \n";

            mail.Body = msg;
            SmtpServer.Port = 25;

            var course = await _context.tr_course.Where(e=>e.course_no==course_no)
                            .Include(e=>e.organization)
                            .FirstOrDefaultAsync();

            if(course==null){
                return NotFound("Course no. is not full");
            }

            var student = await _context.tr_course_registration
                            .Include(e=>e.employees)
                            .Where(e=>e.course_no==course_no && e.last_status=="Approved")
                            .ToListAsync();

            if(student==null){
                return NotFound("Student is not full");
            }

            var from = await _context.tr_stakeholder
                            .Where(e=>e.role=="COMMITTEE" && 
                                e.org_code==course.org_code && 
                                e.emp_no==User.FindFirst("emp_no").Value)
                            .FirstOrDefaultAsync();
            
            if(from==null){
                return StatusCode(403,"Permission denied, only committee can send confirmation email");
            }

            
            var fileName = $"Confirmation_Sheet_{course.course_no}.xlsx";
            var filepath = $"wwwroot/excel/Confirmation_Sheet/{fileName}";
            var originalFileName = $"Confirmation_Sheet.xlsx";
            var originalFilePath = $"wwwroot/excel/Confirmation_Sheet/{originalFileName}";

            using(var package = new ExcelPackage(new FileInfo(originalFilePath)))
            {
                ExcelWorksheet worksheet = package.Workbook.Worksheets["CONFIRMATION_SHEET"];

                worksheet.Cells["B3"].Value = course.course_no;
                worksheet.Cells["E3"].Value = course.course_name_th+" ("+course.course_name_en+")";
                worksheet.Cells["B4"].Value = course.date_start+"-"+course.date_end;
                worksheet.Cells["B3"].Value = course.date_start+"-"+course.date_end;
                worksheet.Cells["G4"].Value = course.place;
                worksheet.Cells["B5"].Value = course.trainer_text;
                worksheet.Cells["G5"].Value = course.organization.org_abb+" ("+course.org_code+")";

                int recordIndex = 9; 
                foreach (var i in student) 
                { 
                    worksheet.Cells[recordIndex, 1].Value = i.seq_no; 
                    worksheet.Cells[recordIndex, 2].Value = i.emp_no;
                    worksheet.Cells[recordIndex, 3].Value = i.employees.fullname_en;
                    worksheet.Cells[recordIndex, 4].Value = i.employees.fullname_th;
                    worksheet.Cells[recordIndex, 6].Value = i.employees.position_name_en; 
                    worksheet.Cells[recordIndex, 7].Value = i.employees.div_abb; 
                    worksheet.Cells[recordIndex, 8].Value = i.employees.dept_abb; 
                    recordIndex++; 
                }

                package.SaveAs(new FileInfo(filepath));
                package.Dispose();
            }  



            try	
            {	
                SmtpServer.Send(mail);	
                mail.Dispose();	
            }	
            catch (Exception ex)	
            {	
                string strError = ex.ToString();	

            }	

            return Ok();
        }
 */
        private bool tr_courseExists(string id)
        {
            return _context.tr_course.Any(e => e.course_no == id);
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

        /* private async Task UpdateTBChild(string id, tr_course tr_course)
        {
            List<tr_course_band> list1 = new List<tr_course_band>();
            var chk_cb = await _context.tr_course_band.Where(x => x.course_no == id).ToListAsync();
            if (tr_course.courses_bands.Count() > 0)
            {
                for (int i = 0; i < tr_course.courses_bands.Count() ; i++)
                {
                    string item = tr_course.band[i];
                    if (chk_cb.Where(x => x.course_no == id && x.band == item).FirstOrDefault() == null)
                    {
                        if (list1.Where(x => x.course_no == id && x.band == item).FirstOrDefault() == null)
                        {
                            tr_course_band tb_cb = new tr_course_band();
                            tb_cb.course_no = id;
                            tb_cb.band = item;
                            list1.Add(tb_cb);
                        }
                    }
                }
                var strtb = String.Join(",", tr_course.band);
                // Console.WriteLine("========= " + strtb);
                var ds = (from c in _context.tr_course_band where c.course_no == id && !tr_course.band.Contains(c.band) select c).ToList();
                _context.tr_course_band.RemoveRange(ds);
            }
            List<tr_course_trainer> list2 = new List<tr_course_trainer>();
            var chk_ct = await _context.tr_course_trainer.Where(x => x.course_no == id).ToListAsync();
            if (tr_course.trainer.Length > 0)
            {
                for (int j = 0; j < tr_course.trainer.Length; j++)
                {
                    int item = tr_course.trainer[j];
                    if (chk_ct.Where(x => x.course_no == id && x.trainer_no == item).FirstOrDefault() == null)
                    {
                        if (list2.Where(x => x.course_no == id && x.trainer_no == item).FirstOrDefault() == null)
                        {
                            tr_course_trainer tb_tn = new tr_course_trainer();
                            tb_tn.course_no = id;
                            tb_tn.trainer_no = item;
                            list2.Add(tb_tn);
                        }
                    }
                }
                var strtn = String.Join(",", tr_course.trainer);
                // Console.WriteLine("========= " + strtn);
                var tn = (from c in _context.tr_course_trainer where c.course_no == id && !tr_course.trainer.Contains(c.trainer_no) select c).ToList();
                _context.tr_course_trainer.RemoveRange(tn);
            }

            await _context.tr_course_band.AddRangeAsync(list1);
            await _context.tr_course_trainer.AddRangeAsync(list2);
            await _context.SaveChangesAsync();
        }
 */
        // GET: api/Course/GetGridView/{org_code}
        [HttpGet("GetGridView/{org_code}")]
        public async Task<ActionResult> GetGridView(string org_code)
        {
            var list = new List<tr_course>();
            // ถ้ามีการเลือก check box All ให้ส่ง All ไป เพื่อค้นหาข้อมูลของแผนกอื่นได้ แต่แก้ไขไม่ได้
            Console.WriteLine("======== org_code: " + org_code);
            if (org_code != _config.GetValue<string>("Text:all"))
            {
                list = await _context.tr_course.Where(x => x.status_active == true && x.org_code == org_code).ToListAsync();
            }
            else
            {
                list = await _context.tr_course.Where(x => x.status_active == true).ToListAsync();
            }
            // Console.WriteLine(list.Count());

           /*  List<datagrid> datagrid = new List<datagrid>();
            for (int i = 0; i < list.Count(); i++)
            {
                var query_ogr = _context.tb_organization.Where(x => x.org_code == list[i].org_code).FirstOrDefault();
                datagrid tb = new datagrid();
                tb.course_no = list[i].course_no;
                tb.course_name_th = list[i].course_name_th;
                tb.course_name_en = list[i].course_name_en;
                tb.org_code = query_ogr.org_code;
                tb.org_abb = query_ogr.org_abb;
                tb.days = list[i].days;
                tb.capacity = list[i].capacity;
                tb.open_register = list[i].open_register;
                tb.time_in = Convert.ToString(list[i].time_in);
                tb.time_out = Convert.ToString(list[i].time_out);
                tb.place = list[i].place;
                tb.date_start = list[i].date_start;
                tb.date_end = list[i].date_end;
                tb.band = await GetBand(list[i].course_no);
                tb.trainer = await GetTrainer(list[i].course_no);

                datagrid.Add(tb);
            } */

            // Console.WriteLine("=========: " + dept);
            // Console.WriteLine("=========: " + User.FindFirst("emp_no").Value);
            return Ok();
        }

        protected async Task<string[]> GetBand(string str)
        {
            var query = await _context.tr_course_band.Where(pt => pt.course_no == str)
            .Select(pt => new
            {
                course_no = pt.course_no,
                band = pt.band
            }).ToListAsync();

            string[] the_array = query.Select(i => i.band.ToString()).ToArray();

            return the_array;
        }
        protected async Task<string[]> GetTrainer(string str)
        {
            var query = await (
                from tb1 in _context.tr_course_trainer
                join tb2 in _context.tr_trainer on tb1.trainer_no equals tb2.trainer_no
                join tb3 in _context.tb_employee on tb2.emp_no equals tb3.emp_no into tb
                from table in tb.DefaultIfEmpty()
                where tb1.course_no == str
                select new
                {
                    fulls = (
                        tb2.trainer_type == _config.GetValue<string>("Text:internal") ?
                        table.title_name_en + table.firstname_en + " " + table.lastname_en.Substring(0, 1) + ". (" + table.dept_abb + ")"
                        : tb2.title_name_en + tb2.firstname_en + " " + tb2.lastname_en.Substring(0, 1) + "."
                    )
                }).ToListAsync();

            string[] the_array = query.Select(i => i.fulls.ToString()).ToArray();

            return the_array;
        }
    }
}

/* public class req_tr_course
{
    public string course_no { get; set; }
    public string course_name_th { get; set; }
    public string course_name_en { get; set; }
    public string org_code { get; set; }
    public int days { get; set; }
    public int capacity { get; set; }
    public bool open_register { get; set; }
    public string date_start { get; set; }
    public string date_end { get; set; }
    public string time_in { get; set; }
    public string time_out { get; set; }
    public string place { get; set; }
    public string[] band { get; set; }
    public int[] trainer { get; set; }
}

public class datagrid
{
    public string course_no { get; set; }
    public string course_name_th { get; set; }
    public string course_name_en { get; set; }
    public string org_code { get; set; }
    public string org_abb { get; set; }
    public int days { get; set; }
    public int capacity { get; set; }
    public bool? open_register { get; set; }
    public string time_in { get; set; }
    public string time_out { get; set; }
    public string place { get; set; }
    public DateTime date_start { get; set; }
    public DateTime date_end { get; set; }
    public string[] band { get; set; }
    public string[] trainer { get; set; }
} */