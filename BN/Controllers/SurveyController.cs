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
using OfficeOpenXml.Style;

namespace api_hrgis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SurveyController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SurveyController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Survey
        [HttpGet]
        public async Task<ActionResult<IEnumerable<tr_survey_setting>>> get_survey_setting()
        {
            return await _context.tr_survey_setting.ToListAsync();
        }

        // GET: api/Survey/2023
        [HttpGet("{year}")]
        public async Task<ActionResult<tr_survey_setting>> get_survey_setting(string year)
        {
            var tr_survey_setting = await _context.tr_survey_setting.FindAsync(year);

            if (tr_survey_setting == null)
            {
                return NotFound();
            }

            return tr_survey_setting;
        }

        // GET: api/Survey/2023/Org/55
        // GET: api/Survey/2023/Org/5510
        [HttpGet("{year}/Org/{org_code}")]
        public async Task<ActionResult<tr_survey_setting>> get_course_survey_from_org(string year, string org_code)
        {
            var tr_survey_setting = await _context.tr_survey_setting
                                .Where(e=>e.year==year && e.org_code==org_code)
                                .AsNoTracking()
                                .FirstOrDefaultAsync();

            if (tr_survey_setting == null)
            {
                return NotFound();
            }

            return tr_survey_setting;
        }

        // GET: api/Survey/2023/Org/55
        // GET: api/Survey/2023/Org/5510
        [HttpGet("Excel/{year}/Org/{org_code}")]
        public async Task<ActionResult<tr_survey_setting>> download_excel(string year, string org_code)
        {
            var tr_survey_setting = await _context.tr_survey_setting
                                .Where(e=>e.year==year && e.org_code==org_code)
                                .AsNoTracking()
                                .FirstOrDefaultAsync();

            if (tr_survey_setting == null)
            {
                return NotFound("Survey is currently closed");
            }

            var courses = await _context.tr_course_master
                                .Where(e=> e.org_code==org_code)
                                .AsNoTracking()
                                .ToListAsync();
          
            var employees = await _context.tb_employee
                            .Include(e => e.courses_registrations)
                            .Where(e => (e.div_code==org_code || e.dept_code==org_code) && (e.resign_date==null ||e.resign_date > DateTime.Today))
                            .AsNoTracking()
                            .ToListAsync();

            var time = DateTime.Now.ToString("yyyyMMddHHmmss");
            var fileName = $"NeedSurveyFormat_{time}.xlsx";
            var filepath = $"wwwroot/excel/Survey/{fileName}";
            var originalFileName = $"NeedSurveyFormat.xlsx";
            var originalFilePath = $"wwwroot/excel/Survey/{originalFileName}";

            using(var package = new ExcelPackage(new FileInfo(originalFilePath)))
            {
                ExcelWorksheet worksheet = package.Workbook.Worksheets["survey"];

                int start_row=3; int start_col=9;

                foreach (var item in employees)
                {
                    worksheet.Cells[start_row, 1].Value = item.emp_no; 
                    worksheet.Cells[start_row, 2].Value = item.title_name_en; 
                    worksheet.Cells[start_row, 3].Value = item.firstname_en; 
                    worksheet.Cells[start_row, 4].Value = item.lastname_en; 
                    worksheet.Cells[start_row, 5].Value = item.div_abb; 
                    worksheet.Cells[start_row, 6].Value = item.dept_abb; 
                    worksheet.Cells[start_row, 7].Value = item.band; 
                    worksheet.Cells[start_row, 8].Value = item.position_name_en; 
                    start_row++;
                }

                foreach (var item in courses)
                {
                    worksheet.Cells[2, start_col].Value = item.course_no+" "+item.course_name_th;
                    start_col++;
                }

                int last_row = worksheet.Dimension.End.Row; 
                Console.WriteLine(last_row);
                int last_col = worksheet.Dimension.End.Column;   
                Console.WriteLine(last_col);

                var last_cell_address = worksheet.Cells.Last(c => c.Start.Row == last_row);
                Console.WriteLine(last_cell_address.Address);


                string modelRange = "A2:"+ last_cell_address;
                Console.WriteLine(modelRange);
                var modelTable = worksheet.Cells[modelRange];

                // Assign borders
                modelTable.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                modelTable.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                modelTable.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                modelTable.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;


                // Fill worksheet with data to export
                modelTable.AutoFitColumns();
                
                package.SaveAs(new FileInfo(filepath));
                package.Dispose();
            }  

            byte[] fileBytes = System.IO.File.ReadAllBytes(filepath);
            return File(fileBytes, "application/x-msdownload", fileName); 
        }

        // PUT: api/Survey/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> Puttr_survey_setting(string id, tr_survey_setting tr_survey_setting)
        {
            if (id != tr_survey_setting.year)
            {
                return BadRequest();
            }

            _context.Entry(tr_survey_setting).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!tr_survey_settingExists(id))
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

        // POST: api/Survey
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<tr_survey_setting>> Posttr_survey_setting(tr_survey_setting tr_survey_setting)
        {
            _context.tr_survey_setting.Add(tr_survey_setting);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (tr_survey_settingExists(tr_survey_setting.year))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("Gettr_survey_setting", new { id = tr_survey_setting.year }, tr_survey_setting);
        }

        // DELETE: api/Survey/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Deletetr_survey_setting(string id)
        {
            var tr_survey_setting = await _context.tr_survey_setting.FindAsync(id);
            if (tr_survey_setting == null)
            {
                return NotFound();
            }

            _context.tr_survey_setting.Remove(tr_survey_setting);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool tr_survey_settingExists(string id)
        {
            return _context.tr_survey_setting.Any(e => e.year == id);
        }
    }
}
