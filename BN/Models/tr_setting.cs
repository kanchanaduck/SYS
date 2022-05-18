using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace api_hrgis.Models
{
    [Comment("ตารางตั้งค่า")]
    public class tr_setting
    {
        public int id { get; set; }
        [Required]
        public string menu { get; set; }
        [Required]
        public string property { get; set; }
        public string value { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime? created_at { get; set; }
        public string created_by { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime updated_at { get { return _date; } set { _date = value; } }
        [Required]
        public string updated_by { get { return _username; } set { _username = value; } }
        private DateTime _date = DateTime.Now;
        private string _username = "014496";
    }
}