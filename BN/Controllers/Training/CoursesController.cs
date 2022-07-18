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

        [HttpGet]
        public IActionResult get_courses()
        {
            var courses = _context.tr_course
                                .Include(e => e.courses_bands)
                                .Include(e => e.courses_trainers)
                                .Include(e => e.organization)
                                .AsNoTracking()
                                .Where(e=> 
                                    e.org_code==User.FindFirst("div_code").Value || 
                                    e.org_code==User.FindFirst("dept_code").Value)
                                .OrderBy(e => e.date_start)
                                .ToList();

            if (courses == null)
            {
                return NotFound("Course is not found");
            }
            
            
            foreach (var item in courses)
            {
                item.editable = ((DateTime.Now.Date - (item.date_end.HasValue ? item.date_end.Value: DateTime.Now.Date) ).Days 
                                -
                                (count_holidays((item.date_end.HasValue ? item.date_end.Value: DateTime.Now.Date), (DateTime.Now.Date)))
                                < 10
                                )? true:false; 
            }

            return Ok(courses);
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
                return NotFound("Course is not found");
            }

            return tr_course;
        }
        
        // GET: api/Courses/Open/StartNotOver5Days
        [HttpGet("Open/StartNotOver5Days")]
        public async Task<ActionResult<IEnumerable<tr_course>>> course_open_owner_5days()
        {
            string query = $@"SELECT [t].*
                            FROM [tr_course] AS [t]
                            WHERE DATEADD(day, CAST((-5-[dbo].count_holidays( CONVERT(date, GETDATE()),date_start)) AS int), 
                            CONVERT(date, [t].[date_start])) >= CONVERT(date, GETDATE())";

            var tr_course = await _context.tr_course
                                        .FromSqlRaw(query)
                        .Include(e => e.courses_bands)
                        .Include(e => e.courses_trainers)
                        .Include(e => e.courses_registrations)
                        .Include(e => e.organization)
                        .Where(e => e.open_register == true)
                        .AsNoTracking()
                        .ToListAsync();

            if (tr_course == null)
            {
                return NotFound("Course is not found");
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

        // GET: api/Courses/Owner/{org_code}/NotOver10WorkingDays
        [HttpGet("Owner/{org_code}/NotOver10WorkingDays")]
        public async Task<ActionResult<IEnumerable<tr_course>>> get_course_end_not_over_10_working_days(string org_code)
        {
            var tr_course = await _context.tr_course
                            .FromSqlRaw(
                                $@"SELECT [t].*
                                FROM [tr_course] AS [t]
                                INNER JOIN [tb_organization] AS [t0] ON [t].[org_code] = [t0].[org_code]
                                WHERE ([t].[org_code] = '{org_code}') 
                                AND DATEADD(day, CAST((10+[dbo].count_holidays(date_end, CONVERT(date, GETDATE()))) AS int), CONVERT(date, [t].[date_end])) >= CONVERT(date, GETDATE())")
                            .Where(e => e.org_code==org_code)
                            .Include(e=>e.organization)
                            .AsNoTracking()
                            .ToListAsync();

            if (tr_course == null)
            {
                return NotFound();
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
        [HttpGet("Trainers")]
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
            .FromSqlRaw(
                $@"SELECT [t].*
                FROM [tr_course] AS [t]
                WHERE DATEADD(day, CAST((10+[dbo].count_holidays(date_end, CONVERT(date, GETDATE()))) AS int), CONVERT(date, [t].[date_end])) < CONVERT(date, GETDATE())
                AND open_register=1")
            .ToListAsync();

            foreach (var item in course_close)
            {
                item.open_register = false;
                _context.Entry(item).State = EntityState.Modified;
            }

            await _context.SaveChangesAsync(); 
            return NoContent();
        }
        private double count_holidays(DateTime? date_start, DateTime? date_end){
            Console.WriteLine("START: "+date_start);
            Console.WriteLine("END: "+date_end);
            // return _context.tb_holiday.Where(n=> n.holiday >= date_start && n.holiday <= date_end 
            // && n.mark!=null).Count();
            return _context.tb_holiday.Count(n=> n.holiday >= date_start && n.holiday <= date_end 
            && n.mark!=null);
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
            
            var student_committee = await _context.tr_stakeholder
                            .Where( e=>e.role.ToUpper()=="COMMITTEE" && registrant_arr.Contains(e.org_code))
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
                student_committee = student_committee,
            });
        }
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
