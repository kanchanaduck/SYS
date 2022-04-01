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

namespace api_hrgis.Controllers
{
    [Authorize] // Microsoft.AspNetCore.Authorization; // [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class RegistrationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config; // using Microsoft.Extensions.Configuration;

        public RegistrationController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // GET: api/Registration
        [HttpGet]
        public async Task<ActionResult<IEnumerable<tr_course_registration>>> Gettr_course_registration()
        {
            return await _context.tr_course_registration.ToListAsync();
        }

        // GET: api/Registration/5
        [HttpGet("{course_no}")]
        public async Task<ActionResult<tr_course_registration>> Gettr_course_registration(string course_no)
        {
            var tr_course_registration = await _context.tr_course_registration.Where(x => x.course_no == course_no).FirstOrDefaultAsync();

            if (tr_course_registration == null)
            {
                return NotFound();
            }

            return tr_course_registration;
        }

        // GET: api/Registration/5
        [HttpGet("Get_course")]
        public async Task<ActionResult<IEnumerable<tr_course_registration>>> Get_course()
        {
            var tr_course_registration = await (from tb in _context.tr_course_registration
                                                join tb1 in _context.tr_course on tb.course_no equals tb1.course_no
                                                join tb2 in _context.tb_organization on tb1.org_code equals tb2.org_code
                                                where tb.last_status == _config.GetValue<string>("Status:approved")
                                                select new
                                                {
                                                    course_no = tb.course_no.Substring(0, 7).ToString(),
                                                    tb1.course_name_en,
                                                    tb1.course_name_th,
                                                    tb1.org_code,
                                                    tb2.org_abb
                                                }
                                        ).Distinct().ToListAsync();

            return Ok(tr_course_registration);
        }

        // GET: api/Registration/GetGridView/{course_no}/{org_code}
        [HttpGet("GetGridView/{course_no}/{org_code}")]
        public async Task<ActionResult> GetGridView(string course_no, string org_code)
        {
            // string _org = "";
            // _org = org_code == _config.GetValue<string>("Text:all") ? "" : dept_abb;

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

            return Ok(new
            {
                your = query,
                other = query_other
            });
        }
        [AllowAnonymous]
        // GET: api/Registration/GetPrevCourse/{course_no}/{emp_no}
        [HttpGet("GetPrevCourse/{course_no}/{emp_no}")]
        public async Task<ActionResult> GetPrevCourse(string course_no, string emp_no)
        {
            return Ok(await GetPrevCourseNo(course_no, emp_no));
        }

        protected async Task<string> GetPrevCourseNo(string course_no, string emp_no)
        {
            string prev_c = ""; string result = "";

            var course = await _context.tr_course_master
                    .Where(x => x.course_no == course_no.Substring(0, 7))
                    .Include(x => x.master_courses_previous_courses)
                    .FirstOrDefaultAsync();
            if (course != null)
            {
                if (course.master_courses_previous_courses.Count() > 0)
                {
                    foreach (var i in course.master_courses_previous_courses)
                    {
                        if (course.master_courses_previous_courses.Count() == 1)
                        {
                            prev_c = prev_c + i.prev_course_no;
                        }
                        else
                        {
                            prev_c = prev_c + i.prev_course_no + ", ";
                        }
                    }

                    var query2 = await _context.tr_course_registration.Where(x => x.course_no == course_no 
                    && x.emp_no == emp_no 
                    && x.last_status == _config.GetValue<string>("Status:approved")).FirstOrDefaultAsync();
                    if (query2 == null)
                    {
                        result = _config.GetValue<string>("Text:not_passed") + " " + prev_c;
                    }
                }
            }

            return result;
        }

