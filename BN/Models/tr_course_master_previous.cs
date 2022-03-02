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
    [Comment("ตารางจับคู่คอร์สและคอร์สก่อนหน้า")]
    public class tr_course_master_previous
    {
        [MaxLength(10)]
        public string course_no { get; set; }
        public tr_course_master master_courses { get; set; }
        [MaxLength(10)]
        public string prev_course_no { get; set; }
        /* public tr_course_master previous_courses { get; set; }   */    
        /* [InverseProperty("course_no")]
        public virtual ICollection<tr_course_master> previous_courses { get; set; } */
    }
}