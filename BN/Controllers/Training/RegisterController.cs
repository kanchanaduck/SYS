using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api_hrgis.Data;
using api_hrgis.Models;
using System.Data;
using System.IO;
using System.Text;
using System.Reflection;
using System.ComponentModel;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using OfficeOpenXml.Table;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;

namespace api_hrgis.Controllers
{
    [Authorize] // Microsoft.AspNetCore.Authorization; // [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class RegisterController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config; // using Microsoft.Extensions.Configuration;

        public RegisterController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // GET: api/Register
        [HttpGet]
        public async Task<ActionResult<IEnumerable<tr_course_registration>>> Gettr_course_registration()
        {
            return await _context.tr_course_registration.ToListAsync();
        }
        // GET: api/Register/{course_no}
        [HttpGet("{course_no}")]
        public async Task<ActionResult<IEnumerable<tr_course_registration>>> get_registrant_approved(string course_no)
        {
            var course_score = await _context.tr_course_registration
                        .Include(e => e.employees)
                        .Where(e => e.course_no == course_no)
                        .OrderBy(x => x.emp_no)
                        .AsNoTracking()
                        .ToListAsync();

            if (course_score==null)
            {
                return NotFound();
            }

            return Ok(course_score);
        }

        // GET: api/Register/{course_no}/Approved
        [HttpGet("{course_no}/Approved")]
        public async Task<ActionResult<tr_course_registration>> Gettr_course_registration(string course_no)
        {
            var course_score = await _context.tr_course_registration
                        .Include(e => e.employees)
                        .Where(e => e.course_no == course_no && e.last_status == "Approved")
                        .OrderBy(x => x.emp_no)
                        .AsNoTracking()
                        .ToListAsync();

            if (course_score==null)
            {
                return NotFound();
            }

            return Ok(course_score);
        }

        // GET: api/Register/YouOther/{course_no}/{org_code}
        [HttpGet("YourOther/{course_no}/{org_code}")]
        public async Task<ActionResult> YourOther(string course_no, string org_code)
        {
            var query = await (
                from tb1 in _context.tr_course_registration
                join tb3 in _context.tr_course on tb1.course_no equals tb3.course_no
                join tb2 in _context.tb_employee on tb1.emp_no equals tb2.emp_no into tb
                from table in tb.DefaultIfEmpty()
                where tb1.course_no == course_no && (table.div_code==org_code || table.dept_code==org_code) 
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
                    table.position_name_en
                }).OrderBy(x => x.seq_no).ToListAsync();

