using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using api_hrgis.Data;
using api_hrgis.Models;
using api_hrgis.Repository;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_hrgis.Controllers
{
    [Authorize] // Microsoft.AspNetCore.Authorization // [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IRepository _repository;

        public AccountController(ApplicationDbContext context, IRepository repository)
        {
            _context = context;
            _repository = repository;
        }

        // GET: api/Account
        [HttpGet]
        public async Task<ActionResult<IEnumerable<tb_user>>> get_user()
        {
            var users = await (from user in _context.tb_user
            join data in  _context.tb_employee on user.username equals data.emp_no into z
             from emp in z.DefaultIfEmpty()
            select new { 
                username = user.username,
                emp_no = emp.emp_no,
                title_name_en = emp.title_name_en,
                firstname_en = emp.firstname_en,
                lastname_en = emp.lastname_en,
                position_name_en = emp.position_name_en,
                band = emp.band,
                full_name_en = emp.fullname_en,
                div_abb = emp.div_abb,
                dept_abb = emp.dept_abb,
                div_code = emp.div_code,
                dept_code = emp.dept_code,
                employed_status = emp.employed_status,
            })
            .AsNoTracking()
            .ToListAsync();
            
            return Ok(users);
        }

        private bool user_exists(string username)
        {
            return _context.tb_user.Any(e => e.username == username);
        }

        // POST: api/Account/Register
        [HttpPost("Register")]
        public async Task<ActionResult<tb_user>> Register(tb_user Input)
        {
            if (Input.password != Input.confirmpassword)
            {
                return Conflict("The password and confirmation password do not match.");
            }

            tb_user tb = new tb_user();
            tb.username = Input.username;
            tb.email = Input.email;
            tb.emailconfirmed = true;
            var hashsalt = _repository.EncryptPassword(Input.password);
            tb.passwordhash = hashsalt.Hash;
            tb.storedsalt = hashsalt.Salt;
            tb.phonenumber = Input.phonenumber;
            tb.phonenumberconfirmed = true;
            tb.created_at = DateTime.Now;
            tb.created_by = User.FindFirst("emp_no").Value;;

            _context.tb_user.Add(tb);
            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { Input });
            }
            catch (DbUpdateException)
            {
                if (user_exists(Input.username))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }
        }
        // GET: api/Account/ResetPassword
        [HttpGet("ResetPassword/{emp_no}")]
        public async Task<ActionResult<tb_user>> reset_password(string emp_no)
        {
            var tb_user = await _context.tb_user.Where(x => x.username == emp_no)
                            .FirstOrDefaultAsync();
            if (tb_user == null)
            {
                return NotFound();
            }

            tb_user.username = emp_no;
            var hashsalt = _repository.EncryptPassword(emp_no);
            tb_user.passwordhash = hashsalt.Hash;
            tb_user.storedsalt = hashsalt.Salt;
            tb_user.reset_password_at = DateTime.Now;
            tb_user.reset_password_by = User.FindFirst("emp_no").Value;

            _context.Entry(tb_user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!user_exists(emp_no))
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
        // POST: api/Account/Register
        [HttpPost("ChangePassword/{emp_no}")]
        public async Task<ActionResult<tb_user>> change_password(string emp_no, change_password Input)
        {

            if(User.FindFirst("emp_no").Value!=emp_no){
                return StatusCode(403,"Permission denied, only account owner can change password");
            }

            var tb_user = await _context.tb_user.Where(x => x.username == emp_no)
                            .FirstOrDefaultAsync();
            if (tb_user == null)
            {
                return NotFound();
            }

            var store = _context.tb_user.FirstOrDefault(u => u.username == emp_no);
            var user = _repository.VerifyPassword(Input.old_password, store.storedsalt, store.passwordhash);
            if (!user)
            {
                return StatusCode(403,"Password not match, please fill the right password");
            }

            tb_user.username = emp_no;
            var hashsalt = _repository.EncryptPassword(Input.new_password);
            tb_user.passwordhash = hashsalt.Hash;
            tb_user.storedsalt = hashsalt.Salt;
            tb_user.reset_password_at = DateTime.Now;
            tb_user.reset_password_by = User.FindFirst("emp_no").Value;

            _context.Entry(tb_user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!user_exists(emp_no))
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
        /* [AllowAnonymous]
        [HttpGet("register_users")]
        public async Task<ActionResult<tb_employee>> register_users()
        {
            Console.WriteLine("Start register..");
            var tb_employees = await _context.tb_employee
                            .FromSqlRaw("SELECT * FROM tb_employee A LEFT JOIN tb_user B ON A.emp_no=B.username WHERE B.username IS NULL")
                            .ToListAsync();

            if (tb_employees == null)
            {
                return NotFound();
            }

            foreach (var item in tb_employees)
            {
                tb_user tb = new tb_user();

                tb.username = item.emp_no;
                tb.emailconfirmed = true;
                var hashsalt = _repository.EncryptPassword(item.emp_no);
                tb.passwordhash = hashsalt.Hash;
                tb.storedsalt = hashsalt.Salt;
                tb.phonenumberconfirmed = true; 

                _context.tb_user.Add(tb);              
            } 

            await _context.SaveChangesAsync();
            Console.WriteLine("...End register");
            return Ok();
    
        } */

    }
}
public class change_password
{
    [DataType(DataType.Password)]
    public string old_password { get; set; }
    [NotMapped]
    [DataType(DataType.Password)]
    [StringLength(50, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
    public string new_password { get; set; }
    [NotMapped]
    [DataType(DataType.Password)]
    [Compare("new_password", ErrorMessage = "Confirm password does not match, type again")]
    public string confirm_password { get; set; }
}