        // PUT: api/Registration/MgrApprove/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("MgrApprove/{course_no}")]
        public async Task<IActionResult> PutMgrApprove(string course_no, req_tr_course_registration model)
        {
            if (course_no != model.course_no)
            {
                return BadRequest();
            }

            try
            {
                //////////// old
                // var query_seq = await _context.tr_course_registration.Where(x => x.course_no == course_no
                //                     && x.last_status == _config.GetValue<string>("Status:approved")).OrderByDescending(x => x.seq_no).FirstOrDefaultAsync();
                // if (query_seq != null)
                // {
                //     await HaveCenter(course_no, model);
                // }
                // else
                // {
                //     await NonCenter(course_no, model);
                //     // Mgr. approve ไม่ต้องตรวจสอบว่ามากกว่า capacity หรือไม่ เพราะให้ approve ได้หมดทุกคนเลย
                // }

                /////////// บันทึกข้อมูลเข้าไปก่อน แต่ยังไม่เรียงลำดับ
                List<tr_course_registration> list = new List<tr_course_registration>();
                int _seq_no = 0;
                for (var i = 0; i < model.array.Count(); i++)
                {
                    var item = model.array[i];
                    _seq_no = i + 1;

                    var edits = await _context.tr_course_registration.Where(x => x.course_no == course_no && x.emp_no == item.emp_no).FirstOrDefaultAsync();
                    if (edits != null)
                    {
                        // edits.seq_no = _seq_no;
                        if (_seq_no > model.capacity)
                        {
                            edits.last_status = edits.last_status == _config.GetValue<string>("Status:wait") ? edits.last_status : null;
                            edits.manager_approved_at = null;
                            edits.manager_approved_by = null;
                            edits.manager_approved_checked = null;
                            edits.final_approved_at = null;
                            edits.final_approved_by = null;
                            edits.final_approved_checked = null;
                        }
                        else
                        {
                            if (item.manager_approved_checked == true)
                            {
                                edits.last_status = _config.GetValue<string>("Status:approved");
                                edits.manager_approved_at = DateTime.Now;
                                edits.manager_approved_by = User.FindFirst("emp_no").Value;
                                edits.manager_approved_checked = item.manager_approved_checked;
                                edits.final_approved_at = DateTime.Now;
                                edits.final_approved_by = User.FindFirst("emp_no").Value;
                                edits.final_approved_checked = item.manager_approved_checked;
                            }
                            else
                            {
                                edits.last_status = edits.last_status == _config.GetValue<string>("Status:wait") ? edits.last_status : null;
                                edits.manager_approved_at = null;
                                edits.manager_approved_by = null;
                                edits.manager_approved_checked = null;
                                edits.final_approved_at = null;
                                edits.final_approved_by = null;
                                edits.final_approved_checked = null;
                            }
                        }

                        list.Add(edits);
                    }
                }
                _context.tr_course_registration.UpdateRange(list);
                await _context.SaveChangesAsync();

                /////////// ทำการเรียงลำดับ เฉพาะสถานะ approved, เรียงลำดับตาม manager_approved_at
                List<tr_course_registration> list1 = new List<tr_course_registration>();
                var seq1 = await _context.tr_course_registration.Where(x => x.course_no == course_no
                                && x.last_status == _config.GetValue<string>("Status:approved")).OrderBy(x => x.manager_approved_at).ToListAsync();
                int _seq1 = 0;
                for (var j = 0; j < seq1.Count(); j++)
                {
                    var item1 = seq1[j];
                    _seq1 = _seq1 + 1;

                    var edits1 = _context.tr_course_registration.Where(x => x.course_no == course_no && x.emp_no == item1.emp_no).FirstOrDefault();
                    edits1.seq_no = _seq1;
                    list1.Add(edits1);
                }
                _context.tr_course_registration.UpdateRange(list1);
                await _context.SaveChangesAsync();
                /////////// ทำการเรียงลำดับ ที่ไม่ใช่สถานะ approved, เรียงลำดับตาม register_at
                List<tr_course_registration> list2 = new List<tr_course_registration>();
                var seq2 = await _context.tr_course_registration.Where(x => x.course_no == course_no
                                && x.last_status != _config.GetValue<string>("Status:approved")).OrderBy(x => x.register_at).ToListAsync();
                int _seq2 = _seq1;
                for (var k = 0; k < seq2.Count(); k++)
                {
                    var item2 = seq2[k];
                    _seq2 = _seq2 + 1;

                    var edits2 = _context.tr_course_registration.Where(x => x.course_no == course_no && x.emp_no == item2.emp_no).FirstOrDefault();
                    edits2.seq_no = _seq2;
                    list2.Add(edits2);
                }
                _context.tr_course_registration.UpdateRange(list2);
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

        protected async Task HaveFinal(string course_no, req_tr_course_registration model)
        {
            List<tr_course_registration> list = new List<tr_course_registration>();
            int _seq_no = 0;
            var query_seq = await _context.tr_course_registration.Where(x => x.course_no == course_no
                                && x.last_status == _config.GetValue<string>("Status:approved")).OrderByDescending(x => x.seq_no).FirstOrDefaultAsync();
            _seq_no = query_seq == null ? _seq_no : query_seq.seq_no;

            for (var i = 0; i < model.array.Count(); i++)
            {
                var item = model.array[i];
                // _seq_no = i + 1;
                if (item.manager_approved_checked == true)
                {
                    var edits = await _context.tr_course_registration.Where(x => x.course_no == course_no
                    && x.emp_no == item.emp_no && x.last_status != _config.GetValue<string>("Status:approved")).FirstOrDefaultAsync();
                    if (edits != null)
                    {
                        _seq_no = _seq_no + 1;
                        edits.seq_no = _seq_no;
                        edits.last_status = _config.GetValue<string>("Status:approved");
                        edits.manager_approved_at = DateTime.Now;
                        edits.manager_approved_by = User.FindFirst("emp_no").Value;
                        edits.manager_approved_checked = true;
                        // Console.WriteLine("===== 1: " + item.emp_no + " : " + _seq_no);

                        list.Add(edits);
                    }
                }
            }
            _context.tr_course_registration.UpdateRange(list);
            await _context.SaveChangesAsync();

            // อัปเดต seq_no ที่เหลือจากอันไม่ติ๊ก
            var strtb = "";
            strtb = String.Join(",", model.array.Where(x => x.manager_approved_checked == false).Select(p => p.emp_no));
            // Console.WriteLine("===== 00: " + strtb);

            List<tr_course_registration> list_after = new List<tr_course_registration>();
            int _seq_no_after = _seq_no;
            var query_after = (from c in _context.tr_course_registration
                               where c.course_no == course_no && c.last_status != _config.GetValue<string>("Status:approved") && strtb.Contains(c.emp_no)
                               select c).OrderBy(x => x.register_at).ToList();
            for (var j = 0; j < query_after.Count(); j++)
            {
                var item_after = query_after[j];
                _seq_no_after = _seq_no_after + 1;
                // Console.WriteLine("===== 2 : " + item_after.emp_no + " : " + _seq_no_after);

                var edits_after = _context.tr_course_registration.Where(x => x.course_no == course_no && x.emp_no == item_after.emp_no).FirstOrDefault();
                edits_after.seq_no = _seq_no_after;
                edits_after.last_status = edits_after.last_status == _config.GetValue<string>("Status:approved") ? edits_after.last_status : _config.GetValue<string>("Status:wait");
                edits_after.manager_approved_at = edits_after.last_status == _config.GetValue<string>("Status:approved") ? edits_after.manager_approved_at : null;
                edits_after.manager_approved_by = edits_after.last_status == _config.GetValue<string>("Status:approved") ? edits_after.manager_approved_by : null;
                edits_after.manager_approved_checked = edits_after.last_status == _config.GetValue<string>("Status:approved") ? edits_after.manager_approved_checked : null;

                list_after.Add(edits_after);
            }
            _context.tr_course_registration.UpdateRange(list_after);
            await _context.SaveChangesAsync();
        }
        protected async Task NonFinal(string course_no, req_tr_course_registration model)
        {
            List<tr_course_registration> list = new List<tr_course_registration>();
            int _seq_no = 0;
            var query_seq = await _context.tr_course_registration.Where(x => x.course_no == course_no
                                && x.last_status == _config.GetValue<string>("Status:approved")).OrderByDescending(x => x.seq_no).FirstOrDefaultAsync();
            _seq_no = query_seq == null ? _seq_no : query_seq.seq_no;

            for (var i = 0; i < model.array.Count(); i++)
            {
                var item = model.array[i];
                if (item.manager_approved_checked == true)
                {
                    var edits = await _context.tr_course_registration.Where(x => x.course_no == course_no
                    && x.emp_no == item.emp_no && x.last_status != _config.GetValue<string>("Status:approved")).FirstOrDefaultAsync();
                    if (edits != null)
                    {
                        _seq_no = _seq_no + 1;
                        edits.seq_no = _seq_no;
                        edits.last_status = _config.GetValue<string>("Status:approved");
                        edits.manager_approved_at = DateTime.Now;
                        edits.manager_approved_by = User.FindFirst("emp_no").Value;
                        edits.manager_approved_checked = true;
                        // Console.WriteLine("===== 1: " + item.emp_no + " : " + _seq_no);

                        list.Add(edits);
                    }
                }
            }
            _context.tr_course_registration.UpdateRange(list);
            await _context.SaveChangesAsync();

            // อัปเดต seq_no ที่เหลือจากอันไม่ติ๊ก
            var strtb = "";
            strtb = String.Join(",", model.array.Where(x => x.manager_approved_checked == false).Select(p => p.emp_no));
            // Console.WriteLine("===== 0: " + strtb);
            // Console.WriteLine("===== 0: " + _seq_no);

            List<tr_course_registration> list_after = new List<tr_course_registration>();
            int _seq_no_after = _seq_no;
            var query_after = (from c in _context.tr_course_registration
                               where c.course_no == course_no && c.last_status != _config.GetValue<string>("Status:approved")
                               || (c.course_no == course_no && strtb.Contains(c.emp_no))
                               select c).OrderBy(x => x.register_at).ToList();
            for (var j = 0; j < query_after.Count(); j++)
            {
                var item_after = query_after[j];
                _seq_no_after = _seq_no_after + 1;
                // Console.WriteLine("===== 3 : " + item_after.emp_no + " : " + _seq_no_after);

                var edits_after = _context.tr_course_registration.Where(x => x.course_no == course_no && x.emp_no == item_after.emp_no).FirstOrDefault();
                edits_after.seq_no = _seq_no_after;
                edits_after.last_status = null;
                edits_after.manager_approved_at = null;
                edits_after.manager_approved_by = null;
                edits_after.manager_approved_checked = null;

                list_after.Add(edits_after);
            } // เรียงลำดับของคนที่เหลือ
            _context.tr_course_registration.UpdateRange(list_after);
            await _context.SaveChangesAsync();
        }

        // PUT: api/Registration/FinalApprove/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("FinalApprove/{course_no}")]
        public async Task<IActionResult> PutFinalApprove(string course_no, req_tr_course_registration model)
        {
            if (course_no != model.course_no)
            {
                return BadRequest();
            }

            try
            {   // Center approve ต้องตรวจสอบว่ามากกว่า capacity หรือไม่ ถ้ามากกว่าให้เท่ากับ Wait
                ///////////////////////// old
                // List<tr_course_registration> list = new List<tr_course_registration>();
                // int _seq_no = 0;
                // for (var i = 0; i < model.array.Count(); i++)
                // {
                //     var item = model.array[i];
                //     _seq_no = i + 1;

                //     var edits = await _context.tr_course_registration.Where(x => x.course_no == course_no && x.emp_no == item.emp_no).FirstOrDefaultAsync();
                //     if (edits != null)
                //     {
                //         edits.seq_no = _seq_no;
                //         if (_seq_no > model.capacity)
                //         {
                //             Console.WriteLine("===== 1 =====" + item.emp_no + " : " + _seq_no);
                //             edits.last_status = edits.last_status == _config.GetValue<string>("Status:approved") ? edits.last_status : _config.GetValue<string>("Status:wait");
                //             edits.center_approved_at = null;
                //             edits.center_approved_by = null;
                //             edits.center_approved_checked = null;
                //         }
                //         else
                //         {
                //             Console.WriteLine("===== 2 =====" + item.emp_no + " : " + _seq_no);
                //             if (item.center_approved_checked == true)
                //             {
                //                 edits.last_status = _config.GetValue<string>("Status:approved");
                //                 edits.center_approved_at = DateTime.Now;
                //                 edits.center_approved_by = User.FindFirst("emp_no").Value;
                //                 edits.center_approved_checked = item.center_approved_checked;
                //             }
                //             else
                //             {
                //                 edits.last_status = edits.manager_approved_checked == true ? _config.GetValue<string>("Status:approved") : null;
                //                 edits.center_approved_at = DateTime.Now;
                //                 edits.center_approved_by = User.FindFirst("emp_no").Value;
                //                 edits.center_approved_checked = item.center_approved_checked;
                //             }
                //         }

                //         list.Add(edits);
                //     }
                // }
                // _context.tr_course_registration.UpdateRange(list);
                // await _context.SaveChangesAsync();

                /////////// บันทึกข้อมูลเข้าไปก่อน แต่ยังไม่เรียงลำดับ
                List<tr_course_registration> list = new List<tr_course_registration>();
                int _seq_no = 0;
                for (var i = 0; i < model.array.Count(); i++)
                {
                    var item = model.array[i];
                    _seq_no = i + 1;

                    var edits = await _context.tr_course_registration.Where(x => x.course_no == course_no && x.emp_no == item.emp_no).FirstOrDefaultAsync();
                    if (edits != null)
                    {
                        // edits.seq_no = _seq_no;
                        if (_seq_no > model.capacity)
                        {
                            edits.last_status = edits.last_status == _config.GetValue<string>("Status:wait") ? edits.last_status : null;
                            edits.manager_approved_at = null;
                            edits.manager_approved_by = null;
                            edits.manager_approved_checked = null;
                            edits.final_approved_at = null;
                            edits.final_approved_by = null;
                            edits.final_approved_checked = null;
                        }
                        else
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
                                edits.last_status = edits.last_status == _config.GetValue<string>("Status:wait") ? edits.last_status : null;
                                edits.manager_approved_at = null;
                                edits.manager_approved_by = null;
                                edits.manager_approved_checked = null;
                                edits.final_approved_at = null;
                                edits.final_approved_by = null;
                                edits.final_approved_checked = null;
                            }
                        }

                        list.Add(edits);
                    }
                }
                _context.tr_course_registration.UpdateRange(list);
                await _context.SaveChangesAsync();

                /////////// ทำการเรียงลำดับ เฉพาะสถานะ approved, เรียงลำดับตาม center_approved_at
                List<tr_course_registration> list1 = new List<tr_course_registration>();
                var seq1 = await _context.tr_course_registration.Where(x => x.course_no == course_no
                                && x.last_status == _config.GetValue<string>("Status:approved")).OrderBy(x => x.final_approved_at).ToListAsync();
                int _seq1 = 0;
                for (var j = 0; j < seq1.Count(); j++)
                {
                    var item1 = seq1[j];
                    _seq1 = _seq1 + 1;

                    var edits1 = _context.tr_course_registration.Where(x => x.course_no == course_no && x.emp_no == item1.emp_no).FirstOrDefault();
                    edits1.seq_no = _seq1;
                    list1.Add(edits1);
                }
                _context.tr_course_registration.UpdateRange(list1);
                await _context.SaveChangesAsync();
                /////////// ทำการเรียงลำดับ ที่ไม่ใช่สถานะ approved, เรียงลำดับตาม register_at
                List<tr_course_registration> list2 = new List<tr_course_registration>();
                var seq2 = await _context.tr_course_registration.Where(x => x.course_no == course_no
                                && x.last_status != _config.GetValue<string>("Status:approved")).OrderBy(x => x.register_at).ToListAsync();
                int _seq2 = _seq1;
                for (var k = 0; k < seq2.Count(); k++)
                {
                    var item2 = seq2[k];
                    _seq2 = _seq2 + 1;

                    var edits2 = _context.tr_course_registration.Where(x => x.course_no == course_no && x.emp_no == item2.emp_no).FirstOrDefault();
                    edits2.seq_no = _seq2;
                    list2.Add(edits2);
                }
                _context.tr_course_registration.UpdateRange(list2);
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

        // POST: api/Registration
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<tr_course_registration>> Posttr_course_registration(req_tr_course_registration model)
        {
            int seq = 0;
            var query = await _context.tr_course_registration.Where(x => x.course_no == model.course_no && x.emp_no == model.emp_no).FirstOrDefaultAsync();
            if (query != null)
            {
                return Conflict(_config.GetValue<string>("Text:duplication"));
            }
            else
            {
                var last = await _context.tr_course_registration.Where(x => x.course_no == model.course_no).OrderByDescending(x => x.seq_no).FirstOrDefaultAsync();
                if (last == null)
                {
                    seq = 1;
                }
                else
                {
                    seq = last.seq_no + 1;
                }

                tr_course_registration tb = new tr_course_registration();
                tb.course_no = model.course_no;
                tb.emp_no = model.emp_no;
                tb.seq_no = seq;
                tb.last_status = model.last_status;
                tb.remark = model.remark;
                tb.register_at = DateTime.Now;
                tb.register_by = User.FindFirst("emp_no").Value;

                _context.tr_course_registration.Add(tb);
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction("Gettr_course_registration", new { course_no = model.course_no }, model);
        }

        // DELETE: api/Registration/{course_no}/{emp_no}/{capacity}
        [HttpDelete("{course_no}/{emp_no}/{capacity}")]
        public async Task<IActionResult> Deletetr_course_registration(string course_no, string emp_no, int capacity)
        {
            var tr_course_registration = await _context.tr_course_registration.Where(x => x.course_no == course_no && x.emp_no == emp_no).FirstOrDefaultAsync();
            if (tr_course_registration == null)
            {
                return NotFound();
            }

            _context.tr_course_registration.Remove(tr_course_registration);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool tr_course_registrationExists(string course_no)
        {
            return _context.tr_course_registration.Any(e => e.course_no == course_no);
        }

        // POST: api/Registration/UploadCourseRegistration/{course_no}
        [HttpPost("UploadCourseRegistration/{course_no}")]
        public async Task<ActionResult<IEnumerable<tr_course_registration>>> UploadCourseRegistration(string course_no, [FromForm] req_fileform model)
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

            List<respons_course_registration> respons = new List<respons_course_registration>();
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

                            var query_emp = await _context.tb_employee.Where(x => x.emp_no == _emp_no).FirstOrDefaultAsync();
                            if (query_emp.dept_abb == model.dept_abb)
                            {
                                var query_course = await _context.tr_course_band.Where(x => x.course_no == course_no && x.band.Contains(query_emp.band)).FirstOrDefaultAsync();
                                if (query_course != null)
                                {
                                    var query_seq = await _context.tr_course_registration.Where(x => x.course_no == course_no).OrderByDescending(x => x.seq_no).FirstOrDefaultAsync();
                                    if (query_seq == null)
                                    {
                                        _seq_no = 1;
                                    }
                                    else
                                    {
                                        _seq_no = query_seq.seq_no + 1;
                                    }

                                    _last_status = _seq_no > model.capacity ? _config.GetValue<string>("Status:wait") : null; // Check
                                    var query = await _context.tr_course_registration.Where(x => x.course_no == course_no && x.emp_no == _emp_no).FirstOrDefaultAsync();
                                    if (query == null)
                                    {
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
                                    else
                                    {
                                        respons.Add(new respons_course_registration
                                        {
                                            emp_no = _emp_no,
                                            seq_no = ws_seq_no,
                                            last_status = _config.GetValue<string>("Text:duplication")
                                        });
                                    } // Duplication Data. : emp_no ของพนักงานใน row มีข้อมูลใน course อยู่แล้ว
                                }
                                else
                                {
                                    respons.Add(new respons_course_registration
                                    {
                                        emp_no = _emp_no,
                                        seq_no = ws_seq_no,
                                        last_status = _config.GetValue<string>("Text:unequal_band")
                                    });
                                } // Unequal band. : band ของพนักงานใน row ไม่ตรงกับที่ band ที่ตั้งค่า course
                            }
                            else
                            {
                                respons.Add(new respons_course_registration
                                {
                                    emp_no = _emp_no,
                                    seq_no = ws_seq_no,
                                    last_status = _config.GetValue<string>("Text:invalid_department")
                                });
                            } // Invalid department. : dept ของพนักงานใน row ไม่ตรงกับที่ dept login
                        }
                    }
                }
            }
            System.IO.File.Delete(filePath);  //Delete file

            return Ok(respons);
        }

    }
}

public class req_tr_course_registration
{
    public string course_no { get; set; }
    public string emp_no { get; set; }
    public int seq_no { get; set; }
    public string last_status { get; set; }
    public string remark { get; set; }
    public bool? manager_approved_checked { get; set; }
    public bool? final_approved_checked { get; set; }
    public int capacity { get; set; }
    public string dept_abb { get; set; }
    public List<req_array_regis> array { get; set; }
}

public class req_array_regis
{
    public string course_no { get; set; }
    public string emp_no { get; set; }
    public int seq_no { get; set; }
    public string last_status { get; set; }
    public string remark { get; set; }
    public bool? manager_approved_checked { get; set; }
    public bool? final_approved_checked { get; set; }
    public int position { get; set; }
}

public class req_fileform
{
    public IFormFile file_form { get; set; }
    public string file_name { get; set; }
    public string dept_abb { get; set; }
    public int capacity { get; set; }
}

public class respons_course_registration
{
    public int seq_no { get; set; }
    public string emp_no { get; set; }
    public string last_status { get; set; }
}