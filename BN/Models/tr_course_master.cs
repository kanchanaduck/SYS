using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace api_hrgis.Models
{
    [Comment("ตารางเก็บข้อมูลคอร์ส 6 หลัก เพื่อช่วยในการเปิดคอร์ส")]
    public class tr_course_master
    {
        [Key]
        [MaxLength(10)]
        [Required]
        [Display(Name = "COURSE NO.")]
        public string course_no { get; set; }
        [Required]
        [Display(Name = "THAI NAME")]
        public string course_name_th { get; set; }
        [Required]
        [Display(Name = "ENGLISH NAME")]
        public string course_name_en { get; set; }
        [Required]
        [Display(Name = "GROUP")]
        public string org_code { get; set; }
        [Required]
        [Range(1, double.MaxValue, ErrorMessage = "Only positive number allowed")]
        [Display(Name = "CAPACITY")]
        public int? capacity { get; set; }
        [Required]
        [Display(Name = "DAYS")]
        [Range(0.5, double.MaxValue, ErrorMessage = "Only positive number allowed")]
        [Column(TypeName = "decimal(3,1)")]
        public decimal? days { get; set; }
        public string category { get; set; }
        public string level { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime? created_at { get; set; } 
        public string created_by { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime updated_at { get { return _date; } set { _date = value; } }
        [Required]
        public string updated_by { get { return _username; } set { _username = value; } }
        public bool? status_active { get; set; }
        [Required]
        [Display(Name = "BAND")]
        public List<tr_course_master_band> master_courses_bands { get; set; }
        [NotMapped]
        public List<tr_course_master_previous> master_courses_previous_courses { get; set; }
        [ForeignKey("org_code")]
        public virtual tb_organization organization { get; set; }
        private DateTime _date = DateTime.Now;
        private string _username = "014496";
    }
}