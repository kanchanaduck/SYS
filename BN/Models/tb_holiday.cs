using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_hrgis.Models
{
    public class tb_holiday
    {
        [Key]
        [Column(TypeName = "date")]
        public DateTime holiday { get; set; }
        public string mark { get; set; }
    }
}