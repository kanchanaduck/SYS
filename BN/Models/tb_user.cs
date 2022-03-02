using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_hrgis.Models
{
    public class tb_user
    {
        public int id { get; set; }
        [StringLength(450)]
        public string username { get; set; }
        [StringLength(256)]
        public string email { get; set; }
        public Boolean? emailconfirmed { get; set; }
        public string passwordhash { get; set; }
        public byte[] storedsalt { get; set; }
        public string phonenumber { get; set; }
        public Boolean? phonenumberconfirmed { get; set; }
    }
}