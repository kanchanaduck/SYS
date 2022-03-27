using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
using api_hrgis.Data;
using api_hrgis.Models;

namespace api_hrgis.Controllers
{
    [Authorize] // Microsoft.AspNetCore.Authorization; // [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class RegisterScoreController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config; // using Microsoft.Extensions.Configuration;

        public RegisterScoreController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // GET: api/RegisterScore
        [HttpGet]
        public async Task<ActionResult<IEnumerable<tr_course_registration>>> Getcourse_score()
        {
            return await _context.tr_course_registration
                       .Include(e => e.courses)
                       .Include(e => e.employees)
                       .OrderBy(x => x.course_no).ThenBy(x => x.emp_no).ToListAsync();
        }

        // GET: api/RegisterScore/5
        [HttpGet("{id}")]
        public async Task<ActionResult<tr_course_registration>> Get_course_score(string id)
        {
            var course_score = await _context.tr_course_registration
                        .Include(e => e.courses)
                        .Include(e => e.employees)
                        .Where(e => e.course_no == id
                        //&& e.register_by == User.FindFirst("emp_no").Value
                         && e.last_status == _config.GetValue<string>("Status:approved"))
                        .OrderBy(x => x.emp_no).ToListAsync();

            if (course_score.Count() < 0)
            {
                return NotFound();
            }

            return Ok(course_score);
        }

        // GET: api/RegisterScore/GetContinuous/5
        [HttpGet("GetContinuous/{id}")]
        public async Task<ActionResult<tr_course_registration>> GetContinuous(string id)
        {
            var course_score = await _context.tr_course_registration
                        .Include(e => e.courses)
                        .Include(e => e.employees)
                        .Where(e => e.course_no == id
                        && e.register_by == User.FindFirst("emp_no").Value
                        && e.last_status == _config.GetValue<string>("Status:approved"))
                        .OrderBy(x => x.emp_no).ToListAsync();

            if (course_score.Count() < 0)
            {
                return NotFound();
            }

            return Ok(course_score);
        }

