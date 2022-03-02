using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_hrgis.Models
{
    public class tb_menus
    {
        [Key]
        public int menu_code { get; set; }
        [Required]
        public string menu_name { get; set; }
        public int? parent_menu_code { get; set; }
        public string description { get; set; }
        public string url { get; set; }
        public string spare1 { get; set; }
        public string spare2 { get; set; }
        public string spare3 { get; set; }
        public string spare4 { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime updated_at { get { return _date; } set { _date = value; } }
        [Required]
        public string updated_by { get { return _username; } set { _username = value; } }
        [ForeignKey("parent_menu_code")]
        public virtual tb_menus parent { get; set; }
        public virtual ICollection<tb_menus> children { get; set; }
        private DateTime _date = DateTime.Now;
        private string _username = "014496";
    }
}