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
using Microsoft.AspNetCore.Cors;
using Oracle.ManagedDataAccess.Client;
using System.Data;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;
using api_hrgis.Repository;

namespace api_hrgis.Controllers
{
    [EnableCors("_myAllowSpecificOrigins")]
    [Route("api/[controller]")]
    [ApiController]
    public class OracleHRMSController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly OracleDbContext _oracle_context;
        private readonly IConfiguration _config;
        private readonly IRepository _repository;

        public OracleHRMSController(
            ApplicationDbContext context, 
            OracleDbContext oracle_context, 
            IConfiguration config,
            IRepository repository)
        {
            _context = context;
            _oracle_context = oracle_context;
            _config = config;
            _repository = repository;
        }
        // GET: api/Employees/Dump
        [HttpGet("Employee/Dump")]
        public async Task<ActionResult<IEnumerable<tb_employee>>> Employee_Dump()
        {
            Console.WriteLine("Start dump employee..");
            // DataTable dt1 = new DataTable();

            // dt = get_oracle_datatable(@"select * from cpt_employees");
            // Console.WriteLine("Count row"+dt.Rows.Count);

            // var employee_temp = _context.tb_employee_temp.ToList();
            // _context.tb_employee_temp.RemoveRange(employee_temp);
            // _context.SaveChanges();

            // DumpDataTableToDB("tb_employee_temp",dt,dt.Rows.Count);
            
            Console.WriteLine("...End dump employee"); 

            // ----------------------------------------------------

            Console.WriteLine("Start update employee..");
            // DataTable dt2 = new DataTable();
            // dt2 = get_mssql_datatable(@"EXECUTE update_employee");
            Console.WriteLine("...End update employee"); 
            
            // ----------------------------------------------------

            Console.WriteLine("Start register..");
            var tb_employees = await _context.tb_employee
                            .FromSqlRaw(@"SELECT A.* FROM tb_employee A 
                            LEFT JOIN tb_user B ON A.emp_no=B.username WHERE B.username IS NULL")
                            .ToListAsync();

            Console.WriteLine(tb_employees.Count());

             if (tb_employees == null)
            {
                return NotFound();
            }

            foreach (var item in tb_employees)
            {
                tb_user tb = new tb_user();
                Console.WriteLine(item.emp_no);

                tb.username = item.emp_no;
                tb.emailconfirmed = true;
                var hashsalt = _repository.EncryptPassword(item.emp_no);
                tb.passwordhash = hashsalt.Hash;
                tb.storedsalt = hashsalt.Salt;
                tb.phonenumberconfirmed = true; 
                tb.created_at = DateTime.Now;
                tb.created_by = "SYSTEM";

                _context.tb_user.Add(tb);              
            } 

            await _context.SaveChangesAsync();
            Console.WriteLine("...End register"); 

            // ----------------------------------------------------

            Console.WriteLine("Start delete user..");
            DataTable dt2 = new DataTable();
            dt2 = get_mssql_datatable(@"DELETE u
                                    FROM tb_user u
                                    INNER JOIN tb_employee e
                                    ON e.emp_no=u.username
                                    WHERE e.resign_date<GETDATE()");
            Console.WriteLine("...End delete user"); 

            // ----------------------------------------------------

            return Ok("SUCCESS");
        }
        // GET: api/Organization/Dump
        [HttpGet("Organization/Dump")]
        public async Task<ActionResult<IEnumerable<tb_organization>>> Organization()
        {
            DataTable dt = new DataTable();

            dt = get_oracle_datatable(@"select * from cpt_organization");

            DumpDataTableToDB("tb_organization_temp",dt,dt.Rows.Count);

            return await _context.tb_organization.Take(5).ToListAsync();
        }
        // GET: api/Holiday/Dump
        [HttpGet("Holiday/Dump")]
        public async Task<ActionResult<IEnumerable<tb_holiday>>> Holiday()
        {
            DataTable dt = new DataTable();

            dt = get_oracle_datatable(@"select * from cpt_holidays order by holiday desc");

            DumpDataTableToDB("tb_holiday",dt,dt.Rows.Count);

            return await _context.tb_holiday.Take(5).ToListAsync();
        }   
        
        // GET: api/HistoryDump
        [HttpGet("HistoryDump")]
        public async Task<ActionResult<IEnumerable<tb_hrms>>> HistoryDump()
        {
            return await _context.tb_hrms.Take(5).ToListAsync();
        }      
        private DataTable get_oracle_datatable(string query)
        {
            DataTable dt = new DataTable();
            string constr = _config["ConnectionStrings:OracleConnection"];
            using (OracleConnection con = new OracleConnection(constr))
            {
                using (OracleCommand cmd = new OracleCommand(query))
                {
                    cmd.Connection = con;
                    using (OracleDataAdapter sda = new OracleDataAdapter(cmd))
                    {
                        sda.Fill(dt);
                    }
                }
            }
            return dt;
        }
        private DataTable get_mssql_datatable(string query)
        {
            DataTable dt = new DataTable();
            string constr = _config["ConnectionStrings:DefaultConnection"];
            using (SqlConnection con = new SqlConnection(constr))
            {
                using (SqlCommand cmd = new SqlCommand(query))
                {
                    cmd.Connection = con;
                    using (SqlDataAdapter sda = new SqlDataAdapter(cmd))
                    {
                        sda.Fill(dt);
                    }
                }
            }
            return dt;
        }
        private void DumpDataTableToDB(string TableName, DataTable dt, int row)
        {
            string SqlConnectionStr = _config["ConnectionStrings:DefaultConnection"];
            using (SqlConnection destinationConnection = new SqlConnection(SqlConnectionStr))
            {
              destinationConnection.Open();
              using (SqlBulkCopy bkCopy= new SqlBulkCopy(destinationConnection))
              {
                    bkCopy.BatchSize = row;
                    bkCopy.BulkCopyTimeout = 20;
                    bkCopy.DestinationTableName = TableName;
                    /* try
                    { */
                        Console.WriteLine("Prepare writing...");
                        foreach (DataColumn d in dt.Columns) 
                        { 
                            Console.WriteLine(d.ColumnName);
                            bkCopy.ColumnMappings.Add(d.ColumnName, d.ColumnName.ToLower()); 
                            Console.WriteLine(d.ColumnName.ToLower());
                        }
                        Console.WriteLine("Start writing to "+ TableName +"...");
                        bkCopy.WriteToServer(dt);
                        Console.WriteLine("...End writing to "+ TableName);
                    /* }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                    finally
                    {
                        bkCopy.Close();
                    } */
                    bkCopy.Close();
              }
              destinationConnection.Close();
            }

        } 

    }
}
