using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_hrgis.Models
{
    public class tr_course
    {
        [Key]
        [MinLength(8)]
        public string course_no { get; set; }
        public string course_name_th { get; set; }
        public string course_name_en { get; set; }
        public string org_code { get; set; }
        public int days { get; set; }
        public int capacity { get; set; }
        public bool? open_register { get; set; }
        [Required]
        [Column(TypeName = "date")]
        public DateTime date_start { get; set; } 
        [Required]
        [Column(TypeName = "date")]
        public DateTime date_end { get; set; } 
        [Required]
        [Column(TypeName = "time")]
        public TimeSpan time_in { get; set; } 
        [Required]
        [Column(TypeName = "time")]
        public TimeSpan time_out { get; set; }
        [Required]
        public string place { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime? created_at { get; set; } 
        public string created_by { get; set; }  
        [Column(TypeName = "datetime")]
        public DateTime updated_at { get { return _date; } set { _date = value; } }
        [Required]
        public string updated_by { get { return _username; } set { _username = value; } }
        public bool? status_active { get; set; }
        public List<tr_course_band> courses_bands { get; set; }
        public List<tr_course_trainer> courses_trainers { get; set; }
        public List<tr_course_registration> courses_registrations { get; set; } 
        [ForeignKey("org_code")]
        public virtual tb_organization organization { get; set; } 
        private DateTime _date = DateTime.Now;
        private string _username = "014496";
    }
}