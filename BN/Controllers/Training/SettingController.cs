using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api_hrgis.Data;
using api_hrgis.Models;

namespace api_hrgis.Controllers_Training
{
    [Route("api/[controller]")]
    [ApiController]
    public class SettingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SettingController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Setting
        [HttpGet]
        public async Task<ActionResult<IEnumerable<tr_setting>>> Gettr_setting()
        {
            return await _context.tr_setting.ToListAsync();
        }

        // GET: api/Setting/5
        [HttpGet("{id}")]
        public async Task<ActionResult<tr_setting>> Gettr_setting(string id)
        {
            var tr_setting = await _context.tr_setting.FindAsync(id);

            if (tr_setting == null)
            {
                return NotFound();
            }

            return tr_setting;
        }

        // PUT: api/Setting/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> Puttr_setting(string id, tr_setting tr_setting)
        {
            if (id != tr_setting.menu)
            {
                return BadRequest();
            }

            tr_setting.updated_at = DateTime.Now;
            tr_setting.updated_by = User.FindFirst("emp_no").Value;
            _context.Entry(tr_setting).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!tr_settingExists(id))
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

        // POST: api/Setting
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<tr_setting>> Posttr_setting(tr_setting tr_setting)
        {
            
            tr_setting.created_at = DateTime.Now;
            tr_setting.created_by = User.FindFirst("emp_no").Value;
            _context.tr_setting.Add(tr_setting);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (tr_settingExists(tr_setting.menu))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("Gettr_setting", new { id = tr_setting.menu }, tr_setting);
        }

        // DELETE: api/Setting/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Deletetr_setting(string id)
        {
            var tr_setting = await _context.tr_setting.FindAsync(id);
            if (tr_setting == null)
            {
                return NotFound();
            }

            _context.tr_setting.Remove(tr_setting);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool tr_settingExists(string id)
        {
            return _context.tr_setting.Any(e => e.menu == id);
        }
    }
}
