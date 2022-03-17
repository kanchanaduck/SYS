using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api_hrgis.Data;
using api_hrgis.Models;
using Microsoft.AspNetCore.Authorization;

namespace api_hrgis.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class StakeholderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StakeholderController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Stakeholder
        [HttpGet]
        public async Task<ActionResult<IEnumerable<tb_organization>>> Gettr_stakeholder()
        {
            // return await _context.tr_stakeholder.ToListAsync();
            return await _context.tb_organization
                            .Include(e => e.parent_org)
                            .Include(e => e.stakeholders)
                            .ThenInclude(p => p.employee)
                            .AsNoTracking()
                            .Where(e => e.level_name.ToUpper()=="DEPARTMENT" || e.level_name.ToUpper()=="DIVISION")
                            .ToListAsync();
        }

        // GET: api/Stakeholder/55
        // GET: api/Stakeholder/5510
        [HttpGet("{org_code}")]
        public async Task<ActionResult<tb_organization>> get_stakeholder_by_org_code(string org_code)
        {
            var tr_stakeholder = await _context.tb_organization
                                    .Include(e => e.stakeholders)
                                    .ThenInclude(p => p.employee)
                                    .AsNoTracking()
                                    .Where(e => e.org_code==org_code)
                                    .FirstOrDefaultAsync();

            if (tr_stakeholder == null)
            {
                return NotFound();
            }

            return tr_stakeholder;
        }

        // GET: api/Stakeholder/Org/55
        // GET: api/Stakeholder/Org/5510
        [HttpGet("Org/{org_code}")]
        public async Task<ActionResult<tb_organization>> get_stakeholder_by_organization(string org_code)
        {
            var tr_stakeholder = await _context.tb_organization
                                    .Include(e => e.stakeholders)
                                    .ThenInclude(p => p.employee)
                                    .AsNoTracking()
                                    .Where(e => e.org_code==org_code)
                                    .FirstOrDefaultAsync();

            if (tr_stakeholder == null)
            {
                return NotFound();
            }

            return tr_stakeholder;
        }
        // GET: api/Stakeholder/Employee/000001
        [HttpGet("Employee/{emp_no}")]
        public async Task<ActionResult<tr_stakeholder>> get_stakeholder_by_emp_no(string emp_no)
        {
            var tr_stakeholder = await _context.tr_stakeholder
                                    .Include(e => e.organization)
                                    .AsNoTracking()
                                    .Where(e => e.emp_no == emp_no) 
                                    .FirstOrDefaultAsync();

            if (tr_stakeholder == null)
            {
                return NotFound();
            }

            return tr_stakeholder;
        }
        // GET: api/Stakeholder/Committee/000001
        [HttpGet("Committee/{emp_no}")]
        public async Task<ActionResult<tr_stakeholder>> get_committee_by_emp_no(string emp_no)
        {
            var tr_stakeholder = await _context.tr_stakeholder
                                    .Include(e => e.organization)
                                    .AsNoTracking()
                                    .Where(e => e.emp_no == emp_no && e.role.ToUpper() == "COMMITTEE") 
                                    .FirstOrDefaultAsync();

            if (tr_stakeholder == null)
            {
                return NotFound();
            }

            return tr_stakeholder;
        }
        // GET: api/Stakeholder/Approver/000001
        [HttpGet("Approver/{emp_no}")]
        public async Task<ActionResult<tr_stakeholder>> get_approver_by_emp_no(string emp_no)
        {
            var tr_stakeholder = await _context.tr_stakeholder
                                    .Include(e => e.organization)
                                    .AsNoTracking()
                                    .Where(e => e.emp_no == emp_no && e.role.ToUpper() == "APPROVER") 
                                    .FirstOrDefaultAsync();

            if (tr_stakeholder == null)
            {
                return NotFound();
            }

            return tr_stakeholder;
        }
        // POST: api/Stakeholder/Reset/55
        // POST: api/Stakeholder/Reset/5510
        [HttpPost("Reset/{org_code}")]
        public async Task<ActionResult<tr_stakeholder>> reset_stakeholder(String org_code)
        {
            if(!user_is_center()){
                return StatusCode(403,"Permission denied, only center can manage data");
            }
            var stakeholder = await _context.tr_stakeholder
                            .Where(e => e.org_code==org_code)
                            .ToListAsync();

            if (stakeholder == null)
            {
                return NotFound();
            }

            _context.tr_stakeholder.RemoveRange(stakeholder);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Stakeholder
        [HttpPost]
        public async Task<ActionResult<tr_stakeholder>> Posttr_stakeholder(List<tr_stakeholder> tr_stakeholder)
        {
            if(!user_is_center()){
                return StatusCode(403,"Permission denied, only center can manage data");
            }
            String error_text = "";

            string org_code = tr_stakeholder[0].org_code;

            Console.WriteLine(org_code);
            var org  = await _context.tb_organization
                            .Include(c => c.children_org)
                            .Where(c => c.org_code == org_code)
                            .AsNoTracking()
                            .FirstOrDefaultAsync();

            if(org==null)
            {
                return NotFound("Organization is not found");
            }
            else
            {
                if(org.level_name.ToUpper()=="DIVISION")
                {
                    Console.WriteLine("DIVISION");
                    var c = new List<string>();
                    foreach (var item in org.children_org)
                    {
                        c.Add(item.org_code);
                    }
                    Console.WriteLine("COUNT CHILDREN: "+ c.Count());
                    
                    var have_stakeholder = _context.tr_stakeholder
                                    .AsNoTracking()
                                    .Any(e => c.Contains(e.org_code));

                    if(have_stakeholder){
                        return Conflict("Cannot update stakeholder lists, conflict with children organization");
                    }
                }
                else if(org.level_name.ToUpper()=="DEPARTMENT")
                {
                    Console.WriteLine("DEPARTMENT");

                    var have_stakeholder = _context.tr_stakeholder
                                    .AsNoTracking()
                                    .Any(e => e.org_code==org.parent_org_code);
                    if(have_stakeholder)
                    {
                        return Conflict("Cannot update stakeholder lists, conflict with parent organization");
                    }
                }
                else
                {
                    return NotFound("Organization is not found");
                }
            }
            
            if(tr_stakeholder.Count()>0){

                var stakeholder = await _context.tr_stakeholder
                            .Where(e => e.org_code==tr_stakeholder[0].org_code)
                            .ToListAsync();
                _context.tr_stakeholder.RemoveRange(stakeholder);
                await _context.SaveChangesAsync();

                foreach(var a in tr_stakeholder){
                    if (stakeholder_exists(a.emp_no, a.org_code, a.role)){
                        error_text = error_text+$"{ErrorStakeholder(a.emp_no, a.org_code, a.role)}\n";
                    }
                    else{
                        a.created_at = DateTime.Now;
                        a.created_by = User.FindFirst("emp_no").Value;
                        a.updated_at = DateTime.Now;
                        a.updated_by = User.FindFirst("emp_no").Value;
                        _context.tr_stakeholder.Add(a);
                    }
                }                
                await _context.SaveChangesAsync();
            }

            if (error_text!=""){
                return Conflict(error_text);
            }

            return CreatedAtAction("Gettr_stakeholder", new { e = tr_stakeholder }, tr_stakeholder);
        }
        private bool stakeholder_exists(string emp_no, string org_code, string role)
        {
            return _context.tr_stakeholder.Any(e => e.emp_no == emp_no 
                        && e.org_code==org_code
                        && e.role==role);
        }
        private bool user_is_center()
        {
            string emp_no = User.FindFirst("emp_no").Value;
            return _context.tr_center.Any(e => e.emp_no == emp_no);
        }
        private string ErrorStakeholder(string emp_no, string org_code, string role)
        {
            return $"Employee no. {emp_no} in Organization {org_code} and role {role} is already exists";
        }
    }
}
