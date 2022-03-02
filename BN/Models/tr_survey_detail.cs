using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace api_hrgis.Models
{
    [Keyless]
    [Comment("ตารางเก็บข้อมูลการ survey")]
    public class tr_survey_detail
    {
        [MaxLength(4)]
        [Column("year")]
        public string year { get; set; }
        [Required]
        public string division { get; set; }
        [Required]
        public string department { get; set; }
        [Required]
        public string emp_no { get; set; }
        [Required]
        [Comment("เลขคอร์ส 6 หลัก")]
        public string course_no { get; set; }
        [Required]
        [Range(1,12)]
        [Comment("เก็บเดือนที่ต้องการเรียน")]
        public int month { get; set; }
        [Required]
        public string file_name { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime? created_at { get; set; }
        public string created_by { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime updated_at { get { return _date; } set { _date = value; } }
        [Required]
        public string updated_by { get { return _username; } set { _username = value; } }
        private DateTime _date = DateTime.Now;
        private string _username = "014496";
    }

}