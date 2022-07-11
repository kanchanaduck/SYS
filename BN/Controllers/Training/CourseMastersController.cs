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

        // GET: api/CourseMasters/Owner/{org_code}
        // GET: api/CourseMasters/Owner/55
        // GET: api/CourseMasters/Owner/5510
        [HttpGet("Owner/{org_code}")]
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

        // GET: api/CourseMasters/GetBand
        [HttpGet("GetBand")]
        public async Task<ActionResult<IEnumerable<tb_band>>> GetBand()
        {
            return await _context.tb_band.ToListAsync();
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
    }
}