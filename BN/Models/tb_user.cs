using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
namespace api_hrgis.Models
{
    public class tb_user
    {
        [Key]
        [StringLength(8)]
        public string username { get; set; }
        [EmailAddress]
        public string email { get; set; }
        public Boolean? emailconfirmed { get; set; }
        [NotMapped]
        [DataType(DataType.Password)]
        [StringLength(50, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
        public string password { get; set; }
        [NotMapped]
        [DataType(DataType.Password)]
        [Compare("Password", ErrorMessage = "Confirm password doesn't match, Type again !")]
        public string confirmpassword { get; set; }
        public string passwordhash { get; set; }
        public byte[] storedsalt { get; set; }
        public string phonenumber { get; set; }
        public Boolean? phonenumberconfirmed { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime? created_at { get; set; }
        public string created_by { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime? updated_at { get; set; }
        public string updated_by { get; set; }
        public DateTime? reset_password_at { get; set; }
        public string reset_password_by { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime? removed_at { get; set; }
        public string removed_by { get; set; }
    }
}