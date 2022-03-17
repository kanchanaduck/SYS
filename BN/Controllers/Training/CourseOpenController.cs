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

namespace api_hrgis.Controllers
{
    [Authorize] // Microsoft.AspNetCore.Authorization; // [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class CourseOpenController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config; // using Microsoft.Extensions.Configuration;

        public CourseOpenController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // GET: api/CourseOpen
        [HttpGet]
        public async Task<ActionResult<IEnumerable<tr_course>>> Gettr_course()
        {
            return await _context.tr_course
                        .Include(e => e.courses_bands)
                        .Include(e => e.courses_trainers)
                        .Include(e => e.courses_registrations)
                        .Include(e => e.organization)
                        .Where(e => e.status_active == true)
                        .ToListAsync();
        }

        // GET: api/CourseOpen/5
        [HttpGet("{course_no}")]
        public async Task<ActionResult<tr_course>> Gettr_course(string course_no)
        {
            var tr_course = await _context.tr_course
                        .Include(e => e.courses_bands)
                        .Include(e => e.courses_trainers)
                        .Include(e => e.courses_registrations)
                        .Include(e => e.organization)
                        .Where(e => e.course_no == course_no
                        && e.status_active == true).FirstOrDefaultAsync();

            if (tr_course == null)
            {
                return NotFound("Course no. is not found");
            }

            return tr_course;
        }

        // GET: api/CourseOpen/Open/5
        [HttpGet("Open/{course_no}")]
        public async Task<ActionResult<tr_course>> Gettr_course_all(string course_no)
        {
            var tr_course = await _context.tr_course
                        .Include(e => e.courses_bands)
                        .Include(e => e.courses_trainers)
                        .Include(e => e.courses_registrations)
                        .Include(e => e.organization)
                        .Where(e => e.course_no == course_no
                        && e.status_active == true).FirstOrDefaultAsync();

            if (tr_course == null)
            {
                return NotFound("Course no. is not found");
            }

            return tr_course;
        }

        // GET: api/CourseOpen/OpenALL/5
        [HttpGet("OpenALL/{course_no}")]
        public async Task<ActionResult<tr_course>> Gettr_course_openALL(string course_no)
        {
            var tr_course = await _context.tr_course
                        .Include(e => e.courses_bands)
                        .Include(e => e.courses_trainers)
                        .Include(e => e.courses_registrations)
                        .Include(e => e.organization)
                        .Where(e => e.course_no == course_no
                        && e.status_active == true).FirstOrDefaultAsync();

            if (tr_course == null)
            {
                return NotFound();
            }

            return tr_course;
        }

        // GET: api/CourseOpen/GetCourseOpenRegister
        [HttpGet("GetCourseOpenRegister")]
        public async Task<ActionResult<IEnumerable<tr_course>>> GetCourseOpenRegister()
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

        // GET: api/CourseOpen/GetCourseALL
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

