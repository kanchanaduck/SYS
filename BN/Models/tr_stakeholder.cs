using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace api_hrgis.Models
{
    [Comment("ตารางเก็บข้อมูลผู้ที่เกี่ยวข้อง")]
    public class tr_stakeholder
    {
        [Required]
        public string emp_no { get; set; }
        [Required]
        public string role { get; set; }
        [Required]
        public string org_code { get; set; }        
        public string remark { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime? created_at { get; set; }
        public string created_by { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime updated_at { get { return _date; } set { _date = value; } }
        [Required]
        public string updated_by { get { return _username; } set { _username = value; } }
        [ForeignKey("org_code")]
        public virtual tb_organization organization { get; set; }
        [ForeignKey("emp_no")]
        public virtual tb_employee employee { get; set; }
        private DateTime _date = DateTime.Now;
        private string _username = "014496";
    }
}