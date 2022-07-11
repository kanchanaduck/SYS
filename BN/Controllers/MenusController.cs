using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api_hrgis.Data;
using api_hrgis.Models;
using Microsoft.AspNetCore.Cors;
using System.IO;
using OfficeOpenXml;
using Microsoft.AspNetCore.Authorization;

namespace api_hrgis.Controllers
{
    [Authorize]    
    [EnableCors("_myAllowSpecificOrigins")]
    [Route("api/[controller]")]
    [ApiController]
    public class MenusController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MenusController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Menus
        [HttpGet]
        public async Task<ActionResult<IEnumerable<tb_menus>>> Gettb_menus()
        {
            // return await _context.tb_menus.ToListAsync();
            var menu = await _context.tb_menus
                            // .Include(e => e.children)
                            .Where(e => e.parent_menu_code==null)
                            .OrderBy(e=>e.menu_name)
                            .AsNoTracking()
                            .ToListAsync();      

            if (menu.Count <= 0)
            {
                return NotFound();
            }

            return menu;
        }
        // GET: api/Menus/children/<parent_menu_code>
        [HttpGet("children/{id}")]
        public async Task<ActionResult<IEnumerable<tb_menus>>> GetMenuChildren(int id)
        {
            var menu = await _context.tb_menus
                                .Include(e => e.children
                                    .OrderBy(e => e.menu_name)
                                )
                                .Where(e => e.parent_menu_code == id )
                                .OrderBy(e => e.menu_name)
                                .AsNoTracking()
                                .ToListAsync();
           
            if (menu.Count <= 0)
            {
                return NotFound();
            }

            return menu;
        }

        // GET: api/Menus/5
        [HttpGet("{id}")]
        public async Task<ActionResult<tb_menus>> Gettb_menus(int id)
        {
            var tb_menus = await _context.tb_menus.Include(e => e.children)
                        .Where(e => e.parent_menu_code == id )
                                .AsNoTracking().FirstAsync();

            if (tb_menus == null)
            {
                return NotFound();
            }

            return tb_menus;
        }

        // PUT: api/Menus/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> Puttb_menus(int id, tb_menus tb_menus)
        {
            if (id != tb_menus.menu_code)
            {
                return BadRequest();
            }

            _context.Entry(tb_menus).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!tb_menusExists(id))
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

        // POST: api/Menus
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<tb_menus>> Posttb_menus(tb_menus tb_menus)
        {
            _context.tb_menus.Add(tb_menus);
            await _context.SaveChangesAsync();

            return CreatedAtAction("Gettb_menus", new { id = tb_menus.menu_code }, tb_menus);
        }

        // DELETE: api/Menus/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Deletetb_menus(int id)
        {
            var tb_menus = await _context.tb_menus.FindAsync(id);
            if (tb_menus == null)
            {
                return NotFound();
            }

            _context.tb_menus.Remove(tb_menus);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool tb_menusExists(int id)
        {
            return _context.tb_menus.Any(e => e.menu_code == id);
        }
    }
}