        // GET: api/CourseOpen/GetCourseStatus
        [HttpGet("GetCourseStatus")]
        public async Task<ActionResult<IEnumerable<tr_course>>> GetCourseStatus()
        {
            var tr_course = await (from tb1 in _context.tr_course
                                   join tb2 in _context.tb_organization on tb1.org_code equals tb2.org_code
                                   join tb3 in _context.tr_course_registration on tb1.course_no equals tb3.course_no
                                   where tb1.status_active == true && tb3.last_status == _config.GetValue<string>("Status:approved")
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
        }

        // PUT: api/CourseOpen/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> Puttr_course(string id, req_tr_course tr_course)
        {
            // ต้อง update [tr_course], [tr_course_band], [tr_course_trainer]
            // Console.WriteLine(id);
            if (id != tr_course.course_no)
            {
                return BadRequest();
            }

            try
            {
                var chk_course = await _context.tr_course.Where(x => x.course_no == id && x.org_code == User.FindFirst("org_code").Value).FirstOrDefaultAsync();
                if (chk_course != null)
                {
                    chk_course.course_name_th = tr_course.course_name_th;
                    chk_course.course_name_en = tr_course.course_name_en;
                    chk_course.org_code = tr_course.org_code;
                    chk_course.days = tr_course.days;
                    chk_course.capacity = tr_course.capacity;
                    chk_course.open_register = tr_course.open_register;
                    chk_course.date_start = Convert.ToDateTime(tr_course.date_start);
                    chk_course.date_end = Convert.ToDateTime(tr_course.date_end);
                    chk_course.time_in = TimeSpan.Parse(tr_course.time_in);
                    chk_course.time_out = TimeSpan.Parse(tr_course.time_out);
                    chk_course.place = tr_course.place;
                    chk_course.updated_at = DateTime.Now;
                    chk_course.updated_by = User.FindFirst("emp_no").Value;
                    await _context.SaveChangesAsync();
                }

                await UpdateTBChild(id, tr_course);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!tr_courseExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/CourseOpen
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("Posttr_course")]
        public async Task<ActionResult> Posttr_course(req_tr_course tr_course)
        {
            try
            {
                List<tr_course_band> list1 = new List<tr_course_band>();
                List<tr_course_trainer> list2 = new List<tr_course_trainer>();
                var result = await _context.tr_course.Where(x => x.course_no == tr_course.course_no
                && x.org_code == User.FindFirst("org_code").Value).FirstOrDefaultAsync();
                if (result == null)
                {
                    tr_course tb = new tr_course();
                    tb.course_no = tr_course.course_no;
                    tb.course_name_th = tr_course.course_name_th;
                    tb.course_name_en = tr_course.course_name_en;
                    tb.org_code = tr_course.org_code;
                    tb.days = tr_course.days;
                    tb.capacity = tr_course.capacity;
                    tb.open_register = tr_course.open_register;
                    tb.date_start = Convert.ToDateTime(tr_course.date_start);
                    tb.date_end = Convert.ToDateTime(tr_course.date_end);
                    tb.time_in = TimeSpan.Parse(tr_course.time_in);
                    tb.time_out = TimeSpan.Parse(tr_course.time_out);
                    tb.place = tr_course.place;
                    tb.created_at = DateTime.Now;
                    tb.created_by = User.FindFirst("emp_no").Value;
                    tb.updated_at = DateTime.Now;
                    tb.updated_by = User.FindFirst("emp_no").Value;
                    tb.status_active = true;
                    _context.tr_course.Add(tb);

                    for (int i = 0; i < tr_course.band.Length; i++)
                    {
                        string item = tr_course.band[i];
                        tr_course_band tb1 = new tr_course_band();
                        tb1.course_no = tr_course.course_no;
                        tb1.band = item;
                        list1.Add(tb1);
                    }

                    for (int j = 0; j < tr_course.trainer.Length; j++)
                    {
                        int items = tr_course.trainer[j];
                        tr_course_trainer tb2 = new tr_course_trainer();
                        tb2.course_no = tr_course.course_no;
                        tb2.trainer_no = items;
                        list2.Add(tb2);
                    }
                }
                else
                {
                    var old = _context.tr_course.FirstOrDefault(x => x.course_no == tr_course.course_no
                    && x.org_code == User.FindFirst("org_code").Value && x.status_active == false);
                    if (old == null)
                    {
                        return Conflict(_config.GetValue<string>("Text:duplication"));
                    }
                    else
                    {
                        old.course_name_th = tr_course.course_name_th;
                        old.course_name_en = tr_course.course_name_en;
                        old.org_code = tr_course.org_code;
                        old.days = tr_course.days;
                        old.capacity = tr_course.capacity;
                        old.open_register = tr_course.open_register;
                        old.date_start = Convert.ToDateTime(tr_course.date_start);
                        old.date_end = Convert.ToDateTime(tr_course.date_end);
                        old.time_in = TimeSpan.Parse(tr_course.time_in);
                        old.time_out = TimeSpan.Parse(tr_course.time_out);
                        old.place = tr_course.place;
                        old.status_active = true;
                        old.updated_at = DateTime.Now;
                        old.updated_by = User.FindFirst("emp_no").Value;
                        await _context.SaveChangesAsync();

                        await UpdateTBChild(tr_course.course_no, tr_course);
                    }
                }

                await _context.tr_course_band.AddRangeAsync(list1);
                await _context.tr_course_trainer.AddRangeAsync(list2);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (tr_courseExists(tr_course.course_no))
                {
                    return Conflict(_config.GetValue<string>("Text:duplication"));
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("Gettr_course", new { id = tr_course.course_no }, tr_course);
        }

        // DELETE: api/CourseOpen/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Deletetr_course(string id)
        {
            // ต้อง update [tr_course] status_active = false
            var tr_course = await _context.tr_course.Where(x => x.course_no == id
                            && x.org_code == User.FindFirst("org_code").Value).FirstOrDefaultAsync();
            if (tr_course == null)
            {
                return NotFound(_config.GetValue<string>("Text:not_found"));
            }

            tr_course.status_active = false;
            tr_course.updated_at = DateTime.Now;
            tr_course.updated_by = User.FindFirst("emp_no").Value;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool tr_courseExists(string id)
        {
            return _context.tr_course.Any(e => e.course_no == id);
        }

        private async Task UpdateTBChild(string id, req_tr_course tr_course)
        {
            List<tr_course_band> list1 = new List<tr_course_band>();
            var chk_cb = await _context.tr_course_band.Where(x => x.course_no == id).ToListAsync();
            if (tr_course.band.Length > 0)
            {
                for (int i = 0; i < tr_course.band.Length; i++)
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

        // GET: api/CourseOpen/GetGridView/{org_code}
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

            List<datagrid> datagrid = new List<datagrid>();
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
            }

            // Console.WriteLine("=========: " + dept);
            // Console.WriteLine("=========: " + User.FindFirst("emp_no").Value);
            return Ok(datagrid);
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
                        table.title_name_en == null ? "" :
                        table.title_name_en == _config.GetValue<string>("Text:miss") ? table.title_name_en + table.firstname_en + " " + table.lastname_en.Substring(0, 1) + ". (" + table.dept_abb + ")"
                        : table.title_name_en + table.firstname_en + " " + table.lastname_en.Substring(0, 1) + ". (" + table.dept_abb + ")"
                        : tb2.title_name_en + tb2.firstname_en + " " + tb2.lastname_en.Substring(0, 1) + "."
                    )
                }).ToListAsync();

            string[] the_array = query.Select(i => i.fulls.ToString()).ToArray();

            return the_array;
        }
    }
}

public class req_tr_course
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
}