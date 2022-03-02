using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace api_hrgis.Models
{
    [Keyless]
    public class tr_course_band
    {
        public string course_no { get; set; }
        public tr_course courses { get; set; }
        public string band { get; set; }
        public tb_band bands { get; set; }
    }
}