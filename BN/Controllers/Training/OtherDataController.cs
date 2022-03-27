
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

        [HttpGet("GetCountTrainee")]
        public IActionResult GetCountTrainee(string course_no, string date_start, string date_end)
        {
            /* var query = string.Format(@"SELECT * FROM V_COUNT_TRAINEE
                        where course_no like '%{0}%'
                        and date_start >= '{1}' AND date_end <= '{2}'
                        and (last_status = '{3}')
                        "
                        , course_no, date_start, date_end, _config.GetValue<string>("Status:approved")); */
            
            var query = string.Format(@"SELECT * FROM V_COUNT_TRAINEE
                        where course_no like '%{0}%'
                        and (last_status = '{1}')
                        "
                        , course_no, _config.GetValue<string>("Status:approved"));

            DataTable dt = new DataTable();
            dt = _repository.get_datatable(query);

            return Ok(dt);
        }

        [HttpGet("GetCountAttendee")]
        public IActionResult GetCountAttendee(string course_no)
        {
            var query = string.Format(@"SELECT * FROM V_COUNT_ATTENDEE
                        where course_no like '%{0}%'
                        and (last_status = '{1}')"
                        , course_no, _config.GetValue<string>("Status:approved"));

            DataTable dt = new DataTable();
            dt = _repository.get_datatable(query);

            return Ok(dt);
        }

        /* [HttpGet("GetCourseTarget")]
        public IActionResult GetCourseTarget(string course_no)
        {
            var query = string.Format(@"select distinct substring(tc.course_no,1,7) as course_no, tc.course_name_en, tc.course_name_th, tcb.band from 
                            [HRGIS].[dbo].[tr_course_registration] trc
                            left join [HRGIS].[dbo].[tr_course] tc on trc.course_no = tc.course_no
                            left join [HRGIS].[dbo].[tr_course_band] tcb on tc.course_no = tcb.course_no
                            where substring(tc.course_no,1,7) = '{0}' and (last_status = '{1}') "
                        , course_no, _config.GetValue<string>("Status:approved"));

            DataTable dt = new DataTable();
            dt = _repository.get_datatable(query);

            List<target> list = new List<target>();
            for (var i = 0; i < dt.Rows.Count; i++)
            {
                // Console.WriteLine("===== 2 =====" + dt.Rows[i]["band"]);
                var query1 = string.Format(@"select te.emp_no, te.title_name_en
                            , case when te.band = 'JP' then te.lastname_en else te.firstname_en end as firstname_en
                            , case when te.band = 'JP' then te.firstname_en else te.lastname_en end as lastname_en
                            , te.title_name_th
                            , case when te.band = 'JP' then te.lastname_th else te.firstname_th end as firstname_th
                            , case when te.band = 'JP' then te.firstname_th else te.lastname_th end as lastname_th
                            , te.band, te.position_name_en, te.dept_abb, te.div_abb 
                            from [HRGIS].[dbo].[tb_employee] te
                            where te.band = '{0}' AND (te.resign_date IS null OR te.resign_date >= GETDATE())
                            and te.emp_no not in (
                                select emp_no from [HRGIS].[dbo].[tr_course_registration] 
                                where (last_status = '{1}') and substring(course_no,1,7) = '{2}'
                            )"
                        , dt.Rows[i]["band"], _config.GetValue<string>("Status:approved"), course_no);
                DataTable dt1 = new DataTable();
                dt1 = _repository.get_datatable(query1);
                if (dt1.Rows.Count > 0)
                {
                    for (var j = 0; j < dt1.Rows.Count; j++)
                    {
                        target tb = new target();
                        tb.course_no = dt.Rows[i]["course_no"].ToString();
                        tb.course_name_th = dt.Rows[i]["course_name_th"].ToString();
                        tb.course_name_en = dt.Rows[i]["course_name_en"].ToString();
                        tb.emp_no = dt1.Rows[j]["emp_no"].ToString();
                        tb.title_name_en = dt1.Rows[j]["title_name_en"].ToString();
                        tb.firstname_en = dt1.Rows[j]["firstname_en"].ToString();
                        tb.lastname_en = dt1.Rows[j]["lastname_en"].ToString();
                        tb.title_name_th = dt1.Rows[j]["title_name_th"].ToString();
                        tb.firstname_th = dt1.Rows[j]["firstname_th"].ToString();
                        tb.lastname_th = dt1.Rows[j]["lastname_th"].ToString();
                        tb.band = dt1.Rows[j]["band"].ToString();
                        tb.position_name_en = dt1.Rows[j]["position_name_en"].ToString();
                        tb.dept_abb = dt1.Rows[j]["dept_abb"].ToString();
                        tb.div_abb = dt1.Rows[j]["div_abb"].ToString();
                        list.Add(tb);
                    }
                }
            }

            return Ok(list);
        } */

        [HttpGet("GetCourseTarget")]
        public async Task<IActionResult> GetCourseTarget(string course_no)
        {
            var course_master = await _context.tr_course_master
                                        .Include(e => e.master_courses_bands)
                                        .Where(e => e.course_no == course_no)
                                        .AsNoTracking()
                                        .FirstOrDefaultAsync();
            if(course_master==null){
                return NotFound("Course no. is not found");
            }

            if(course_master.master_courses_bands==null){
                return BadRequest("This course is not defined the bands");
            }

            List<string> bands= new List<string>();
            foreach (var item in course_master.master_courses_bands)
            {
                bands.Add(item.band);
            }

            var student_in_target_band = await _context.tb_employee
                                        .Where(e=>bands.Contains(e.band) && e.employed_status=="EMPLOYED").ToListAsync();

            var learnt = await _context.tb_employee.FromSqlRaw(@"select e.* from tb_employee e, tr_course_registration r
                    where e.emp_no=r.emp_no and r.last_status='APPROVED' and course_no='{0}'", course_no).ToListAsync();

            var target = student_in_target_band.Except(learnt);
            /* var list1 = new List<int> { 1, 2, 3, 4, 5};
            var list2 = new List<int> { 3, 4, 5, 6, 7 };

            var list3 = list1.Except(list2); //list3 contains only 1, 2
            var list4 = list2.Except(list1); //list4 contains only 6, 7
            var resultList = list3.Concat(list4).ToList(); //resultList contains 1, 2, 6, 7 */

            return Ok(target);
        }

        [HttpGet("GetEmployeeTraining")]
        public IActionResult GetEmployeeTraining(string emp_no)
        {
            var query = string.Format(@"SELECT * FROM V_EMPLOYEE_TRAINING
                                where  emp_no = '{0}'
                                and (last_status = '{1}')"
                        , emp_no, _config.GetValue<string>("Status:approved"));

            DataTable dt = new DataTable();
            dt = _repository.get_datatable(query);

            return Ok(dt);
        }

        [HttpGet("GetChartCenter")]
        public IActionResult GetChartCenter(string course_no)
        {
            var query = string.Format(@"SELECT dept_abb FROM [HRGIS].[dbo].[V_CHART_CENTER] where course_no = '{0}' group by dept_abb order by dept_abb"
                        , course_no);

            var query1 = string.Format(@"SELECT total FROM [HRGIS].[dbo].[V_CHART_CENTER] where course_no = '{0}' group by total, dept_abb order by dept_abb"
                        , course_no);

            DataTable dt = new DataTable();
            DataTable dt1 = new DataTable();
            dt = _repository.get_datatable(query);
            dt1 = _repository.get_datatable(query1);

            return Ok(new
            {
                chartlabels = dt,
                data = dt1
            });
        }

        [HttpGet("GetSendMail")]
        public IActionResult GetSendMail(string org_code)
        {
            var query = string.Format(@"SELECT * FROM V_SENDMAIL where org_code = '{0}'"
                        , org_code);

            DataTable dt = new DataTable();
            dt = _repository.get_datatable(query);

            return Ok(dt);
        }

        [HttpGet("GetGETREGISTRATION")]
        public IActionResult GetGETREGISTRATION(string course_no)
        {
            var query = string.Format(@"SELECT * FROM V_GETREGISTRATION where course_no = '{0}'"
                        , course_no);

            DataTable dt = new DataTable();
            dt = _repository.get_datatable(query);

            return Ok(dt);
        }

        [HttpGet("GetSendMailConfirmation")]
        public IActionResult GetSendMailConfirmation(string course_no)
        {
            var query = string.Format(@"SELECT course_no, tbr.emp_no, te.email, te.band, te.position_name_en, te.dept_code, te.dept_abb, te.div_code, te.div_abb
                                        , case when te.band = N'JP' 
	                                        then te.title_name_en + te.lastname_en + ' ' + LEFT(te.firstname_en,1) + '. ('+ te.dept_abb +')' 
	                                        else te.title_name_en + te.firstname_en + ' ' + LEFT(te.lastname_en,1) + '. ('+ te.dept_abb +')'  end as fullname
                                        FROM [HRGIS].[dbo].[tr_course_registration] tbr
                                        left join tb_employee te on tbr.emp_no = te.emp_no
                                        where course_no = '{0}' and (last_status = '{1}')"
                        , course_no, _config.GetValue<string>("Status:approved"));
            DataTable dt = new DataTable();
            dt = _repository.get_datatable(query); // Console.WriteLine("===== 1 =====" + dt.Rows.Count);

            List<confirmation> list = new List<confirmation>();
            for (var i = 0; i < dt.Rows.Count; i++)
            { // Console.WriteLine("===== 2 =====" + dt.Rows[i]["dept_code"]);
                var query1 = string.Format(@"SELECT emp_no, email, band, position_name_en, dept_code, dept_abb, div_code, div_abb
                                        , case when band = N'JP' 
                                            then title_name_en + lastname_en + ' ' + LEFT(firstname_en,1) + '. ('+ dept_abb +')' 
                                            else title_name_en + firstname_en + ' ' + LEFT(lastname_en,1) + '. ('+ dept_abb +')'  end as fullname
                                        FROM [HRGIS].[dbo].[tb_employee] where dept_code = '{0}' and band in ('J4','M1','M2')"
                        , dt.Rows[i]["dept_code"]);
                DataTable dt1 = new DataTable();
                dt1 = _repository.get_datatable(query1);
                if (dt1.Rows.Count > 0)
                {
                    confirmation tb = new confirmation();
                    tb.emp_no = dt1.Rows[0]["emp_no"].ToString();
                    tb.email = dt1.Rows[0]["email"].ToString();
                    tb.band = dt1.Rows[0]["band"].ToString();
                    tb.position_name_en = dt1.Rows[0]["position_name_en"].ToString();
                    tb.dept_code = dt1.Rows[0]["dept_code"].ToString();
                    tb.dept_abb = dt1.Rows[0]["dept_abb"].ToString();
                    tb.div_code = dt1.Rows[0]["div_code"].ToString();
                    tb.div_abb = dt1.Rows[0]["div_abb"].ToString();
                    tb.fullname = dt1.Rows[0]["fullname"].ToString();
                    list.Add(tb);
                }
            }

            var query2 = string.Format(@"select te.emp_no, te.email, te.title_name_en + te.firstname_en + ' ' + LEFT(te.lastname_en,1) + ' ('+ te.dept_abb +')' fullname
						FROM tr_course_trainer tt
						left join tr_trainer trt on tt.trainer_no = trt.trainer_no
						left join tb_employee te on trt.emp_no = te.emp_no
						where tt.course_no = '{0}' and trt.trainer_type = '{1}'"
                        , course_no, _config.GetValue<string>("Text:internal"));
            DataTable dt2 = new DataTable();
            dt2 = _repository.get_datatable(query2);

            // var query3 = string.Format(@"SELECT tc.emp_no, email, band, position_name_en, dept_code, dept_abb, div_code, div_abb
            //             , case when band = N'JP' 
            //                 then title_name_en + lastname_en + ' ' + LEFT(firstname_en,1) + '. ('+ dept_abb +')' 
            //                 else title_name_en + firstname_en + ' ' + LEFT(lastname_en,1) + '. ('+ dept_abb +')'  end as fullname
            //             FROM [HRGIS].[dbo].[tr_center] tc
            //             left join tb_employee te on tc.emp_no = te.emp_no");
            // DataTable dt3 = new DataTable();
            // dt3 = _repository.get_datatable(query3);
            ////////// มีการเปลี่ยนจาก Center เป็น Committee ที่เปิด Course ในการกดส่ง E-mail คือเจ้าของ course เท่านั้นที่ส่ง mail ได้
            var query3 = string.Format(@"SELECT tc.emp_no, email, band, position_name_en, dept_code, dept_abb, div_code, div_abb
                        , case when band = N'JP' 
                            then title_name_en + lastname_en + ' ' + LEFT(firstname_en,1) + '. ('+ dept_abb +')' 
                            else title_name_en + firstname_en + ' ' + LEFT(lastname_en,1) + '. ('+ dept_abb +')'  end as fullname
                        FROM [HRGIS].[dbo].[tr_stakeholder] tc
                        left join tb_employee te on tc.emp_no = te.emp_no where tc.emp_no = '{0}'", User.FindFirst("emp_no").Value);
            DataTable dt3 = new DataTable();
            dt3 = _repository.get_datatable(query3);

            List<confirmation> list4 = new List<confirmation>();
            for (var j = 0; j < dt.Rows.Count; j++)
            { // Console.WriteLine("===== 2 =====" + dt.Rows[i]["dept_code"]);
                var query4 = string.Format(@"SELECT ts.emp_no, email, band, position_name_en, dept_code, dept_abb, div_code, div_abb, ts.role
                                        , case when band = N'JP' 
                                            then title_name_en + lastname_en + ' ' + LEFT(firstname_en,1) + '. ('+ dept_abb +')' 
                                            else title_name_en + firstname_en + ' ' + LEFT(lastname_en,1) + '. ('+ dept_abb +')'  end as fullname
                                        FROM [HRGIS].[dbo].[tr_stakeholder] ts
                                        left join tb_employee te on ts.emp_no = te.emp_no
                                        where ts.role = '{0}' and ts.org_code = '{1}'"
                        , "APPROVER", dt.Rows[j]["dept_code"]);
                DataTable dt4 = new DataTable();
                dt4 = _repository.get_datatable(query4);
                if (dt4.Rows.Count > 0)
                {
                    confirmation tb = new confirmation();
                    tb.emp_no = dt4.Rows[0]["emp_no"].ToString();
                    tb.email = dt4.Rows[0]["email"].ToString();
                    tb.band = dt4.Rows[0]["band"].ToString();
                    tb.position_name_en = dt4.Rows[0]["position_name_en"].ToString();
                    tb.dept_code = dt4.Rows[0]["dept_code"].ToString();
                    tb.dept_abb = dt4.Rows[0]["dept_abb"].ToString();
                    tb.div_code = dt4.Rows[0]["div_code"].ToString();
                    tb.div_abb = dt4.Rows[0]["div_abb"].ToString();
                    tb.fullname = dt4.Rows[0]["fullname"].ToString();
                    list4.Add(tb);
                }
            }

            return Ok(new
            {
                trainee = dt,
                manager = list,
                trainner = dt2,
                center = dt3,
                approver = list4
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
        // GET: api/OtherData/course_map/23/2310
        // GET: api/OtherData/course_map/23/2310/employed
        // GET: api/OtherData/course_map/23/2310/resigned
        [HttpGet("course_map/{div_code}/{dept_code}/{employed_status?}")]
        public IActionResult course_map(string div_code, string dept_code, string employed_status)
        {
            string employed_status_text = "@employed_status='" + employed_status + "'";
            if (employed_status == "")
                employed_status_text = "@employed_status is null";
            var query = string.Format(@"EXECUTE dbo.course_map 
            @div_code='{0}', @dept_code='{1}', {2}", div_code, dept_code, employed_status_text);
            Console.WriteLine(query);
            DataTable dt = new DataTable();
            dt = _repository.get_datatable(query);

            return Ok(dt);
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