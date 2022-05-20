using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FoolProof.Core;
using Microsoft.EntityFrameworkCore;

namespace api_hrgis.Models
{
    public class tr_course
    {
        [Key]
        [MinLength(8)]
        [Required]
        [Display(Name = "COURSE NO.")]
        public string course_no { get; set; }
        [Required]
        [Display(Name = "THAI NAME")]
        public string course_name_th { get; set; }
        [Display(Name = "ENGLISH NAME")]
        public string course_name_en { get; set; }
        [Required]
        public string org_code { get; set; }
        [Required]
        [Display(Name = "DAYS")]
        [Range(1, double.MaxValue, ErrorMessage = "Only positive number allowed")]
        [Column(TypeName = "decimal(3,1)")]
        public decimal? days { get; set; }
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Only positive number allowed")]
        public int capacity { get; set; }
        public bool open_register { get; set; } = false;
        public string trainer_text { get; set; }
        [Required]
        [Column(TypeName = "datetime")]
        [Display(Name = "FROM")]
        [DataType(DataType.Date)] 
        public DateTime? date_start { get; set; } 
        [Required]
        [Column(TypeName = "datetime")]
        [Display(Name = "TO")]
        [DataType(DataType.Date)] 
        [GreaterThanOrEqualTo("date_start", ErrorMessage = "The TO cannot be before the FROM")]
        public DateTime? date_end { get; set; } 
        [Required]
        [Display(Name = "PLACE")]
        public string place { get; set; }
        [Required]
        [Display(Name = "MASTER COURSE NO.")]
        public string master_course_no { get; set; }
        // [ForeignKey("master_course_no")]
        // public virtual tr_course_master course_master { get; set; }
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
        public List<tr_course_band> courses_bands { get; set; }
        [Required]
        [Display(Name = "TRAINER")]
        public List<tr_course_trainer> courses_trainers { get; set; }
        public List<tr_course_registration> courses_registrations { get; set; } 
        [ForeignKey("org_code")]
        public virtual tb_organization organization { get; set; } 
        private DateTime _date = DateTime.Now;
        private string _username = "014496";
    }
}