            var query_other = await (
                from tb1 in _context.tr_course_registration
                join tb3 in _context.tr_course on tb1.course_no equals tb3.course_no
                join tb2 in _context.tb_employee on tb1.emp_no equals tb2.emp_no into tb
                from table in tb.DefaultIfEmpty()
                where tb1.course_no == course_no && !(table.div_code==org_code || table.dept_code==org_code) 
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
                    table.position_name_en
                }).OrderBy(x => x.seq_no).ToListAsync();

            return Ok(new
            {
                your = query,
                other = query_other
            });
        }
        [AllowAnonymous]
        // GET: api/Register/GetPrevCourse/{course_no}/{emp_no}
        [HttpGet("GetPrevCourse/{course_no}/{emp_no}")]
        public async Task<ActionResult> GetPrevCourse(string course_no, string emp_no)
        {
            return Ok(await GetPrevCourseNo(course_no, emp_no));
        }

        protected async Task<string> GetPrevCourseNo(string course_no, string emp_no)
        {
            string prev_c = ""; string result = "";

            if(!is_employee_exist(emp_no)){
                return result;
            }

            var course_master = await _context.tr_course
                    .Where(x => x.course_no == course_no)
                    .FirstOrDefaultAsync();

            Console.WriteLine("Master: "+course_master.master_course_no);

            var course = await _context.tr_course_master
                    .Where(x => x.course_no == course_master.master_course_no)
                    .Include(x => x.master_courses_previous_courses)
                    .FirstOrDefaultAsync();

            if (course != null)
            {
                
                Console.WriteLine("Count: "+course.master_courses_previous_courses.Count());
                if (course.master_courses_previous_courses.Count() > 0)
                {
                    int index = 0;
                    foreach (var i in course.master_courses_previous_courses)
                    {
                        if (course.master_courses_previous_courses.Count() == 1 || 
                                index==course.master_courses_previous_courses.Count()-1)
                        {
                            prev_c = prev_c + i.prev_course_no;
                        }
                        else
                        {
                            prev_c = prev_c + i.prev_course_no + ", ";
                        }
                        index++;
                    }
                    Console.WriteLine("Previous: "+prev_c);

                    var query2 = await _context.tr_course_registration.Where(x => x.course_no == course_no 
                    && x.emp_no == emp_no 
                    && x.last_status == _config.GetValue<string>("Status:approved")).FirstOrDefaultAsync();
                    if (query2 == null)
                    {
                        result = _config.GetValue<string>("Text:not_passed") + " " + prev_c;
                    }
                    
                    Console.WriteLine("Result: "+result);
                }
            }

            return result;
        }

        // PUT: api/Register/MgrApprove/5
        [HttpPut("MgrApprove/{course_no}")]
        public async Task<IActionResult> PutMgrApprove(string course_no, List<tr_course_registration> registrant)
        {
            var course = await _context.tr_course
                                    .Where(e => e.course_no==course_no)
                                    .FirstOrDefaultAsync();
            if(course==null){
                return NotFound("Course no. is not found");
            }

            try
            {
                List<tr_course_registration> list = new List<tr_course_registration>();
                int _seq_no = 0;
                for (var i = 0; i<registrant.Count(); i++)
                {
                    var item = registrant[i];
                    _seq_no = i + 1;

                    var edits = await _context.tr_course_registration
                                    .Where(x => x.course_no == course_no && x.emp_no == item.emp_no)
                                    .FirstOrDefaultAsync();
                    if (edits != null)
                    {
                        if (item.final_approved_checked == true)
                        {
                            edits.last_status = _config.GetValue<string>("Status:approved");
                            edits.final_approved_at = DateTime.Now;
                            edits.final_approved_by = User.FindFirst("emp_no").Value;
                            edits.final_approved_checked = item.final_approved_checked;
                        }
                        else
                        {
                            edits.last_status = null;
                            edits.final_approved_at = null;
                            edits.final_approved_by = null;
                            edits.final_approved_checked = item.final_approved_checked;;
                        }
                        list.Add(edits);
                    }
                }
                _context.tr_course_registration.UpdateRange(list);
                await _context.SaveChangesAsync();
                await Sorting(course_no);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!tr_course_registrationExists(course_no))
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
        private async Task Sorting(string course_no){
            var course = await _context.tr_course
                                    .Where(e => e.course_no==course_no)
                                    .FirstOrDefaultAsync();
            /////////// ทำการเรียงลำดับ เฉพาะสถานะ approved, เรียงลำดับตาม manager_approved_at
            List<tr_course_registration> list1 = new List<tr_course_registration>();
            var seq1 = await _context.tr_course_registration.Where(x => x.course_no == course_no
                            && x.final_approved_checked==true)
                            .OrderBy(x => x.final_approved_at).ToListAsync();
            int _seq1 = 0;
            for (var j = 0; j < seq1.Count(); j++)
            {
                var item1 = seq1[j];
                _seq1 = _seq1 + 1;
                // Console.WriteLine("SEQ1: "+_seq1+" "+item1.emp_no);

                var edits1 = await _context.tr_course_registration
                        .Where(x => x.course_no == course_no && x.emp_no == item1.emp_no)
                        .FirstOrDefaultAsync();
                edits1.seq_no = _seq1;
                edits1.last_status = _seq1>course.capacity? _config["Status:wait"]:_config["Status:approved"];
                list1.Add(edits1);
            }
            _context.tr_course_registration.UpdateRange(list1);
            await _context.SaveChangesAsync();
            /////////// ทำการเรียงลำดับ ที่ไม่ใช่สถานะ approved, เรียงลำดับตาม register_at
            List<tr_course_registration> list2 = new List<tr_course_registration>();
            var seq2 = await _context.tr_course_registration.Where(x => x.course_no == course_no
                            && x.final_approved_checked==false)
                            .OrderBy(x => x.register_at).ToListAsync();
            int _seq2 = _seq1;
            for (var k = 0; k < seq2.Count(); k++)
            {
                var item2 = seq2[k];
                _seq2 = _seq2 + 1;
                // Console.WriteLine("SEQ2: "+_seq2+" "+item2.emp_no);

                var edits2 = _context.tr_course_registration.Where(x => x.course_no == course_no && x.emp_no == item2.emp_no).FirstOrDefault();
                edits2.seq_no =  _seq2;
                edits2.last_status = _seq2>course.capacity? _config["Status:wait"]:(item2.final_approved_checked==true)? _config["Status:approved"]:null;
                list2.Add(edits2);
            }
            _context.tr_course_registration.UpdateRange(list2);
            await _context.SaveChangesAsync();
        }
        // PUT: api/Register/FinalApprove/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("FinalApprove/{course_no}")]
        public async Task<IActionResult> PutFinalApprove(string course_no, List<tr_course_registration> registrant)
        {
            var course = await _context.tr_course
                                    .Where(e => e.course_no==course_no)
                                    .FirstOrDefaultAsync();
            if(course==null){
                return NotFound("Course no. is not found");
            }

            try
            {   
                /////////// บันทึกข้อมูลเข้าไปก่อน แต่ยังไม่เรียงลำดับ
                List<tr_course_registration> list = new List<tr_course_registration>();
                int _seq_no = 0;
                for (var i = 0; i < registrant.Count(); i++)
                {
                    var item = registrant[i];
                    _seq_no = i + 1;

                    var edits = await _context.tr_course_registration.Where(x => x.course_no == course_no && x.emp_no == item.emp_no).FirstOrDefaultAsync();
                    if (edits != null)
                    {

                        if (item.final_approved_checked == true)
                        {
                            edits.last_status = _config.GetValue<string>("Status:approved");
                            edits.final_approved_at = DateTime.Now;
                            edits.final_approved_by = User.FindFirst("emp_no").Value;
                            edits.final_approved_checked = item.final_approved_checked;
                        }
                        else
                        {
                            edits.last_status = null;
                            edits.final_approved_at = null;
                            edits.final_approved_by = null;
                            edits.final_approved_checked = item.final_approved_checked;;
                        }

                        list.Add(edits);
                    }
                }
                _context.tr_course_registration.UpdateRange(list);
                await _context.SaveChangesAsync();

                await Sorting(course_no);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!tr_course_registrationExists(course_no))
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

        // POST: api/Register/ByCommitteeEmp
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("ByCommitteeEmp")]
        public async Task<ActionResult<tr_course_registration>> registration_by_committee_emp(tr_course_registration registrant)
        {
            if(!is_employee_exist(registrant.emp_no)){
                return StatusCode(400, "Please select exist staff");
            }

            if(!is_staff_of_committee(registrant.emp_no)){
                return StatusCode(400, "Please select staff in your own organization");
            }

            if(!is_in_band_of_course(registrant.course_no, registrant.emp_no)){
                return StatusCode(400, "This band is not allowed");
            }

            if(is_employee_resigned(registrant.emp_no)){
                return StatusCode(400, "Please select staff who not resigned");
            }

            int seq = 0;
            var query = await _context.tr_course_registration
                        .Where(x => x.course_no == registrant.course_no && x.emp_no == registrant.emp_no)
                        .FirstOrDefaultAsync();

            if (query != null)
            {
                return Conflict(_config["Text:duplication"]);
            }
            else
            {
                var last = await _context.tr_course_registration
                            .Where(x => x.course_no == registrant.course_no)
                            .OrderByDescending(x => x.seq_no)
                            .FirstOrDefaultAsync();

                if (last == null)
                {
                    seq = 1;
                }
                else
                {
                    seq = last.seq_no + 1;
                }

                tr_course_registration tb = new tr_course_registration();
                tb.course_no = registrant.course_no;
                tb.emp_no = registrant.emp_no;
                tb.seq_no = seq;
                tb.last_status = registrant.last_status;
                tb.remark = await GetPrevCourseNo(registrant.course_no, registrant.emp_no);
                tb.register_at = DateTime.Now;
                tb.register_by = User.FindFirst("emp_no").Value;

                _context.tr_course_registration.Add(tb);
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction("Gettr_course_registration", new { course_no = registrant.course_no }, registrant);
        }
        // POST: api/Register/ByApproverEmp
        [HttpPost("ByApproverEmp")]
        public async Task<ActionResult<tr_course_registration>> registration_by_approver_emp(tr_course_registration registrant)
        {
            if(!is_staff_of_approver(registrant.emp_no)){
                return StatusCode(400, "Please select staff in your own organization");
            }

            if(!is_in_band_of_course(registrant.course_no, registrant.emp_no)){
                return StatusCode(400, "This band is not allowed");
            }

            if(is_employee_resigned(registrant.emp_no)){
                return StatusCode(400, "Please select staff who not resigned");
            }


            var query = await _context.tr_course_registration
                        .Where(x => x.course_no == registrant.course_no && x.emp_no == registrant.emp_no)
                        .FirstOrDefaultAsync();

            if (query != null)
            {
                return Conflict(_config.GetValue<string>("Text:duplication"));
            }
            else
            {
                tr_course_registration tb = new tr_course_registration();
                tb.course_no = registrant.course_no;
                tb.emp_no = registrant.emp_no;
                tb.seq_no = 0;
                tb.last_status = "Approved";
                tb.remark = await GetPrevCourseNo(registrant.course_no, registrant.emp_no);
                tb.register_at = DateTime.Now;
                tb.register_by = User.FindFirst("emp_no").Value;
                tb.final_approved_at = DateTime.Now;
                tb.final_approved_by = User.FindFirst("emp_no").Value;
                tb.final_approved_checked = true;

                _context.tr_course_registration.Add(tb);
                await _context.SaveChangesAsync();
            }
            string course_no = registrant.course_no;            
            await Sorting(course_no);

            return CreatedAtAction("Gettr_course_registration", new { course_no = registrant.course_no }, registrant);
        }

        // POST: api/Register/ByCommitteeCourse
        [HttpPost("ByCommitteeCourse")]
        public async Task<ActionResult<tr_course_registration>> registration_by_committee_course(tr_course_registration registrant)
        {
             if(!is_employee_exist(registrant.emp_no)){
                return StatusCode(400, "Please select exist staff");
            }

            if(!is_course_of_committee(registrant.course_no)){
                return StatusCode(400, "Please select the course in your organization");
            }

            if(!is_in_band_of_course(registrant.course_no, registrant.emp_no)){
                return StatusCode(400, "This band is not allowed");
            }

            if(is_employee_resigned(registrant.emp_no)){
                return StatusCode(400, "Please select staff who not resigned");
            }

            int seq = 0;
            var query = await _context.tr_course_registration
                        .Where(x => x.course_no == registrant.course_no && x.emp_no == registrant.emp_no)
                        .FirstOrDefaultAsync();

            var course = await _context.tr_course.Where(c=>c.course_no == registrant.course_no).FirstOrDefaultAsync();

            if(course==null){
                return NotFound("Course no. is not found");
            }


            if (query != null)
            {
                return Conflict(_config["Text:duplication"]);
            }
            else
            {
                var last = await _context.tr_course_registration
                            .Where(x => x.course_no == registrant.course_no)
                            .OrderByDescending(x => x.seq_no)
                            .FirstOrDefaultAsync();

                if (last == null)
                {
                    seq = 1;
                }
                else
                {
                    seq = last.seq_no + 1;
                }
                
                if(seq>course.capacity){
                   return StatusCode(400, _config["Text:over_capacity"]);
                }

                tr_course_registration tb = new tr_course_registration();
                tb.course_no = registrant.course_no;
                tb.emp_no = registrant.emp_no;
                tb.seq_no = seq;
                tb.last_status = registrant.last_status;
                tb.pre_test_score = registrant.pre_test_score==null? null:Convert.ToInt32(registrant.pre_test_score);
                tb.pre_test_grade = registrant.pre_test_score==null? null:fnGrade(registrant.pre_test_score.ToString());
                tb.post_test_score = registrant.post_test_score==null? null:Convert.ToInt32(registrant.post_test_score);
                tb.post_test_grade = registrant.post_test_score==null? null:fnGrade(registrant.post_test_score.ToString());
                tb.remark = await GetPrevCourseNo(registrant.course_no, registrant.emp_no);
                tb.register_at = DateTime.Now;
                tb.register_by = User.FindFirst("emp_no").Value;
                tb.final_approved_at = DateTime.Now;
                tb.final_approved_by = User.FindFirst("emp_no").Value;
                tb.final_approved_checked = true;

                _context.tr_course_registration.Add(tb);
                await _context.SaveChangesAsync();
            }
            string course_no = registrant.course_no;
            await Sorting(course_no);

            return CreatedAtAction("Gettr_course_registration", new { course_no = registrant.course_no }, registrant);
        }
        // PUT: api/Register/ByCommitteeCourse/{course_no}/{emp_no}
        [HttpPut("ByCommitteeCourse/{course_no}/{emp_no}")]
        public async Task<IActionResult> Puttr_course_registration(string course_no, string emp_no, tr_course_registration r)
        {
            var registrant = await _context.tr_course_registration
                            .Where(e=>e.emp_no==emp_no && e.course_no==course_no)
                            .FirstOrDefaultAsync();

            if(registrant==null){
                return NotFound("Not found the trainee");
            }

            registrant.pre_test_score = registrant.pre_test_score==null? null:Convert.ToInt32(registrant.pre_test_score);
            registrant.pre_test_grade = registrant.pre_test_score==null? null:fnGrade(registrant.pre_test_score.ToString());
            registrant.post_test_score = registrant.post_test_score==null? null:Convert.ToInt32(registrant.post_test_score);
            registrant.post_test_grade = registrant.post_test_score==null? null:fnGrade(registrant.post_test_score.ToString());
            registrant.scored_at = DateTime.Now;
            registrant.scored_by = User.FindFirst("emp_no").Value;

            _context.Entry(registrant).State = EntityState.Modified;
            await _context.SaveChangesAsync(); 

            return NoContent();
        }
        // POST: api/Registation/Continuous
        [HttpPost("Continuous")]
        public async Task<ActionResult<tr_course_registration>> PostContinuous(List<tr_course_registration> registration)
        {
            string course_no =  registration[0].course_no;
            var course = await _context.tr_course.Where(e=>e.course_no==course_no)
                                .Include(e=>e.courses_bands)
                                .FirstOrDefaultAsync();

            if(course==null){
                return StatusCode(400,"Course is not found");
            }

            List<string> course_bands = new List<string>();

            foreach (var item in course.courses_bands)
            {
                course_bands.Add(item.band);
            }

            var committee = await _context.tr_stakeholder
                            .Where(e=>e.role=="COMMITTEE" && e.emp_no == User.FindFirst("emp_no").Value)
                            .FirstOrDefaultAsync();

            if(committee==null){
                return StatusCode(403,"Permission denied, only committee can use this function");
            }

            int _seq_no = 0;
            List<response_course_registration> response = new List<response_course_registration>();
            foreach (var item in registration)
            {
                var query_seq = await _context.tr_course_registration.Where(x => x.course_no == registration[0].course_no)
                .OrderByDescending(x => x.seq_no).FirstOrDefaultAsync();

                if (query_seq == null)
                {
                    _seq_no = 1;
                }
                else
                {
                    _seq_no = query_seq.seq_no + 1;
                }
                string _emp_no = item.emp_no;
                int ws_seq_no = 0;

                var _last_status = item.seq_no > course.capacity ? _config["Status:wait"] : null; // Check
                var query = await _context.tr_course_registration
                            .Where(x => x.course_no == course_no && x.emp_no == _emp_no)
                            .FirstOrDefaultAsync();

                var emp = await _context.tb_employee.Where(x => x.emp_no == _emp_no).FirstOrDefaultAsync();
                if(emp==null){
                    response.Add(new response_course_registration
                    {
                        emp_no = _emp_no,
                        seq_no = ws_seq_no,
                        error_message = _config["Text:staff_not_exist"]
                    });
                } 
                else{
                    if(emp.employed_status=="RESIGNED"){
                        // Invalid department. : dept ของพนักงานใน row ไม่ตรงกับที่ dept login
                        response.Add(new response_course_registration
                        {
                            emp_no = _emp_no,
                            seq_no = ws_seq_no,
                            error_message = _config["Text:staff_resigned"]
                        });
                    }
                    else{
                        if(!course_bands.Contains(emp.band)){
                            response.Add(new response_course_registration
                            {
                                emp_no = _emp_no,
                                seq_no = ws_seq_no,
                                error_message = _config.GetValue<string>("Text:unequal_band")
                            });
                        }
                        else{
                            if (query == null){
                                _context.Add(new tr_course_registration
                                {
                                    seq_no = _seq_no,
                                    course_no = item.course_no,
                                    emp_no = item.emp_no,
                                    pre_test_score = item.pre_test_score==null? null:Convert.ToInt32(item.pre_test_score),
                                    pre_test_grade = item.pre_test_score==null? null:fnGrade(item.pre_test_score.ToString()),
                                    post_test_score = item.post_test_score==null? null:Convert.ToInt32(item.post_test_score),
                                    post_test_grade = item.post_test_score==null? null:fnGrade(item.post_test_score.ToString()),
                                    remark = (_config["Text:continuous"])+( await GetPrevCourseNo(item.course_no, item.emp_no)==""? null:"; "+await GetPrevCourseNo(item.course_no, item.emp_no)),
                                    last_status = _config.GetValue<string>("Status:approved"),
                                    register_at = DateTime.Now,
                                    register_by = User.FindFirst("emp_no").Value,
                                    final_approved_at = DateTime.Now,
                                    final_approved_by = User.FindFirst("emp_no").Value,
                                    final_approved_checked = true,
                                    scored_at = DateTime.Now,
                                    scored_by = User.FindFirst("emp_no").Value
                                });
                                await _context.SaveChangesAsync();
                            }
                            else{
                                // Duplication Data. : emp_no ของพนักงานใน row มีข้อมูลใน course อยู่แล้ว
                                response.Add(new response_course_registration
                                {
                                    emp_no = _emp_no,
                                    seq_no = ws_seq_no,
                                    error_message = _config.GetValue<string>("Text:duplication")
                                });
                            }
                        }
                    }
                }           
            }

            // await Sorting(course_no);
            return Ok(response);
        }
        // GET: api/Register/GetEmailInformApprover/{course_no}/{org_code}
        [HttpGet("GetEmailInformApprover/{course_no}/{org_code}")]
        public async Task<ActionResult<IEnumerable<tr_stakeholder>>> get_email_inform_approver(
            string course_no, string org_code){
                
            var approver = await _context.tr_stakeholder.Where(e=>e.role=="Approver" && e.org_code==org_code)
                    .Include(e=>e.employee)
                    .ToListAsync();

            Console.WriteLine(approver==null);

            if(approver==null || approver.Count()<=0){
                return NotFound("Not found approver, please inform center to set your approver");
            }
            return approver;
        }

        private bool is_course_of_committee(string course_no)
        {
            var emp_no = User.FindFirst("emp_no").Value;

            var committee = _context.tr_stakeholder
                                    .Include(e => e.organization)
                                    .AsNoTracking()
                                    .Where(e => e.emp_no == emp_no && e.role.ToUpper() == "COMMITTEE") 
                                    .FirstOrDefault();

            if(committee==null){
                return false;
            }

            var course = _context.tr_course.Where(e => e.course_no == course_no).FirstOrDefault();

            if(course.org_code==committee.org_code){
                return true;
            }
            else{
                return false;
            }

        }
        private bool is_staff_of_approver(string emp_no)
        {
            var approver_emp_no = User.FindFirst("emp_no").Value;
            var employee = _context.tb_employee.Where(e=>e.emp_no==emp_no).FirstOrDefault();
            var approver = _context.tr_stakeholder
                            .Where(e=>e.emp_no==approver_emp_no && e.role.ToUpper()=="APPROVER")
                            .FirstOrDefault();
            bool is_staff_of_approver = false;
            if(employee.dept_code==approver.org_code || employee.div_code==approver.org_code){
                is_staff_of_approver = true;
            }
            return is_staff_of_approver;
        }
        private bool is_employee_exist(string emp_no)
        {
            return _context.tb_employee.Any(e=>e.emp_no==emp_no);
        }
        private bool is_employee_resigned(string emp_no)
        {
            return _context.tb_employee.Any(e=>e.emp_no==emp_no && e.employed_status=="RESIGNED");
        }
        private bool is_in_band_of_course(string course_no, string emp_no)
        {
            var employee = _context.tb_employee.Where(e=>e.emp_no==emp_no).FirstOrDefault();

            var course = _context.tr_course.Where(e=>e.course_no==course_no)
                            .Include(e=>e.courses_bands).FirstOrDefault();

            bool match = false;
            foreach (var item in course.courses_bands)
            {
                if(employee.band==item.band){
                    match = true;
                    break;
                }
            }
            return match;
        }
        private bool is_staff_of_committee(string emp_no)
        {
            var committee_emp_no = User.FindFirst("emp_no").Value;
            var employee = _context.tb_employee.Where(e=>e.emp_no==emp_no).FirstOrDefault();
            var committee = _context.tr_stakeholder
                            .Where(e=>e.emp_no==committee_emp_no && e.role.ToUpper()=="COMMITTEE")
                            .FirstOrDefault();
            bool is_staff_of_committee = false;
            if(employee.dept_code==committee.org_code || employee.div_code==committee.org_code){
                is_staff_of_committee = true;
            }
            return is_staff_of_committee;
        }
        // DELETE: api/Register/{course_no}/{emp_no}
        [HttpDelete("{course_no}/{emp_no}")]
        public async Task<IActionResult> delete_registration(string course_no, string emp_no)
        {
            var tr_course_registration = await _context.tr_course_registration
                        .Where(x => x.course_no == course_no && x.emp_no == emp_no)
                        .FirstOrDefaultAsync();
            if (tr_course_registration == null)
            {
                return NotFound();
            }

            _context.tr_course_registration.Remove(tr_course_registration);
            await _context.SaveChangesAsync();

            await Sorting(course_no);

            return NoContent();
        }

        private bool tr_course_registrationExists(string course_no)
        {
            return _context.tr_course_registration.Any(e => e.course_no == course_no);
        }

        // POST: api/Register/UploadCourseRegister/ByCommitteeEmp/{course_no}
        [HttpPost("UploadCourseRegister/ByCommitteeEmp/{course_no}")]
        public async Task<ActionResult<IEnumerable<tr_course_registration>>> upload_register_by_committee_emp(
            string course_no, [FromForm] req_fileform model)
        {
            string rootFolder = Directory.GetCurrentDirectory();
            string pathString = @"\API site\files\file-hrgis\upload\";
            string serverPath = rootFolder.Substring(0, rootFolder.LastIndexOf(@"\")) + pathString;
            // Create Directory
            if (!Directory.Exists(serverPath))
            {
                Directory.CreateDirectory(serverPath);
            }

            // string fullpath = serverPath + model.file_name;
            string filePath = Path.Combine(serverPath + model.file_name);
            using (Stream stream = new FileStream(filePath, FileMode.Create))
            {
                model.file_form.CopyTo(stream);
                stream.Dispose();
                stream.Close();
            }

            var course = await _context.tr_course.Where(e=>e.course_no==course_no)
                                .Include(e=>e.courses_bands)
                                .FirstOrDefaultAsync();

            if(course==null){
                return StatusCode(400,"Course is not found");
            }

            List<string> course_bands = new List<string>();

            foreach (var item in course.courses_bands)
            {
                course_bands.Add(item.band);
            }

            var committee = await _context.tr_stakeholder
                            .Where(e=>e.role=="COMMITTEE" && e.emp_no == User.FindFirst("emp_no").Value)
                            .FirstOrDefaultAsync();

            if(committee==null){
                return StatusCode(403,"Permission denied, only committee can use this function");
            }

            List<response_course_registration> response = new List<response_course_registration>();
            if (System.IO.File.Exists(filePath))
            {
                // Console.WriteLine("File exists.");
                using (var package = new ExcelPackage(new FileInfo(filePath)))
                {
                    ExcelWorksheet worksheet = package.Workbook.Worksheets["Sheet1"];
                    int rowCount = worksheet.Dimension.Rows;
                    int colCount = worksheet.Dimension.Columns;
                    // Console.WriteLine("rowCount: " + rowCount);

                    for (int row = 4; row <= rowCount; row++)
                    {
                        if (!String.IsNullOrEmpty(worksheet.Cells[row, 2].Value.ToString().Trim())) // ถ้ามี error ให้ตรวจ rowCount กับ แถวสุดท้าย ตรงกันไหม : จะเป็น error ของค่าว่างของแถวสุดท้ายลงไป
                        {
                            string _emp_no = worksheet.Cells[row, 2].Value.ToString().Trim() == null ? null : worksheet.Cells[row, 2].Value.ToString().Trim();
                            int ws_seq_no = Convert.ToInt32(worksheet.Cells[row, 1].Value.ToString().Trim());
                            int _seq_no = 0;
                            string _last_status = "";

                            var emp = await _context.tb_employee.Where(x => x.emp_no == _emp_no).FirstOrDefaultAsync();

                            var query_seq = await _context.tr_course_registration
                                            .Where(x => x.course_no == course_no).OrderByDescending(x => x.seq_no)
                                            .FirstOrDefaultAsync();

                            if (query_seq == null)
                            {
                                _seq_no = 1;
                            }
                            else
                            {
                                _seq_no = query_seq.seq_no + 1;
                            }

                            _last_status = _seq_no > course.capacity ? _config.GetValue<string>("Status:wait") : null; // Check
                            var query = await _context.tr_course_registration
                                        .Where(x => x.course_no == course_no && x.emp_no == _emp_no)
                                        .FirstOrDefaultAsync();

                            if(emp==null){
                                response.Add(new response_course_registration
                                {
                                    emp_no = _emp_no,
                                    seq_no = ws_seq_no,
                                    error_message = _config["Text:staff_not_exist"]
                                });
                            } 
                            else{
                                if(emp.employed_status=="RESIGNED"){
                                    // Invalid department. : dept ของพนักงานใน row ไม่ตรงกับที่ dept login
                                    response.Add(new response_course_registration
                                    {
                                        emp_no = _emp_no,
                                        seq_no = ws_seq_no,
                                        error_message = _config["Text:staff_resigned"]
                                    });
                                }
                                else{
                                    if(committee.org_code==emp.div_code || committee.org_code==emp.dept_code ){
                                        if(!course_bands.Contains(emp.band)){
                                            response.Add(new response_course_registration
                                            {
                                                emp_no = _emp_no,
                                                seq_no = ws_seq_no,
                                                error_message = _config.GetValue<string>("Text:unequal_band")
                                            });
                                        }
                                        else{
                                            if (query == null){
                                                _context.Add(new tr_course_registration
                                                {
                                                    course_no = course_no,
                                                    emp_no = _emp_no,
                                                    seq_no = _seq_no,
                                                    last_status = _last_status,
                                                    remark = await GetPrevCourseNo(course_no, _emp_no),
                                                    register_at = DateTime.Now,
                                                    register_by = User.FindFirst("emp_no").Value
                                                });
                                                await _context.SaveChangesAsync();
                                            }
                                            else{
                                                // Duplication Data. : emp_no ของพนักงานใน row มีข้อมูลใน course อยู่แล้ว
                                                response.Add(new response_course_registration
                                                {
                                                    emp_no = _emp_no,
                                                    seq_no = ws_seq_no,
                                                    error_message = _config.GetValue<string>("Text:duplication")
                                                });
                                            }
                                        }
                                    }
                                    else
                                    {
                                        // Invalid department. : dept ของพนักงานใน row ไม่ตรงกับที่ dept login
                                        response.Add(new response_course_registration
                                        {
                                            emp_no = _emp_no,
                                            seq_no = ws_seq_no,
                                            error_message = _config.GetValue<string>("Text:invalid_department")
                                        });
                                    } 
                                }
                            }           
                        }
                    }
                }
            }
            await Sorting(course_no);
            System.IO.File.Delete(filePath);  //Delete file
            return Ok(response);
        } 
        // POST: api/Register/UploadCourseRegister/ByApproverEmp/{course_no}
        [HttpPost("UploadCourseRegister/ByApproverEmp/{course_no}")]
        public async Task<ActionResult<IEnumerable<tr_course_registration>>> upload_register_by_approver_emp(
            string course_no, [FromForm] req_fileform model)
        {
            string rootFolder = Directory.GetCurrentDirectory();
            string pathString = @"\API site\files\file-hrgis\upload\";
            string serverPath = rootFolder.Substring(0, rootFolder.LastIndexOf(@"\")) + pathString;
            // Create Directory
            if (!Directory.Exists(serverPath))
            {
                Directory.CreateDirectory(serverPath);
            }

            // string fullpath = serverPath + model.file_name;
            string filePath = Path.Combine(serverPath + model.file_name);
            using (Stream stream = new FileStream(filePath, FileMode.Create))
            {
                model.file_form.CopyTo(stream);
                stream.Dispose();
                stream.Close();
            }

            var course = await _context.tr_course.Where(e=>e.course_no==course_no)
                                .Include(e=>e.courses_bands)
                                .FirstOrDefaultAsync();

            if(course==null){
                return StatusCode(400,"Course is not found");
            }

            List<string> course_bands = new List<string>();

            foreach (var item in course.courses_bands)
            {
                course_bands.Add(item.band);
            }

            var approver = await _context.tr_stakeholder
                            .Where(e=>e.role=="APPROVER" && e.emp_no == User.FindFirst("emp_no").Value)
                            .FirstOrDefaultAsync();

            if(approver==null){
                return StatusCode(403,"Permission denied, only committee can use this function");
            }

            List<response_course_registration> response = new List<response_course_registration>();
            if (System.IO.File.Exists(filePath))
            {
                // Console.WriteLine("File exists.");
                using (var package = new ExcelPackage(new FileInfo(filePath)))
                {
                    ExcelWorksheet worksheet = package.Workbook.Worksheets["Sheet1"];
                    int rowCount = worksheet.Dimension.Rows;
                    int colCount = worksheet.Dimension.Columns;
                    // Console.WriteLine("rowCount: " + rowCount);

                    for (int row = 4; row <= rowCount; row++)
                    {
                        if (!String.IsNullOrEmpty(worksheet.Cells[row, 2].Value.ToString().Trim())) // ถ้ามี error ให้ตรวจ rowCount กับ แถวสุดท้าย ตรงกันไหม : จะเป็น error ของค่าว่างของแถวสุดท้ายลงไป
                        {
                            string _emp_no = worksheet.Cells[row, 2].Value.ToString().Trim() == null ? null : worksheet.Cells[row, 2].Value.ToString().Trim();
                            int ws_seq_no = Convert.ToInt32(worksheet.Cells[row, 1].Value.ToString().Trim());
                            int _seq_no = 0;
                            string _last_status = "";

                            var emp = await _context.tb_employee.Where(x => x.emp_no == _emp_no).FirstOrDefaultAsync();

                            var query_seq = await _context.tr_course_registration
                                            .Where(x => x.course_no == course_no).OrderByDescending(x => x.seq_no)
                                            .FirstOrDefaultAsync();

                            if (query_seq == null)
                            {
                                _seq_no = 1;
                            }
                            else
                            {
                                _seq_no = query_seq.seq_no + 1;
                            }

                            _last_status = _seq_no > course.capacity ? _config.GetValue<string>("Status:wait") : null; // Check
                            var query = await _context.tr_course_registration
                                        .Where(x => x.course_no == course_no && x.emp_no == _emp_no)
                                        .FirstOrDefaultAsync();

                            if(emp==null){
                                response.Add(new response_course_registration
                                {
                                    emp_no = _emp_no,
                                    seq_no = ws_seq_no,
                                    error_message = _config["Text:staff_not_exist"]
                                });
                            } 
                            else{
                                if(emp.employed_status=="RESIGNED"){
                                    // Invalid department. : dept ของพนักงานใน row ไม่ตรงกับที่ dept login
                                    response.Add(new response_course_registration
                                    {
                                        emp_no = _emp_no,
                                        seq_no = ws_seq_no,
                                        error_message = _config["Text:staff_resigned"]
                                    });
                                }
                                else{
                                    if(approver.org_code==emp.div_code || approver.org_code==emp.dept_code ){
                                        if(!course_bands.Contains(emp.band)){
                                            response.Add(new response_course_registration
                                            {
                                                emp_no = _emp_no,
                                                seq_no = ws_seq_no,
                                                error_message = _config.GetValue<string>("Text:unequal_band")
                                            });
                                        }
                                        else{
                                            if (query == null){
                                                _context.Add(new tr_course_registration
                                                {
                                                    course_no = course_no,
                                                    emp_no = _emp_no,
                                                    seq_no = _seq_no,
                                                    last_status = _last_status,
                                                    remark = await GetPrevCourseNo(course_no, _emp_no),
                                                    register_at = DateTime.Now,
                                                    register_by = User.FindFirst("emp_no").Value,
                                                    final_approved_at = DateTime.Now,
                                                    final_approved_by = User.FindFirst("emp_no").Value,
                                                    final_approved_checked = true
                                                });
                                                await _context.SaveChangesAsync();
                                            }
                                            else{
                                                // Duplication Data. : emp_no ของพนักงานใน row มีข้อมูลใน course อยู่แล้ว
                                                response.Add(new response_course_registration
                                                {
                                                    emp_no = _emp_no,
                                                    seq_no = ws_seq_no,
                                                    error_message = _config.GetValue<string>("Text:duplication")
                                                });
                                            }
                                        }
                                    }
                                    else
                                    {
                                        // Invalid department. : dept ของพนักงานใน row ไม่ตรงกับที่ dept login
                                        response.Add(new response_course_registration
                                        {
                                            emp_no = _emp_no,
                                            seq_no = ws_seq_no,
                                            error_message = _config.GetValue<string>("Text:invalid_department")
                                        });
                                    } 
                                }
                            }           
                        }
                    }
                }
            }
            await Sorting(course_no);
            System.IO.File.Delete(filePath);  //Delete file
            return Ok(response);
        } 
         // POST: api/Register/UploadCourseRegister/ByCommitteeCourse/{course_no}
        [HttpPost("UploadCourseRegister/ByCommitteeCourse/{course_no}")]
        public async Task<ActionResult<IEnumerable<tr_course_registration>>> upload_register_by_committee_course(
            string course_no, [FromForm] req_fileform model)
        {
            string rootFolder = Directory.GetCurrentDirectory();
            string pathString = @"\API site\files\file-hrgis\upload\";
            string serverPath = rootFolder.Substring(0, rootFolder.LastIndexOf(@"\")) + pathString;
            // Create Directory
            if (!Directory.Exists(serverPath))
            {
                Directory.CreateDirectory(serverPath);
            }

            // string fullpath = serverPath + model.file_name;
            string filePath = Path.Combine(serverPath + model.file_name);
            using (Stream stream = new FileStream(filePath, FileMode.Create))
            {
                model.file_form.CopyTo(stream);
                stream.Dispose();
                stream.Close();
            }

            var course = await _context.tr_course.Where(e=>e.course_no==course_no)
                                .Include(e=>e.courses_bands)
                                .FirstOrDefaultAsync();

            if(course==null){
                return StatusCode(400,"Course is not found");
            }

            List<string> course_bands = new List<string>();

            foreach (var item in course.courses_bands)
            {
                course_bands.Add(item.band);
            }

            var committee = await _context.tr_stakeholder
                            .Where(e=>e.role.ToUpper()=="COMMITTEE" && e.emp_no == User.FindFirst("emp_no").Value)
                            .FirstOrDefaultAsync();

            if(committee==null){
                return StatusCode(403,"Permission denied, only committee can use this function");
            }

            List<response_course_registration> response = new List<response_course_registration>();
            if (System.IO.File.Exists(filePath))
            {
                // Console.WriteLine("File exists.");
                using (var package = new ExcelPackage(new FileInfo(filePath)))
                {
                    ExcelWorksheet worksheet = package.Workbook.Worksheets["Sheet1"];
                    int rowCount = worksheet.Dimension.Rows;
                    int colCount = worksheet.Dimension.Columns;
                    // Console.WriteLine("rowCount: " + rowCount);

                    for (int row = 4; row <= rowCount; row++)
                    {
                        if (!String.IsNullOrEmpty(worksheet.Cells[row, 2].Value.ToString().Trim())) // ถ้ามี error ให้ตรวจ rowCount กับ แถวสุดท้าย ตรงกันไหม : จะเป็น error ของค่าว่างของแถวสุดท้ายลงไป
                        {
                            string _emp_no = worksheet.Cells[row, 2].Value.ToString().Trim() == null ? null : worksheet.Cells[row, 2].Value.ToString().Trim();
                            int ws_seq_no = Convert.ToInt32(worksheet.Cells[row, 1].Value.ToString().Trim());
                            int _seq_no = 0;

                            var emp = await _context.tb_employee.Where(x => x.emp_no == _emp_no).FirstOrDefaultAsync();

                            var query_seq = await _context.tr_course_registration
                                            .Where(x => x.course_no == course_no).OrderByDescending(x => x.seq_no)
                                            .FirstOrDefaultAsync();

                            if (query_seq == null)
                            {
                                _seq_no = 1;
                            }
                            else
                            {
                                _seq_no = query_seq.seq_no + 1;
                            }
                            
                            var query = await _context.tr_course_registration
                                        .Where(x => x.course_no == course_no && x.emp_no == _emp_no)
                                        .FirstOrDefaultAsync();

                            if(emp==null){
                                response.Add(new response_course_registration
                                {
                                    emp_no = _emp_no,
                                    seq_no = ws_seq_no,
                                    error_message = _config["Text:staff_not_exist"]
                                });
                            } 
                            else{
                                if(emp.employed_status=="RESIGNED"){
                                    // Invalid department. : dept ของพนักงานใน row ไม่ตรงกับที่ dept login
                                    response.Add(new response_course_registration
                                    {
                                        emp_no = _emp_no,
                                        seq_no = ws_seq_no,
                                        error_message = _config["Text:staff_resigned"]
                                    });
                                }
                                else{
                                    if(committee.org_code==emp.div_code || committee.org_code==emp.dept_code ){
                                        if(!course_bands.Contains(emp.band)){
                                            response.Add(new response_course_registration
                                            {
                                                emp_no = _emp_no,
                                                seq_no = ws_seq_no,
                                                error_message = _config.GetValue<string>("Text:unequal_band")
                                            });
                                        }
                                        else{
                                            if (query == null){
                                                if(_seq_no > course.capacity){
                                                    response.Add(new response_course_registration
                                                    {
                                                        emp_no = _emp_no,
                                                        seq_no = ws_seq_no,
                                                        error_message = _config.GetValue<string>("Text:over_capacity")
                                                    });
                                                }
                                                else{
                                                    _context.Add(new tr_course_registration
                                                    {
                                                        course_no = course_no,
                                                        emp_no = _emp_no,
                                                        seq_no = _seq_no,
                                                        last_status = _config["Status:approved"],
                                                        remark = await GetPrevCourseNo(course_no, _emp_no),
                                                        register_at = DateTime.Now,
                                                        register_by = User.FindFirst("emp_no").Value,
                                                        final_approved_at = DateTime.Now,
                                                        final_approved_by = User.FindFirst("emp_no").Value,
                                                        final_approved_checked = true
                                                    });
                                                    await _context.SaveChangesAsync();
                                                }
                                            }
                                            else{
                                                // Duplication Data. : emp_no ของพนักงานใน row มีข้อมูลใน course อยู่แล้ว
                                                response.Add(new response_course_registration
                                                {
                                                    emp_no = _emp_no,
                                                    seq_no = ws_seq_no,
                                                    error_message = _config.GetValue<string>("Text:duplication")
                                                });
                                            }
                                        }
                                    }
                                    else
                                    {
                                        // Invalid department. : dept ของพนักงานใน row ไม่ตรงกับที่ dept login
                                        response.Add(new response_course_registration
                                        {
                                            emp_no = _emp_no,
                                            seq_no = ws_seq_no,
                                            error_message = _config.GetValue<string>("Text:invalid_department")
                                        });
                                    } 
                                }
                            }           
                        }
                    }
                }
            }
            await Sorting(course_no);
            System.IO.File.Delete(filePath);  //Delete file
            return Ok(response);
        }
        // PUT: api/Register/UpdateScore
        [HttpPut("UpdateScore/{course_no}")]
        public async Task<IActionResult> update_score(string course_no, List<tr_course_registration> registrant)
        {
            var course = await _context.tr_course
                                    .Where(e => e.course_no==course_no)
                                    .FirstOrDefaultAsync();
            if(course==null){
                return NotFound("Course no. is not found");
            }

            try
            {
                List<tr_course_registration> list = new List<tr_course_registration>();
                foreach (var item in registrant)
                {
                    var edits = await _context.tr_course_registration
                                    .Where(x => x.course_no == course_no && x.emp_no == item.emp_no)
                                    .FirstOrDefaultAsync();

                    Console.WriteLine("PRE: "+edits.pre_test_score);
                    edits.pre_test_score = item.pre_test_score==null? null:Convert.ToInt32(item.pre_test_score);
                    edits.pre_test_grade = item.pre_test_score==null? null:fnGrade(item.pre_test_score.ToString());
                    edits.post_test_score = item.post_test_score==null? null:Convert.ToInt32(item.post_test_score);
                    edits.post_test_grade = item.post_test_score==null? null:fnGrade(item.post_test_score.ToString());
                    edits.scored_at = DateTime.Now;
                    edits.scored_by = User.FindFirst("emp_no").Value;

                    list.Add(edits);
                }
                _context.tr_course_registration.UpdateRange(list);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!tr_course_registrationExists(course_no))
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
        // POST: api/Register/UploadCourseScore/{course_no}
        [HttpPost("UploadCourseScore/{course_no}")]
        public async Task<ActionResult<IEnumerable<tr_course_registration>>> UploadCourseScore(string course_no, [FromForm] req_fileform model)
        {
            if(!is_course_of_committee(course_no)){
                return StatusCode(400, "Please select the course in your organization");
            }

            var course = await _context.tr_course.Where(e=>e.course_no==course_no)
                    .Include(e=>e.courses_bands)
                    .FirstOrDefaultAsync();

            if(course==null){
                return StatusCode(400,"Course is not found");
            }

            List<string> course_bands = new List<string>();

            foreach (var item in course.courses_bands)
            {
                course_bands.Add(item.band);
                Console.WriteLine("band "+item.band);
            }

            string rootFolder = Directory.GetCurrentDirectory();
            string pathString = @"\API site\files\file-hrgis\upload\";
            string serverPath = rootFolder.Substring(0, rootFolder.LastIndexOf(@"\")) + pathString;
            // Create Directory
            if (!Directory.Exists(serverPath))
            {
                Directory.CreateDirectory(serverPath);
            }

            // string fullpath = serverPath + model.file_name;
            string filePath = Path.Combine(serverPath + model.file_name);
            using (Stream stream = new FileStream(filePath, FileMode.Create))
            {
                model.file_form.CopyTo(stream);
                stream.Dispose();
                stream.Close();
            }

            List<response_course_score> response = new List<response_course_score>();
            if (System.IO.File.Exists(filePath))
            {
                // Console.WriteLine("File exists.");
                using (var package = new ExcelPackage(new FileInfo(filePath)))
                {
                    ExcelWorksheet worksheet = package.Workbook.Worksheets["Sheet1"];
                    int rowCount = worksheet.Dimension.Rows;
                    int colCount = worksheet.Dimension.Columns;
                    // Console.WriteLine("rowCount: " + rowCount);

                    for (int row = 2; row <= rowCount; row++)
                    {
                        if (!String.IsNullOrEmpty(worksheet.Cells[row, 1].Value.ToString().Trim())) // ถ้ามี error ให้ตรวจ rowCount กับ แถวสุดท้าย ตรงกันไหม : จะเป็น error ของค่าว่างของแถวสุดท้ายลงไป
                        {
                            string _emp_no = worksheet.Cells[row, 1].Value == null ? null : worksheet.Cells[row, 1].Value.ToString().Trim();
                            string pre_test_score = worksheet.Cells[row, 2].Value == null ? null : worksheet.Cells[row, 2].Value.ToString().Trim();;
                            string post_test_score = worksheet.Cells[row, 3].Value == null ? null : worksheet.Cells[row, 3].Value.ToString().Trim();;
                            // ต้องคำนวนเกรด

                            int _seq_no = 0;

                            var emp = await _context.tb_employee.Where(x => x.emp_no == _emp_no).FirstOrDefaultAsync();

                            var query_seq = await _context.tr_course_registration.Where(x => x.course_no == course_no).OrderByDescending(x => x.seq_no).FirstOrDefaultAsync();
                            if (query_seq == null)
                            {
                                _seq_no = 1;
                            }
                            else
                            {
                                _seq_no = query_seq.seq_no + 1;
                            }
                            // Console.WriteLine(_seq_no+ " " +course.capacity); 
                            // Console.WriteLine(_seq_no>course.capacity); 

                            var query = await _context.tr_course_registration.Where(x => x.course_no == course_no && x.emp_no == _emp_no).FirstOrDefaultAsync();
                            if(emp==null){
                                response.Add(new response_course_score
                                {
                                    emp_no = _emp_no,
                                    seq_no = _seq_no,
                                    pre_test_score = pre_test_score==null? null:Convert.ToInt32(pre_test_score),
                                    pre_test_grade = pre_test_score==null? null:fnGrade(pre_test_score),
                                    post_test_score = post_test_score==null? null:Convert.ToInt32(post_test_score),
                                    post_test_grade = post_test_score==null? null:fnGrade(post_test_score),
                                    error_message = _config["Text:staff_not_exist"]
                                });
                            }
                            else{
                                if(!course_bands.Contains(emp.band)){
                                response.Add(new response_course_score
                                {
                                    emp_no = _emp_no,
                                    seq_no = _seq_no,
                                    pre_test_score = pre_test_score==null? null:Convert.ToInt32(pre_test_score),
                                    pre_test_grade = pre_test_score==null? null:fnGrade(pre_test_score),
                                    post_test_score = post_test_score==null? null:Convert.ToInt32(post_test_score),
                                    post_test_grade = post_test_score==null? null:fnGrade(post_test_score),
                                    error_message = _config["Text:unequal_band"]
                                });
                            }
                            else
                            {
                                if (query == null)
                                {
                                    if(emp.employed_status=="RESIGNED"){
                                        response.Add(new response_course_score
                                        {
                                            emp_no = _emp_no,
                                            seq_no = _seq_no,
                                            pre_test_score = pre_test_score==null? null:Convert.ToInt32(pre_test_score),
                                            pre_test_grade = pre_test_score==null? null:fnGrade(pre_test_score),
                                            post_test_score = post_test_score==null? null:Convert.ToInt32(post_test_score),
                                            post_test_grade = post_test_score==null? null:fnGrade(post_test_score),
                                            error_message = _config.GetValue<string>("Text:staff_resigned")
                                        });
                                        // Score incorrect. : คะแนนที่กรอกมาคำนวนไม่ได้
                                    }
                                    else{
                                        string _grade_pre = pre_test_score==null? null:fnGrade(pre_test_score);
                                        string _grade_post = post_test_score==null? null:fnGrade(post_test_score);
                                        if (_grade_pre != "Fail" && _grade_post != "Fail")
                                        {
                                            if(_seq_no>course.capacity){
                                                response.Add(new response_course_score
                                                {
                                                    emp_no = _emp_no,
                                                    seq_no = _seq_no,
                                                    pre_test_score = pre_test_score==null? null:Convert.ToInt32(pre_test_score),
                                                    pre_test_grade = pre_test_score==null? null:fnGrade(pre_test_score),
                                                    post_test_score = post_test_score==null? null:Convert.ToInt32(post_test_score),
                                                    post_test_grade = post_test_score==null? null:fnGrade(post_test_score),
                                                    error_message = _config.GetValue<string>("Text:over_capacity")
                                                });
                                            }
                                            else{
                                                _context.Add(new tr_course_registration
                                                {
                                                    course_no = course_no,
                                                    emp_no = _emp_no,
                                                    seq_no = _seq_no,
                                                    pre_test_score = pre_test_score==null? null:Convert.ToInt32(pre_test_score),
                                                    pre_test_grade = pre_test_score==null? null:fnGrade(pre_test_score),
                                                    post_test_score = post_test_score==null? null:Convert.ToInt32(post_test_score),
                                                    post_test_grade = post_test_score==null? null:fnGrade(post_test_score),
                                                    last_status = (_seq_no>course.capacity)? _config["Status:wait"]:_config["Status:approved"],
                                                    remark = _config.GetValue<string>("Text:papers")+(await GetPrevCourseNo(course_no, _emp_no)==""? "":await GetPrevCourseNo(course_no, _emp_no)),
                                                    register_at = DateTime.Now,
                                                    register_by = User.FindFirst("emp_no").Value,
                                                    scored_at = DateTime.Now,
                                                    scored_by = User.FindFirst("emp_no").Value,
                                                    final_approved_at = DateTime.Now,
                                                    final_approved_by = User.FindFirst("emp_no").Value,
                                                    final_approved_checked = true
                                                });
                                                await _context.SaveChangesAsync();
                                            }
                                        }
                                        else
                                        {
                                            response.Add(new response_course_score
                                            {
                                                emp_no = _emp_no,
                                                seq_no = _seq_no,
                                                pre_test_score = pre_test_score==null? null:Convert.ToInt32(pre_test_score),
                                                pre_test_grade = pre_test_score==null? null:fnGrade(pre_test_score),
                                                post_test_score = post_test_score==null? null:Convert.ToInt32(post_test_score),
                                                post_test_grade = post_test_score==null? null:fnGrade(post_test_score),
                                                error_message = _config.GetValue<string>("Text:score_incorrect")
                                            });
                                        } // Score incorrect. : คะแนนที่กรอกมาคำนวนไม่ได้  
                                    }
                                }
                                else
                                {
                                    query.emp_no = _emp_no;
                                    query.pre_test_score = pre_test_score==null? null:Convert.ToInt32(pre_test_score);
                                    query.pre_test_grade = pre_test_score==null? null:fnGrade(pre_test_score);
                                    query.post_test_score = post_test_score==null? null:Convert.ToInt32(post_test_score);
                                    query.post_test_grade = post_test_score==null? null:fnGrade(post_test_score);
                                    query.scored_at = DateTime.Now;
                                    query.scored_by = User.FindFirst("emp_no").Value;
                                    _context.Entry(query).State = EntityState.Modified;
                                    await _context.SaveChangesAsync(); 
                                } 
                            }
                           
                            }
                        }
                    }
                }
            }
            System.IO.File.Delete(filePath);  //Delete file

            return Ok(response);
        }
        protected string fnGrade(string score)
        {
            string grade = "Fail";
            int _score = Convert.ToInt32(score);

            if (score == "") { grade = ""; }
            else if (_score >= 80 && _score <= 100) { grade = "A"; }
            else if (_score >= 70 && _score <= 79) { grade = "B"; }
            else if (_score >= 60 && _score <= 69) { grade = "C"; }
            else if (_score >= 50 && _score <= 59) { grade = "D"; }
            else if (_score >= 1 && _score <= 49) { grade = "E"; }
            else if (_score == 0) { grade = "F"; }

            return grade;
        }
    }
}
public class req_fileform
{
    [Required]
    [Display(Name = "IMPORT")]
    public IFormFile file_form { get; set; }
    public string file_name { get; set; }
}

public class response_course_registration
{
    public string emp_no { get; set; }
    public int seq_no { get; set; }
    public string error_message { get; set; }
}
public class response_course_score
{
    public string emp_no { get; set; }
    public int seq_no { get; set; }
    public int? pre_test_score { get; set; }
    public string pre_test_grade { get; set; }
    public int? post_test_score { get; set; }
    public string post_test_grade { get; set; }
    public string error_message { get; set; }
}

