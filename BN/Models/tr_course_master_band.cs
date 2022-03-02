using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace api_hrgis.Models
{
    [Comment("ตารางจับคู่คอร์สมาสเตอร์และแบนด์")]
    public class tr_course_master_band
    {
        [MaxLength(10)]
        public string course_no { get; set; }
        public tr_course_master master_courses { get; set; }
        public string band { get; set; }
        public tb_band bands { get; set; }
    }
}