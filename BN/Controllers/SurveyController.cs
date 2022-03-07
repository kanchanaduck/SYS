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
using OfficeOpenXml.DataValidation;
using System.Globalization;
using Microsoft.AspNetCore.Authorization;

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
        // GET: api/Survey?status=open
        [HttpGet]
        public async Task<ActionResult<IEnumerable<tr_survey_setting>>> get_survey_setting(string status)
        {
            List<tr_survey_setting> tr_survey_setting  = null;

            if(status=="open"){
                tr_survey_setting = await _context.tr_survey_setting
                                    .Where(e => e.date_start<=DateTime.Now && DateTime.Now>=e.date_end)
                                    .Include(e=>e.organization)
                                    .AsNoTracking()
                                    .ToListAsync();
            }
            else{
                tr_survey_setting = await _context.tr_survey_setting
                                    .Include(e=>e.organization)
                                    .AsNoTracking()
                                    .ToListAsync();
            }

            if (tr_survey_setting == null)
            {
                return NotFound();
            }

            return tr_survey_setting;
        }

        // GET: api/Survey/year/2023
        // GET: api/Survey/year/2023?status=open
        [HttpGet("year/{year}")]
        public async Task<ActionResult<IEnumerable<tr_survey_setting>>> get_survey_from_year(string year, string status)
        {
            List<tr_survey_setting> tr_survey_setting  = null;

            if(status=="open"){
                tr_survey_setting = await _context.tr_survey_setting
                                    .Where(e => e.year==year && e.date_start<=DateTime.Now && DateTime.Now>=e.date_end)
                                    .Include(e=>e.organization)
                                    .AsNoTracking()
                                    .ToListAsync();
            }
            else{
                tr_survey_setting = await _context.tr_survey_setting
                                    .Where(e => e.year==year)
                                    .Include(e=>e.organization)
                                    .AsNoTracking()
                                    .ToListAsync();
            }

            if (tr_survey_setting == null)
            {
                return NotFound();
            }

            return tr_survey_setting;
        }

        // GET: api/Survey/org/2230
        // GET: api/Survey/org/2230?status=open
        [HttpGet("org/{org_code}")]
        public async Task<ActionResult<IEnumerable<tr_survey_setting>>> get_survey_from_org(string org_code, string status)
        {
            List<tr_survey_setting> tr_survey_setting  = null;
            if(status=="open"){
                tr_survey_setting =  await _context.tr_survey_setting
                                    .Where(e => e.org_code==org_code && e.date_start<=DateTime.Now && DateTime.Now>=e.date_end)
                                    .Include(e=>e.organization)
                                    .AsNoTracking()
                                    .ToListAsync();
            }
            else{
                tr_survey_setting =  await _context.tr_survey_setting
                                    .Where(e => e.org_code==org_code)
                                    .Include(e=>e.organization)
                                    .AsNoTracking()
                                    .ToListAsync();
            }

            if (tr_survey_setting == null)
            {
                return NotFound();
            }

            return tr_survey_setting;
        }

        // GET: api/Survey/year/2023/org/55
        // GET: api/Survey/year/2023/org/5510
        // GET: api/Survey/year/2023/org/55?status=open
        // GET: api/Survey/year/2023/org/5510?status=open
        [HttpGet("year/{year}/org/{org_code}")]
        public async Task<ActionResult<IEnumerable<tr_survey_setting>>> get_course_survey_from_org(string year, string org_code, string status)
        {
            List<tr_survey_setting> tr_survey_setting  = null;
            if(status=="open"){
                tr_survey_setting = await _context.tr_survey_setting
                                .Where(e=>e.year==year && e.org_code==org_code && e.date_start<=DateTime.Now && DateTime.Now>=e.date_end)
                                .Include(e=>e.organization)
                                .AsNoTracking()
                                .ToListAsync();
            }
            else{
                tr_survey_setting = await _context.tr_survey_setting
                                .Where(e=>e.year==year && e.org_code==org_code)
                                .Include(e=>e.organization)
                                .AsNoTracking()
                                .ToListAsync();
            }

            if (tr_survey_setting == null)
            {
                return NotFound();
            }

            return tr_survey_setting;
        }

        // GET: api/Survey/Excel/year/2023/Org/55/For/2230
        // GET: api/Survey/Excel/year/2023/Org/5510/For/2230
        [HttpGet("Excel/Year/{year}/Org/{org_code_emp}/For/{org_code_course}")]
        public async Task<ActionResult<tr_survey_setting>> download_excel(string year, string org_code_emp, string org_code_course)
        {
            var tr_survey_setting = await _context.tr_survey_setting
                                .Where(e=>e.year==year && e.org_code==org_code_course)
                                .Include(e=>e.organization)
                                .AsNoTracking()
                                .FirstOrDefaultAsync();

            if (tr_survey_setting == null)
            {
                return NotFound("Survey is currently closed");
            }

            var courses = await _context.tr_course_master
                                .Where(e=> e.org_code==org_code_course)
                                .AsNoTracking()
                                .ToListAsync();

            if (tr_survey_setting == null)
            {
                return NotFound(@"Not found course of {org_code_course}");
            }
          
            var employees = await _context.tb_employee
                            .Include(e => e.courses_registrations)
                            .Where(e => (e.div_code==org_code_emp || e.dept_code==org_code_emp) && (e.resign_date==null ||e.resign_date > DateTime.Today))
                            .AsNoTracking()
                            .ToListAsync();

            var organization = await _context.tb_organization
                            .Where(e => (e.org_code==org_code_emp || e.org_code==org_code_emp))
                            .FirstOrDefaultAsync();

            string org_abb = organization.org_abb;

            if (tr_survey_setting == null)
            {
                return NotFound(@"Not found  employees of {org_code_emp}");
            }

            var time = DateTime.Now.ToString("yyyyMMddHHmmss");
            var fileName = $"NeedSurveyFormat_{time}.xlsx";
            var filepath = $"wwwroot/excel/Survey/{fileName}";
            var originalFileName = $"NeedSurveyFormat.xlsx";
            var originalFilePath = $"wwwroot/excel/Survey/{originalFileName}";

            using(var package = new ExcelPackage(new FileInfo(originalFilePath)))
            {
                ExcelWorksheet worksheet = package.Workbook.Worksheets["survey"];

                worksheet.Cells[1, 1].Value = $"{org_abb} survey for {tr_survey_setting.organization.org_abb} {year}"; 

                int start_row=3; int start_col=9;

                foreach (var item in courses)
                {
                    worksheet.Cells[2, start_col].Value = item.course_no+" "+item.course_name_th;
                    start_col++;
                }

                // string last_cell_address = "";

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

                int last_row = worksheet.Dimension.End.Row; 
                Console.WriteLine(last_row);
                int last_col = worksheet.Dimension.End.Column;   
                Console.WriteLine(last_col);
               
                String last_cell_address = worksheet.Cells[last_row, last_col].Address;
                Console.WriteLine(last_cell_address); 

                // add a validation and set values
                var validation = worksheet.DataValidations.AddListValidation("I3:"+last_cell_address);
                validation.ShowErrorMessage = true;
                validation.ErrorStyle = ExcelDataValidationWarningStyle.warning;
                validation.ErrorTitle = "An invalid value was entered";
                validation.Error = "Select a value from the list";
                foreach(var month in month_list()){
                    validation.Formula.Values.Add(month);
                }
                Console.WriteLine("Added sheet for list validation with values");

                //Get range to add border
                string modelRange = "A2:"+ last_cell_address;
                Console.WriteLine(modelRange);
                var modelTable = worksheet.Cells[modelRange];

                // Assign borders
                modelTable.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                modelTable.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                modelTable.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                modelTable.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

                //Get range to width column
                modelRange = "9:"+ last_col;
                Console.WriteLine(modelRange);
                // modelTable = worksheet.Cells[modelRange];
                for (int i = 9; i < last_col; i++)
                {
                    worksheet.Column(i).Width = 9;
                }

                // Fill worksheet with data to export
                // modelTable.AutoFitColumns();
                
                package.SaveAs(new FileInfo(filepath));
                package.Dispose();
            }  

            byte[] fileBytes = System.IO.File.ReadAllBytes(filepath);
            return File(fileBytes, "application/x-msdownload", fileName); 
        }
        // POST: api/Survey/Upload
        [AllowAnonymous]
        [HttpPost("Upload")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> receive_survey(List<IFormFile> files)
        // public async Task<IActionResult> receive_survey([FromForm]IFormFile files)
        {
            var time = DateTime.Now.ToString("yyyyMMddHHmmss");
            long size = files.Sum(f => f.Length);
            string filePath = null;

            foreach (var formFile in files)
            {
                if (formFile.Length > 0)
                {
                    filePath = Path.Combine("./wwwroot/excel/Survey_Upload/", $"Survey_{time}.xlsx");
                    Console.WriteLine(filePath);
                    using (var stream = System.IO.File.Create(filePath))
                    {
                        await formFile.CopyToAsync(stream);
                    }
                }
            }

            if(System.IO.File.Exists(filePath)){
                Console.WriteLine("File exists.");
                using(var package = new ExcelPackage(new FileInfo(filePath)))
                {
                    ExcelWorksheet worksheet = package.Workbook.Worksheets[0];
                    int rowCount = worksheet.Dimension.Rows;
                    int colCount = worksheet.Dimension.Columns;
                    using var transaction = _context.Database.BeginTransaction();
                    try
                    {
                        for (int row = 2; row <= rowCount; row++){
                            var insert_mst_prod_success = false;
                            if(worksheet.Cells[row, 3].Value!=null){
                                string emp_no = worksheet.Cells[row, 1].Value==null? null:worksheet.Cells[row, 1].Value.ToString().Trim();
                                string course_no=null; 
                                int month=1;
                                for(int column=9; column<=colCount; column++){
                                    if(worksheet.Cells[row, column].Value!=null){
                                        course_no =  worksheet.Cells[2, column].Value==null? null:worksheet.Cells[2, column].Value.ToString().Trim().Substring(0,7);
                                        month = DateTime.ParseExact( worksheet.Cells[row, column].Value.ToString(), "MMMM", CultureInfo.CurrentCulture).Month;
                                    }
                                }
                                _context.Add(new tr_survey_detail
                                {
                                    emp_no = emp_no,
                                    course_no = course_no,
                                    month = month
                                });
                                insert_mst_prod_success = await _context.SaveChangesAsync() > 0;
                                Console.WriteLine(row+" "+insert_mst_prod_success);
                    
                            }
                        }
                        transaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex);
                        throw;
                    }
                }
            }
            
            return Ok(new { success=true, count = files.Count, size });
        }

        // PUT: api/Survey/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{year}/{org_code}")]
        public async Task<IActionResult> Puttr_survey_setting(string year, string org_code, tr_survey_setting tr_survey_setting)
        {
            if (year != tr_survey_setting.year)
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
                if (!survey_exists(year,org_code))
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
                if (survey_exists(tr_survey_setting.year, tr_survey_setting.org_code))
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
        [HttpDelete("{year}")]
        public async Task<IActionResult> Deletetr_survey_setting(string year, string org_code)
        {
            var tr_survey_setting = await _context.tr_survey_setting.Where(e=>e.year==year && e.org_code==org_code).FirstOrDefaultAsync();
            if (tr_survey_setting == null)
            {
                return NotFound();
            }

            _context.tr_survey_setting.Remove(tr_survey_setting);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("Detail/Year/{year}/Org/{org_code_emp}/For/{org_code_course}")]
        public async Task<ActionResult<tr_survey_setting>> survey_datail(string year, string org_code_emp, string org_code_course)
        {
            var survey_detail = await _context.tr_survey_detail
                                .Include(e=>e.employee)
                                .Include(e=>e.master_course)
                                .Where(e=>e.year==year && e.org_code==org_code_course)
                                .AsNoTracking()
                                .ToListAsync();

            var employees =  await _context.tb_employee.Where(e=>e.div_code==org_code_emp || e.dept_code==org_code_emp).ToListAsync();
            
            if (survey_detail == null)
            {
                return NotFound();
            }

            return Ok(new{employees=employees, survey_detail=survey_detail});
        }

        private bool survey_exists(string year, string org_code)
        {
            return _context.tr_survey_setting.Any(e => e.year == year && e.org_code == org_code);
        }
        private string[] month_list ()
        {
            // return [January, February, March, ...]
            string[] month_name = System.Globalization.CultureInfo.CurrentCulture.DateTimeFormat.MonthNames;

            foreach (string m in month_name) // writing out
            {
                Console.WriteLine(m);
            }

            return month_name;
        }
    }
}
