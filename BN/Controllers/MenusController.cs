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
        [AllowAnonymous]
        [HttpGet("Mock")]
        public async Task<ActionResult<IEnumerable<tb_menus>>> Menu()
        {
            string filePath = Path.Combine("./wwwroot/", $"Mockdata.xlsx");

            if(System.IO.File.Exists(filePath)){
                Console.WriteLine("File exists.");
                using(var package = new ExcelPackage(new FileInfo(filePath)))
                {
                    ExcelWorksheet worksheet = package.Workbook.Worksheets["tb_menus"];
                    int rowCount = worksheet.Dimension.Rows;
                    int colCount = worksheet.Dimension.Columns;
                    for (int row = 2; row <= rowCount; row++){
                        _context.Add(new tb_menus
                        {
                            menu_name = worksheet.Cells[row, 2].Value.ToString().Trim()==null ? null:worksheet.Cells[row, 2].Value.ToString().Trim(),
                            parent_menu_code = worksheet.Cells[row, 3].Value==null?null:int.Parse(worksheet.Cells[row, 3].Value.ToString().Trim()),
                            description = worksheet.Cells[row, 4].Value==null?null:worksheet.Cells[row, 4].Value.ToString().Trim(),
                            url = worksheet.Cells[row, 5].Value==null?null:worksheet.Cells[row, 5].Value.ToString().Trim(),
                            updated_at = DateTime.Now,
                            updated_by= worksheet.Cells[row, 11].Value==null?null:worksheet.Cells[row, 11].Value.ToString().Trim(),
                        });
                        await _context.SaveChangesAsync();
                    }
               }
            }
            return await _context.tb_menus
                            .Include(e => e.children)
                            .ToListAsync();  
        }
    }
}