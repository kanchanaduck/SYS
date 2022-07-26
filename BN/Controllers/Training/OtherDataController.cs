
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System.Data;
using Microsoft.EntityFrameworkCore.Internal;
using System.IO;
using OfficeOpenXml;
using Microsoft.AspNetCore.Authorization;
using api_hrgis.Data;
using api_hrgis.Models;
using api_hrgis.Repository;

namespace api_hrgis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OtherDataController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config; // using Microsoft.Extensions.Configuration;
        private readonly IRepository _repository;

        public OtherDataController(ApplicationDbContext context, IConfiguration config, IRepository repository)
        {
            _context = context;
            _config = config;
            _repository = repository;
        }
        
        [HttpGet("GetChartFinal")]
        public IActionResult GetChartFinal(string course_no)
        {
            var query = string.Format(@"SELECT dept_abb FROM V_CHART_CENTER where course_no = '{0}' group by dept_abb order by dept_abb"
                        , course_no);

            var query1 = string.Format(@"SELECT total FROM V_CHART_CENTER where course_no = '{0}' group by total, dept_abb order by dept_abb"
                        , course_no);

            var course = _context.tr_course_master.Where(e=>e.course_no==course_no).FirstOrDefault();

            DataTable dt = new DataTable();
            DataTable dt1 = new DataTable();
            dt = _repository.get_datatable(query);
            dt1 = _repository.get_datatable(query1);

            return Ok(new
            {
                chartlabels = dt,
                data = dt1,
                master_course = course
            });
        }
        // GET: api/OtherData/ConfirmationExcel
        [HttpGet("ConfirmationExcel")]
        public IActionResult ConfirmationExcel(string course_no)
        {
            var query = string.Format(@"SELECT emp_no,title_name_en,firstname_en,lastname_en,
                                        title_name_th,firstname_th,lastname_th,position_name_en,dept_abb,div_abb
                                        FROM V_GETREGISTRATION where course_no = '{0}'"
                        , course_no);

            DataTable dt = new DataTable();
            dt = _repository.get_datatable(query);

            // var time = DateTime.Now.ToString("yyyyMMddHHmmss");
            // var fileName = $"Confirmation_Sheet_{time}.xlsx";
            var fileName = $"Confirmation_Sheet_Result.xlsx";
            var filepath = $"wwwroot/excel/Confirmation_Sheet/{fileName}";
            var originalFileName = $"Confirmation_Sheet.xlsx";
            var originalFilePath = $"wwwroot/excel/Confirmation_Sheet/{originalFileName}";

            using (var package = new ExcelPackage(new FileInfo(originalFilePath)))
            {
                ExcelWorksheet worksheet = package.Workbook.Worksheets["Sheet1"];
                worksheet.Cells["A1"].LoadFromDataTable(dt, true);

                package.SaveAs(new FileInfo(filepath));
                package.Dispose();
            }

            byte[] fileBytes = System.IO.File.ReadAllBytes(filepath);
            return File(fileBytes, "application/x-msdownload", fileName);
        }
    }
}

public class confirmation
{
    public string emp_no { get; set; }
    public string email { get; set; }
    public string band { get; set; }
    public string position_name_en { get; set; }
    public string dept_code { get; set; }
    public string dept_abb { get; set; }
    public string div_code { get; set; }
    public string div_abb { get; set; }
    public string fullname { get; set; }
}

public class target
{
    public string course_no { get; set; }
    public string course_name_th { get; set; }
    public string course_name_en { get; set; }
    public string emp_no { get; set; }
    public string title_name_en { get; set; }
    public string firstname_en { get; set; }
    public string lastname_en { get; set; }
    public string title_name_th { get; set; }
    public string firstname_th { get; set; }
    public string lastname_th { get; set; }
    public string band { get; set; }
    public string position_name_en { get; set; }
    public string div_abb { get; set; }
    public string dept_abb { get; set; }
}