using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_hrgis.Models
{
    public class tb_employee
    {
        public string old_emp_no { get; set;}
        [Key]
        public string emp_no { get; set;}
        public string title_name_en { get; set;}
        public string firstname_en { get; set;}
        public string lastname_en { get; set;}
        public string title_name_th { get; set;}
        public string firstname_th { get; set;}
        public string lastname_th { get; set;}
        public string sex_en { get; set;}
        public string sex_th { get; set;}
        public string fullname_th{
            get
            {
                return firstname_en + " " + lastname_en;
            }
        }
        public string fullname_en{
            get
            {
               return firstname_en + " " + lastname_en;
            }
        }
        public string shortname_en{
            get
            {
                return firstname_en + " " + lastname_en.Substring(0,1)+ ".";
            }
        }
        public string center_code { get; set;}
        public string center_name { get; set;}
        public string div_code { get; set;}
        public string div_abb { get; set;}
        public string div_name { get; set;}
        public string dept_code { get; set;}
        public string dept_abb { get; set;}
        public string dept_name { get; set;}
        public string wc_code { get; set;}
        public string wc_abb { get; set;}
        public string wc_name { get; set;}
        public string band { get; set;}
        public string position_code { get; set;}
        public string position_name_en { get; set;}
        public string position_name_th { get; set;}
        [Column(TypeName = "date")]
        public DateTime? entrance_date { get; set;}
        [Column(TypeName = "date")]
        public DateTime? probation_date { get; set;}
        [Column(TypeName = "date")]
        public DateTime? resign_date { get; set;}
        [Column(TypeName = "date")]
        public DateTime? birthday { get; set;}
        public string id_card_no { get; set;}
        public string rfid_no { get; set;}
        public string email { get; set;}
        public string email_active_date { get; set;}
        public string email_active { get; set;}
        public string employed_status{
            get
            {
                return resign_date==null? "Employed":(resign_date < DateTime.Today) ? "Resigned":"Employed";
            }
        }
        public List<tr_course_registration> courses_registrations { get; set; }
        public virtual ICollection<tr_stakeholder> stakeholders { get; set; }
    }
}

