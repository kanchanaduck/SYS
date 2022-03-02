using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FoolProof.Core;
using Microsoft.EntityFrameworkCore;

namespace api_hrgis.Models
{
    [Comment("ตารางเก็บข้อมูลเทรนเนอร์")]
    public class tr_trainer
    {
        [Key]
        public int trainer_no { get; set; }  
        [MaxLength(7)]
        [RequiredIf("trainer_type","Internal",ErrorMessage = "EMP NO. is required due to TRAINER TYPE is Internal")]
        [Display(Name = "EMP NO.")]
        public string emp_no { get; set; }
        public string title_name_en { get; set; }
        [RequiredIf("trainer_type","External",ErrorMessage = "FIRSTNAME is required due to TRAINER TYPE is External")]
        [Display(Name = "FIRSTNAME")]
        public string firstname_en { get; set; }
        [RequiredIf("trainer_type","External",ErrorMessage = "LASTNAME is required due to TRAINER TYPE is External")]
        [Display(Name = "LASTNAME")]
        public string lastname_en { get; set; }
        public string title_name_th { get; set; }
        public string firstname_th { get; set; }
        public string lastname_th { get; set; }
        [Required]
        [Display(Name = "TRAINER TYPE")]
        public string trainer_type { get; set; } = "Internal";
        [RequiredIf("trainer_type","External",ErrorMessage = "ORGANIZATION is required due to TRAINER TYPE is External")]
        public string organization { get; set; }
        public bool? status_active { get; set; }
        public string remark { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime? created_at { get; set; }
        public string created_by { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime updated_at { get { return _date; } set { _date = value; } }
        [Required]
        public string updated_by { get { return _username; } set { _username = value; } }
        public List<tr_course_trainer> courses_trainers { get; set; }
        private DateTime _date = DateTime.Now;
        private string _username = "014496";
    }
}