        // PUT: api/RegisterScore/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> Puttr_course_registration(string id, req_tr_course_score model)
        {
            if (id != model.course_no)
            {
                return BadRequest();
            }

            try
            {
                var query = await _context.tr_course_registration.Where(x => x.course_no == id && x.emp_no == model.array[0].emp_no).FirstOrDefaultAsync();
                if (query != null)
                {
                    query.pre_test_score = model.array[0].pre_test_score;
                    query.pre_test_grade = model.array[0].pre_test_grade;
                    query.post_test_score = model.array[0].post_test_score;
                    query.post_test_grade = model.array[0].post_test_grade;
                    query.scored_at = DateTime.Now;
                    query.scored_by = User.FindFirst("emp_no").Value;
                    await _context.SaveChangesAsync();
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!course_scoreExists(id))
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

        // POST: api/RegisterScore
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<tr_course_registration>> Post_course_score(req_tr_course_score model)
        {
            try
            {
                int seq = 0;
                List<tr_course_registration> list = new List<tr_course_registration>();
                for (int i = 0; i < model.array.Count(); i++)
                {
                    var item = model.array[i];
                    var query = await _context.tr_course_registration.Where(x => x.course_no == model.course_no
                    && x.emp_no == item.emp_no).FirstOrDefaultAsync();
                    if (query != null)
                    {
                        return Conflict(_config.GetValue<string>("Text:duplication"));
                    }
                    else
                    {
                        var last = await _context.tr_course_registration.Where(x => x.course_no == model.course_no)
                        .OrderByDescending(x => x.seq_no).FirstOrDefaultAsync();
                        if (last == null)
                        {
                            seq = 1;
                        }
                        else
                        {
                            seq = last.seq_no + 1;
                        }
                    }

                    tr_course_registration tb = new tr_course_registration();
                    tb.course_no = model.course_no;
                    tb.emp_no = item.emp_no;
                    tb.seq_no = seq;
                    tb.pre_test_score = item.pre_test_score==null? null:item.pre_test_score;
                    tb.pre_test_grade = item.pre_test_grade;
                    tb.post_test_score = item.post_test_score==null? null:item.post_test_score;
                    tb.post_test_grade = item.post_test_grade;
                    tb.last_status = _config.GetValue<string>("Status:approved");
                    tb.remark = _config.GetValue<string>("Text:papers");
                    tb.register_at = DateTime.Now;
                    tb.register_by = User.FindFirst("emp_no").Value;
                    tb.scored_at = DateTime.Now;
                    tb.scored_by = User.FindFirst("emp_no").Value;
                    list.Add(tb);
                }
                await _context.tr_course_registration.AddRangeAsync(list);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (course_scoreExists(model.course_no))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("Getcourse_score", new { id = model.course_no }, model);
        }

        // POST: api/RegisterScore/Continuous
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("Continuous")]
        public async Task<ActionResult<tr_course_registration>> PostContinuous(req_tr_course_score model)
        {
            try
            {
                int seq = 0;
                List<tr_course_registration> list = new List<tr_course_registration>();
                for (int i = 0; i < model.array.Count(); i++)
                {
                    var item = model.array[i];
                    var query = await _context.tr_course_registration.Where(x => x.course_no == model.course_no
                    && x.emp_no == item.emp_no).FirstOrDefaultAsync();
                    if (query != null)
                    {
                        return Conflict(_config.GetValue<string>("Text:duplication"));
                    }
                    else
                    {
                        var last = await _context.tr_course_registration.Where(x => x.course_no == model.course_no)
                        .OrderByDescending(x => x.seq_no).FirstOrDefaultAsync();
                        if (last == null)
                        {
                            seq = 1;
                        }
                        else
                        {
                            seq = last.seq_no + 1;
                        }
                    }

                    tr_course_registration tb = new tr_course_registration();
                    tb.course_no = model.course_no;
                    tb.emp_no = item.emp_no;
                    tb.seq_no = seq;
                    tb.pre_test_score = item.pre_test_score;
                    tb.pre_test_grade = item.pre_test_grade;
                    tb.post_test_score = item.post_test_score;
                    tb.post_test_grade = item.post_test_grade;
                    tb.last_status = _config.GetValue<string>("Status:approved");
                    tb.remark = _config.GetValue<string>("Text:continuous");
                    tb.register_at = DateTime.Now;
                    tb.register_by = User.FindFirst("emp_no").Value;
                    tb.scored_at = DateTime.Now;
                    tb.scored_by = User.FindFirst("emp_no").Value;
                    list.Add(tb);
                    await _context.tr_course_registration.AddRangeAsync(list);
                    await _context.SaveChangesAsync();
                }
            }
            catch (DbUpdateException)
            {
                if (course_scoreExists(model.course_no))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("Getcourse_score", new { id = model.course_no }, model);
        }

        // DELETE: api/RegisterScore/5
        [HttpDelete("{course_no}/{emp_no}")]
        public async Task<IActionResult> Deletecourse_score(string course_no, string emp_no)
        {
            var course_score = await _context.tr_course_registration.Where(x => x.course_no == course_no && x.emp_no == emp_no).FirstOrDefaultAsync();
            if (course_score == null)
            {
                return NotFound();
            }

            _context.tr_course_registration.Remove(course_score);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool course_scoreExists(string id)
        {
            return _context.tr_course_registration.Any(e => e.course_no == id);
        }

        // POST: api/RegisterScore/UploadCourseScore/{course_no}
        [HttpPost("UploadCourseScore/{course_no}")]
        public async Task<ActionResult<IEnumerable<tr_course_registration>>> UploadCourseScore(string course_no, [FromForm] req_score_fileform model)
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

            List<respons_score> respons = new List<respons_score>();
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
                        if (!String.IsNullOrEmpty(worksheet.Cells[row, 1].Value.ToString().Trim())) // ถ้ามี error ให้ตรวจ rowCount กับ แถวสุดท้าย ตรงกันไหม : จะเป็น error ของค่าว่างของแถวสุดท้ายลงไป
                        {
                            string _emp_no = worksheet.Cells[row, 1].Value == null ? null : worksheet.Cells[row, 1].Value.ToString().Trim();
                            string pre_test_score = worksheet.Cells[row, 2].Value == null ? null : worksheet.Cells[row, 2].Value.ToString().Trim();;
                            string post_test_score = worksheet.Cells[row, 3].Value == null ? null : worksheet.Cells[row, 3].Value.ToString().Trim();;
                            // ต้องคำนวนเกรด

                            int _seq_no = 0;

                            var query_emp = await _context.tb_employee.Where(x => x.emp_no == _emp_no).FirstOrDefaultAsync();
                            // if (query_emp.dept_abb == model.dept_abb)
                            // {
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

                                    var query = await _context.tr_course_registration.Where(x => x.course_no == course_no && x.emp_no == _emp_no).FirstOrDefaultAsync();
                                    if (query == null)
                                    {
                                        string _grade_pre = fnGrade(pre_test_score);
                                        string _grade_post = fnGrade(post_test_score);
                                        if (_grade_pre != "Fail" && _grade_post != "Fail")
                                        {
                                            _context.Add(new tr_course_registration
                                            {
                                                course_no = course_no,
                                                emp_no = _emp_no,
                                                seq_no = _seq_no,
                                                pre_test_score = Convert.ToInt32(pre_test_score),
                                                pre_test_grade = _grade_pre,
                                                post_test_score = Convert.ToInt32(post_test_score),
                                                post_test_grade = _grade_post,
                                                last_status = _config.GetValue<string>("Status:approved"),
                                                remark = _config.GetValue<string>("Text:papers"),
                                                register_at = DateTime.Now,
                                                register_by = User.FindFirst("emp_no").Value,
                                                scored_at = DateTime.Now,
                                                scored_by = User.FindFirst("emp_no").Value
                                            });
                                            await _context.SaveChangesAsync();
                                        }
                                        else
                                        {
                                            respons.Add(new respons_score
                                            {
                                                emp_no = _emp_no,
                                                pre_test_score = Convert.ToInt32(pre_test_score),
                                                post_test_score = Convert.ToInt32(post_test_score),
                                                last_status = _config.GetValue<string>("Text:score_incorrect")
                                            });
                                        } // Score incorrect. : คะแนนที่กรอกมาคำนวนไม่ได้
                                    }
                                    else
                                    {
                                        
                                        query.emp_no = _emp_no;
                                        query.pre_test_score = pre_test_score==null? null:Convert.ToInt32(pre_test_score);
                                        query.pre_test_grade = pre_test_score==null? null:fnGrade(pre_test_score);
                                        query.post_test_score = post_test_score==null? null:Convert.ToInt32(post_test_score);
                                        query.post_test_grade = post_test_score==null? null:fnGrade(post_test_score);
                                        query.last_status = _config.GetValue<string>("Status:approved");
                                        query.scored_at = DateTime.Now;
                                        query.scored_by = User.FindFirst("emp_no").Value;
                                        _context.Entry(query).State = EntityState.Modified;
                                        await _context.SaveChangesAsync(); 
                                        
                                    } // Duplication Data. : emp_no ของพนักงานใน row มีข้อมูลใน course อยู่แล้ว
                                }
                                else
                                {
                                    respons.Add(new respons_score
                                    {
                                        emp_no = _emp_no,
                                        pre_test_score = pre_test_score==null? null:Convert.ToInt32(pre_test_score),
                                        pre_test_grade = pre_test_score==null? null:fnGrade(pre_test_score),
                                        post_test_score = post_test_score==null? null:Convert.ToInt32(post_test_score),
                                        post_test_grade = post_test_score==null? null:fnGrade(post_test_score),
                                        last_status = _config.GetValue<string>("Text:unequal_band")
                                    });
                                } // Unequal band. : band ของพนักงานใน row ไม่ตรงกับที่ band ที่ตั้งค่า course
                            // }
                            // else
                            // {
                            //     respons.Add(new respons_score
                            //     {
                            //         emp_no = _emp_no,
                            //         pre_test_score = Convert.ToInt32(pre_test_score),
                            //         post_test_score = Convert.ToInt32(post_test_score),
                            //         last_status = _config.GetValue<string>("Text:invalid_department")
                            //     });
                            // } // Invalid department. : dept ของพนักงานใน row ไม่ตรงกับที่ dept login
                        }
                    }
                }
            }
            System.IO.File.Delete(filePath);  //Delete file

            return Ok(respons);
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

public class req_tr_course_score
{
    public string course_no { get; set; }
    public List<array_tr_course_score> array { get; set; }
}

public class array_tr_course_score
{
    public string emp_no { get; set; }
    public int? pre_test_score { get; set; }
    public string pre_test_grade { get; set; }
    public int? post_test_score { get; set; }
    public string post_test_grade { get; set; }
}

public class req_score_fileform
{
    public IFormFile file_form { get; set; }
    public string file_name { get; set; }
    public string dept_abb { get; set; }
}

public class respons_score
{
    public string emp_no { get; set; }
    public int? pre_test_score { get; set; }
    public string pre_test_grade { get; set; }
    public int? post_test_score { get; set; }
    public string post_test_grade { get; set; }
    public string last_status { get; set; }
}