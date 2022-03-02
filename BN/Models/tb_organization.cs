using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace api_hrgis.Models
{
    public class tb_organization
    {
        [Required]
        public int level_seq { get; set; }
        [Required]
        public string level_name { get; set; }
        [Comment("Center (1) > Division (2) > Department(3) > Work center(4)")]
        [Key]
        public string org_code { get; set; }
        public string org_abb { get; set; }
        [Required]
        public string org_name { get; set; }
        public string parent_org_code { get; set; }
        [ForeignKey("parent_org_code")]
        public virtual tb_organization parent_org { get; set; }
        public virtual ICollection<tb_organization> children_org { get; set; }
        public virtual ICollection<tr_stakeholder> stakeholders { get; set; }
        public virtual ICollection<tr_course_master> course_masters { get; set; }
        public virtual ICollection<tr_course> courses { get; set; }
    }
}