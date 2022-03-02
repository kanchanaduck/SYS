using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api_hrgis.Data;
using api_hrgis.Models;
using System.IO;
using OfficeOpenXml;
using Microsoft.AspNetCore.Authorization;
using System.Data;

namespace api_hrgis.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EmployeesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Employees
        [HttpGet]
        public async Task<ActionResult<IEnumerable<tb_employee>>> GetEmployee()
        {
            return await _context.tb_employee.ToListAsync();
        }

        // GET: api/Employees/Course
        // GET: api/Employees/Course/55
        // GET: api/Employees/Course/5510
        // GET: api/Employees/Course/55/employed
        // GET: api/Employees/Course/5510/employed
        // GET: api/Employees/Course/55/resigned
        // GET: api/Employees/Course/5510/resigned
        [HttpGet("Course/{org_code}/{employed_status?}")]
        public async Task<ActionResult<IEnumerable<tb_employee>>> course_map(string org_code, string employed_status)
        {
            if(employed_status==null || employed_status=="")
            {
                return await _context.tb_employee
                            .Include(e => e.courses_registrations)
                            .Where(e => (e.div_code==org_code || e.dept_code==org_code))
                            .AsNoTracking()
                            .ToListAsync();
            }
            else if(employed_status.ToLower() == "employed")
            {
                return await _context.tb_employee
                            .Include(e => e.courses_registrations)
                            .Where(e => (e.div_code==org_code || e.dept_code==org_code) && (e.resign_date==null ||e.resign_date > DateTime.Today))
                            .AsNoTracking()
                            .ToListAsync();
            }
            else
            {
                return await _context.tb_employee
                            .Include(e => e.courses_registrations)
                            .Where(e => (e.div_code==org_code || e.dept_code==org_code) && (e.resign_date < DateTime.Today))
                            .AsNoTracking()
                            .ToListAsync();
            }
        }

        // GET: api/Employees/Organization/55
        // GET: api/Employees/Organization/5510
        // GET: api/Employees/Organization/55/employed
        // GET: api/Employees/Organization/5510/employed
        // GET: api/Employees/Organization/55/resigned
        // GET: api/Employees/Organization/5510/resigned
        [HttpGet("Organization/{org_code}/{employed_status?}")]
        public async Task<ActionResult<IEnumerable<tb_employee>>> get_employee_from_org(string org_code, string employed_status)
        {
            Console.WriteLine("Employed: "+employed_status);
            if(employed_status==null || employed_status==""){
                return await _context.tb_employee
                            .Where(e => (e.div_code==org_code || e.dept_code==org_code))
                            .AsNoTracking()
                            .ToListAsync();
            }
            else if(employed_status.ToLower() == "employed"){
                return await _context.tb_employee
                            .Where(e => (e.div_code==org_code || e.dept_code==org_code) && (e.resign_date==null ||e.resign_date >= DateTime.Today))
                            .AsNoTracking()
                            .ToListAsync();
            }
            else{
                return await _context.tb_employee
                            .Where(e => (e.div_code==org_code || e.dept_code==org_code) && (e.resign_date < DateTime.Today))
                            .AsNoTracking()
                            .ToListAsync();
            }
        }

        // GET: api/Employees/5
        [HttpGet("{id}")]
        public async Task<ActionResult<tb_employee>> GetEmployees(string id)
        {
            var employees = await _context.tb_employee.FindAsync(id);

            if (employees == null)
            {
                return NotFound("Data not found");
            }

            return employees;
        }

        // PUT: api/Employees/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmployees(string id, tb_employee employees)
        {
            if (id != employees.emp_no)
            {
                return BadRequest();
            }

            _context.Entry(employees).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmployeesExists(id))
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

        // POST: api/Employees
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<tb_employee>> PostEmployees(tb_employee employees)
        {
            _context.tb_employee.Add(employees);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (EmployeesExists(employees.emp_no))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetEmployees", new { id = employees.emp_no }, employees);
        }

        // DELETE: api/Employees/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployees(string id)
        {
            var employees = await _context.tb_employee.FindAsync(id);
            if (employees == null)
            {
                return NotFound("Data not found");
            }

            _context.tb_employee.Remove(employees);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EmployeesExists(string id)
        {
            return _context.tb_employee.Any(e => e.emp_no == id);
        }
    }
}