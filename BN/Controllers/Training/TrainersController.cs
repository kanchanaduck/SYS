using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api_hrgis.Data;
using api_hrgis.Models;
using Microsoft.EntityFrameworkCore.Internal;
using System.IO;
using OfficeOpenXml;
using Microsoft.AspNetCore.Authorization;

namespace api_hrgis.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TrainersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TrainersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Trainers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<tr_trainer>>> Gettr_trainer()
        {
            var trainers = await (from trainer in _context.tr_trainer
            join data in  _context.tb_employee on trainer.emp_no equals data.emp_no into z
            from emp in z.DefaultIfEmpty()
            select new { 
                    trainer_no = trainer.trainer_no,
                    emp_no = trainer.emp_no,
                    title_name_en = trainer.title_name_en?? emp.title_name_en,
                    firstname_en = trainer.firstname_en?? emp.firstname_en,
                    lastname_en = trainer.lastname_en?? emp.lastname_en,
                    div_abb = emp.div_abb,
                    dept_abb = emp.dept_abb,
                    company = trainer.company,
                    trainer_owner_code = trainer.org_code,
                    trainer_owner_abb = trainer.organization.org_abb,
                    employed_status = emp.employed_status,
                    trainer_type = trainer.trainer_type
            }).ToListAsync();
            return Ok(trainers);
        }

        // GET: api/Trainers/5
        [HttpGet("{trainer_no}")]
        public async Task<ActionResult<tr_trainer>> Gettr_trainer(int trainer_no)
        {
            var tr_trainer = await (from trainer in _context.tr_trainer
                            join data in  _context.tb_employee on trainer.emp_no equals data.emp_no into z
                            from emp in z.DefaultIfEmpty()
                            select new { 
                                    trainer_no = trainer.trainer_no,
                                    emp_no = trainer.emp_no,
                                    title_name_en = trainer.title_name_en?? emp.title_name_en,
                                    firstname_en = trainer.firstname_en?? emp.firstname_en,
                                    lastname_en = trainer.lastname_en?? emp.lastname_en,
                                    div_abb = emp.div_abb,
                                    dept_abb = emp.dept_abb,
                                    company = trainer.company,
                                    trainer_owner_code = trainer.org_code,
                                    trainer_owner_abb = trainer.organization.org_abb,
                                    employed_status = emp.employed_status,
                                    trainer_type = trainer.trainer_type,
                            })
                            .Where(trainer=>trainer.trainer_no==trainer_no)
                            .FirstOrDefaultAsync();

            if (tr_trainer == null)
            {
                return NotFound();
            }

            return Ok(tr_trainer);
        }
        // GET: api/Trainers/Owner
        [HttpGet("Owner")]
        // public async Task<ActionResult<tr_trainer>> distinct_org_owner()
        public async Task<ActionResult<IEnumerable<tr_trainer>>> distinct_org_owner()
        {
            var results = await (from trainer in _context.tr_trainer
            join org in  _context.tb_organization on trainer.org_code equals org.org_code
            select new { 
                trainer_owner = org.org_abb+" ("+trainer.org_code+")",
            })
            .Distinct()
            .ToListAsync();

            if (results == null)
            {
                return NotFound();
            }

            return Ok(results);
        }
        // GET: api/Trainers/Owner/{org_code}
        [HttpGet("Owner/{org_code}")]
        public async Task<ActionResult<tr_trainer>> Gettr_trainer(string org_code)
        {
            var tr_trainer = await (from trainer in _context.tr_trainer
                            join data in  _context.tb_employee on trainer.emp_no equals data.emp_no into z
                            from emp in z.DefaultIfEmpty()
                            select new { 
                                trainer_no = trainer.trainer_no,
                                emp_no = trainer.emp_no,
                                title_name_en = trainer.title_name_en?? emp.title_name_en,
                                firstname_en = trainer.firstname_en?? emp.firstname_en,
                                lastname_en = trainer.lastname_en?? emp.lastname_en,
                                display_name = trainer.trainer_type=="External"? trainer.firstname_en+" "+trainer.lastname_en.Substring(0,1)+".":emp.firstname_en+" "+emp.lastname_en.Substring(0,1)+". ("+emp.dept_abb+")",
                                div_abb = emp.div_abb,
                                dept_abb = emp.dept_abb,
                                company = trainer.company,
                                trainer_owner_code = trainer.org_code,
                                trainer_owner_abb = trainer.organization.org_abb,
                                employed_status = emp.employed_status,
                                trainer_type = trainer.trainer_type,
                            })
                            .Where(trainer=>trainer.trainer_owner_code==org_code)
                            .ToListAsync();

            if (tr_trainer == null)
            {
                return NotFound();
            }

            return Ok(tr_trainer);
        }

        // GET: api/Trainers/History
        [AllowAnonymous]
        [HttpGet("HistoryExcel")]
        public async Task<ActionResult<IEnumerable<tr_trainer>>> trainers_history_excel()
        {
            var tr_trainer = await (from trainer in _context.tr_trainer
            join data in  _context.tb_employee on trainer.emp_no equals data.emp_no into z
            from emp in z.DefaultIfEmpty()
            select new { 
                    trainer_no = trainer.trainer_no,
                    emp_no = trainer.emp_no,
                    title_name_en = trainer.title_name_en?? emp.title_name_en,
                    firstname_en = trainer.firstname_en?? emp.firstname_en,
                    lastname_en = trainer.lastname_en?? emp.lastname_en,
                    div_abb = emp.div_abb,
                    dept_abb = emp.dept_abb,
                    company = trainer.company,
                    employed_status = emp.employed_status,
                    trainer_type = trainer.trainer_type,
                    courses_trainers = trainer.courses_trainers
            })
            .ToListAsync();

            var time = DateTime.Now.ToString("yyyyMMddHHmmss");
            var fileName = $"Trainer_History_{time}.xlsx";
            var filepath = $"wwwroot/excel/Trainer_History/{fileName}";
            var originalFileName = $"Trainer_History.xlsx";
            var originalFilePath = $"wwwroot/excel/Trainer_History/{originalFileName}";

            using(var package = new ExcelPackage(new FileInfo(originalFilePath)))
            {
                ExcelWorksheet worksheet = package.Workbook.Worksheets["internal_trainer_history"];
        
                worksheet.Cells[1, 1].Value = "Internal Trainer History"; 

                worksheet.Cells[2, 1].Value = "TRAINER NO"; 
                worksheet.Cells[2, 2].Value = "TITLE"; 
                worksheet.Cells[2, 3].Value = "FIRSTNAME"; 
                worksheet.Cells[2, 4].Value = "LASTNAME"; 
                worksheet.Cells[2, 5].Value = "COMPANY"; 
                worksheet.Cells[2, 6].Value = "DIVISION"; 
                worksheet.Cells[2, 7].Value = "DEPARTMENT"; 
                worksheet.Cells[2, 8].Value = "TRAINER TYPE"; 
                worksheet.Cells[2, 9].Value = "COURSE NO"; 
                worksheet.Cells[2, 10].Value = "THAI COURSE NAME"; 
                worksheet.Cells[2, 11].Value = "ENGLISH COURSE NAME"; 
                worksheet.Cells[2, 12].Value = "DATE START"; 
                worksheet.Cells[2, 13].Value = "DATE END"; 
                worksheet.Cells[2, 14].Value = "PLACE"; 
                
                int recordIndex = 3; 
                foreach (var i in tr_trainer) 
                { 
                    worksheet.Cells[recordIndex, 1].Value = i.trainer_no; 
                    worksheet.Cells[recordIndex, 2].Value = i.title_name_en;
                    worksheet.Cells[recordIndex, 3].Value = i.firstname_en;
                    worksheet.Cells[recordIndex, 4].Value = i.lastname_en; 
                    worksheet.Cells[recordIndex, 5].Value = i.company; 
                    worksheet.Cells[recordIndex, 6].Value = i.div_abb; 
                    worksheet.Cells[recordIndex, 7].Value = i.dept_abb; 
                    worksheet.Cells[recordIndex, 8].Value = i.trainer_type;
                    if(i.courses_trainers.Count()>0){
                        var trainer_courses = await _context.tr_trainer
                                .Include(t => t.courses_trainers)
                                .ThenInclude(e => e.courses)
                                .AsNoTracking()
                                .Where(t => t.trainer_no==i.trainer_no)
                                .FirstOrDefaultAsync();
                        foreach (var j in trainer_courses.courses_trainers) {
                            worksheet.Cells[recordIndex, 9].Value = j.courses.course_no;
                            worksheet.Cells[recordIndex, 10].Value = j.courses.course_name_th;
                            worksheet.Cells[recordIndex, 11].Value = j.courses.course_name_en;
                            worksheet.Cells[recordIndex, 12].Value = j.courses.date_start;
                            worksheet.Cells[recordIndex, 12].Style.Numberformat.Format = "yyyy-mm-dd HH:MM";
                            worksheet.Cells[recordIndex, 13].Value = j.courses.date_end;
                            worksheet.Cells[recordIndex, 13].Style.Numberformat.Format = "yyyy-mm-dd HH:MM";
                            worksheet.Cells[recordIndex, 14].Value = j.courses.place;
                            recordIndex++; 
                        }
                    }
                    else{
                        recordIndex++; 
                    }
                }

                worksheet = package.Workbook.Worksheets["external_trainer_history"];

                package.SaveAs(new FileInfo(filepath));
                package.Dispose();
            }  

            byte[] fileBytes = System.IO.File.ReadAllBytes(filepath);
            return File(fileBytes, "application/x-msdownload", fileName); 
        }
        
        // GET: api/Trainers/History/5
        [HttpGet("History/{trainer_no}")]
        public async Task<ActionResult<IEnumerable<tr_course_trainer>>> trainer_history(int trainer_no)
        {                   
            var trainer = await _context.tr_trainer
                            .Where(t=>t.trainer_no==trainer_no)
                            .FirstOrDefaultAsync();

            if (trainer == null)
            {
                return NotFound();
            }         

            if(trainer.trainer_type=="Internal"){
                
                var trainers = await _context.tr_trainer
                            .Where(t=>t.emp_no==trainer.emp_no)
                            .ToListAsync();
                
                var c = new List<int>();
                foreach (var item in trainers)
                {
                    Console.WriteLine(item.trainer_no);
                    c.Add(item.trainer_no);
                }

                return await _context.tr_course_trainer
                                .Include(e => e.courses)
                                .Where(t => c.Contains(t.trainer_no))
                                .AsNoTracking()
                                .ToListAsync();            
            }
            else{
                return await _context.tr_course_trainer
                                .Include(e => e.courses)
                                .Where(t => t.trainer_no==trainer_no)
                                .AsNoTracking()
                                .ToListAsync();  
            }

        }

        // GET: api/Trainers/HistoryExcel/1
        [AllowAnonymous]
        [HttpGet("HistoryExcel/{trainer_no}")]
        public async Task<ActionResult<IEnumerable<tr_trainer>>> trainer_history_excel(int trainer_no)
        {
            var trainer_courses = await _context.tr_trainer
                                .Include(t => t.courses_trainers)
                                .ThenInclude(e => e.courses)
                                .AsNoTracking()
                                .Where(t => t.trainer_no==trainer_no)
                                .FirstOrDefaultAsync();

            var trainer_info = await (from trainer in _context.tr_trainer
                            join data in  _context.tb_employee on trainer.emp_no equals data.emp_no into z
                            from emp in z.DefaultIfEmpty()
                            select new { 
                                    trainer_no = trainer.trainer_no,
                                    emp_no = trainer.emp_no,
                                    title_name_en = trainer.title_name_en?? emp.title_name_en,
                                    firstname_en = trainer.firstname_en?? emp.firstname_en,
                                    lastname_en = trainer.lastname_en?? emp.lastname_en,
                                    div_abb = emp.div_abb,
                                    dept_abb = emp.dept_abb,
                                    company = trainer.company,
                                    employed_status = emp.employed_status,
                                    trainer_type = trainer.trainer_type,
                            })
                            .Where(trainer=>trainer.trainer_no==trainer_no)
                            .FirstOrDefaultAsync();

            // return Ok(trainer_courses);

            var time = DateTime.Now.ToString("yyyyMMddHHmmss");
            var fileName = $"Trainer_History_{time}_{trainer_no}.xlsx";
            var filepath = $"wwwroot/excel/Trainer_History/{fileName}";
            var originalFileName = $"Trainer_History.xlsx";
            var originalFilePath = $"wwwroot/excel/Trainer_History/{originalFileName}";

            Console.WriteLine(originalFilePath);
            Console.WriteLine(filepath);

            using(var package = new ExcelPackage(new FileInfo(originalFilePath)))
            {
                ExcelWorksheet worksheet = package.Workbook.Worksheets["trainer_history"];
        
                worksheet.Cells[1, 1].Value = $"Trainer History {trainer_info.firstname_en} {trainer_info.lastname_en}"; 

                worksheet.Cells[2, 1].Value = "TRAINER NO"; 
                worksheet.Cells[2, 2].Value = "TITLE NAME"; 
                worksheet.Cells[2, 3].Value = "FIRSTNAME"; 
                worksheet.Cells[2, 4].Value = "LASTNAME"; 
                worksheet.Cells[2, 5].Value = "company"; 
                worksheet.Cells[2, 6].Value = "DIVISION"; 
                worksheet.Cells[2, 7].Value = "DEPARTMENT"; 
                worksheet.Cells[2, 8].Value = "TRAINER TYPE"; 
                worksheet.Cells[2, 9].Value = "COURSE NO"; 
                worksheet.Cells[2, 10].Value = "THAI COURSE NAME"; 
                worksheet.Cells[2, 11].Value = "ENGLISH COURSE NAME"; 
                worksheet.Cells[2, 12].Value = "DATE START"; 
                worksheet.Cells[2, 13].Value = "DATE END"; 
                worksheet.Cells[2, 14].Value = "PLACE"; 
                
                int recordIndex = 3; 
                if(trainer_courses.courses_trainers.Count()>0){
                    foreach (var i in trainer_courses.courses_trainers) {
                        worksheet.Cells[recordIndex, 1].Value = trainer_info.trainer_no; 
                        worksheet.Cells[recordIndex, 2].Value = trainer_info.title_name_en;
                        worksheet.Cells[recordIndex, 3].Value = trainer_info.firstname_en;
                        worksheet.Cells[recordIndex, 4].Value = trainer_info.lastname_en; 
                        worksheet.Cells[recordIndex, 5].Value = trainer_info.company; 
                        worksheet.Cells[recordIndex, 6].Value = trainer_info.div_abb; 
                        worksheet.Cells[recordIndex, 7].Value = trainer_info.dept_abb; 
                        worksheet.Cells[recordIndex, 8].Value = trainer_info.trainer_type;
                        worksheet.Cells[recordIndex, 9].Value = i.course_no;
                        worksheet.Cells[recordIndex, 10].Value = i.courses.course_name_en;
                        worksheet.Cells[recordIndex, 11].Value = i.courses.course_name_th;
                        worksheet.Cells[recordIndex, 12].Value = i.courses.date_start;
                        worksheet.Cells[recordIndex, 12].Style.Numberformat.Format = "yyyy-mm-dd";
                        worksheet.Cells[recordIndex, 13].Value = i.courses.date_end;
                        worksheet.Cells[recordIndex, 13].Style.Numberformat.Format = "yyyy-mm-dd";
                        worksheet.Cells[recordIndex, 14].Value = i.courses.place;
                        recordIndex++;                     
                    }                    
                }


                package.SaveAs(new FileInfo(filepath));
                package.Dispose();
            }  

            byte[] fileBytes = System.IO.File.ReadAllBytes(filepath);
            return File(fileBytes, "application/x-msdownload", fileName); 
        }

        // PUT: api/Trainers/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> Puttr_trainer(int id, tr_trainer tr_trainer)
        {
            if(user_is_commitee_return_org_code()==null){
                return StatusCode(403,"Permission denied, only committee can manage data");
            }

            if (id != tr_trainer.trainer_no)
            {
                return BadRequest();
            }

            _context.Entry(tr_trainer).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!trainer_exists(id))
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

        // POST: api/Trainers
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<tr_trainer>> Posttr_trainer(tr_trainer tr_trainer)
        {
            if(user_is_commitee_return_org_code()==null){
                return StatusCode(403,"Permission denied, only committee can manage data");
            }

            if (tr_trainer.trainer_type=="Internal" && trainer_internal_exists(tr_trainer.emp_no, tr_trainer.org_code))
            {
                return Conflict("Data is already exists");
            }
            else if (tr_trainer.trainer_type=="External" && trainer_exists(tr_trainer.trainer_no)) 
            {
                _context.Entry(tr_trainer).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return NoContent();
            }
            else
            {
                _context.tr_trainer.Add(tr_trainer);
                await _context.SaveChangesAsync();
                return CreatedAtAction("Gettr_trainer", new { id = tr_trainer.trainer_no }, tr_trainer);                
            }
        }

        // DELETE: api/Trainers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Deletetr_trainer(int id)
        {
            if(user_is_commitee_return_org_code()==null){
                return StatusCode(403,"Permission denied, only committee can manage data");
            }

            var tr_trainer = await _context.tr_trainer.FindAsync(id);
            if (tr_trainer == null)
            {
                return NotFound();
            }

            _context.tr_trainer.Remove(tr_trainer);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool trainer_exists(int id)
        {
            return _context.tr_trainer.Any(e => e.trainer_no == id);
        }
        private bool trainer_internal_exists(string emp_no, string org_code)
        {
            return _context.tr_trainer.Any(e => e.emp_no == emp_no && e.org_code == org_code);
        }
        private bool user_is_center()
        {
            string emp_no = User.FindFirst("emp_no").Value;
            return _context.tr_center.Any(e => e.emp_no == emp_no);
        }
        private string user_is_commitee_return_org_code()
        {
            string emp_no = User.FindFirst("emp_no").Value;
            var committee = _context.tr_stakeholder
                            .Where(e => e.emp_no == emp_no && e.role.ToUpper()=="COMMITTEE")
                            .FirstOrDefault();

            Console.WriteLine("Committee: "+committee.org_code);
            if(committee==null){
                return null;
            }
            else{
                return committee.org_code;
            }
        }
    }
}