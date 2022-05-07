	
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_hrgis.Models
{
    public class tb_hrms
    {
        public int id { get; set; }
        public string description { get; set; }
        public string updated_by { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime? updated_at { get; set; }
    }
}