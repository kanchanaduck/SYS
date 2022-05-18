using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Common;
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Protocols;
using Microsoft.Extensions.Options;
using api_hrgis.Models;

using System.Linq;
using System.Threading.Tasks;

namespace api_hrgis.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //Composite Key
     
            modelBuilder.Entity<tr_course_master_band>()
                .HasKey(t => new { t.course_no, t.band }); 

            modelBuilder.Entity<tr_course_master_previous>()
                .HasKey(t => new { t.course_no, t.prev_course_no });               
            
            modelBuilder.Entity<tr_course_band>()
                .HasKey(t => new { t.course_no, t.band });
            
            modelBuilder.Entity<tr_course_trainer>()
                .HasKey(t => new { t.course_no, t.trainer_no });
            
            modelBuilder.Entity<tr_course_registration>()
                .HasKey(t => new { t.course_no, t.emp_no });
                
            modelBuilder.Entity<tr_stakeholder>()
                .HasKey(c => new { c.emp_no, c.org_code, c.role });

            modelBuilder.Entity<tr_stakeholder>()
                .HasKey(c => new { c.emp_no, c.org_code, c.role });
            
            modelBuilder.Entity<tr_survey_setting>()
                .HasKey(c => new { c.year, c.org_code });

            //Relation

            modelBuilder.Entity<tr_course_master_band>()
                .HasOne(mb => mb.bands)
                .WithMany(c => c.master_courses_bands)
                .HasForeignKey(mb => mb.band);

            modelBuilder.Entity<tr_course_master_band>()
                .HasOne(mb => mb.master_courses)
                .WithMany(b => b.master_courses_bands)
                .HasForeignKey(mb => mb.course_no);

            modelBuilder.Entity<tr_course_master_previous>()
                .HasOne(mb => mb.master_courses)
                .WithMany(b => b.master_courses_previous_courses)
                .HasForeignKey(mb => mb.course_no)
                .OnDelete(DeleteBehavior.ClientCascade);
            
            /* modelBuilder.Entity<tr_course_master_previous>()
                .HasOne(mb => mb.previous_courses)
                .WithMany(b => b.master_courses_previous_courses)
                .HasForeignKey(mb => mb.prev_course_no);  */
            
            modelBuilder.Entity<tr_course_band>()
                .HasOne(mb => mb.bands)
                .WithMany(c => c.courses_bands)
                .HasForeignKey(mb => mb.band);

            modelBuilder.Entity<tr_course_band>()
                .HasOne(mb => mb.courses)
                .WithMany(b => b.courses_bands)
                .HasForeignKey(mb => mb.course_no);

            modelBuilder.Entity<tr_course_trainer>()
                .HasOne(mb => mb.trainers)
                .WithMany(c => c.courses_trainers)
                .HasForeignKey(mb => mb.trainer_no);

            modelBuilder.Entity<tr_course_trainer>()
                .HasOne(mb => mb.courses)
                .WithMany(b => b.courses_trainers)
                .HasForeignKey(mb => mb.course_no);

            modelBuilder.Entity<tr_course_registration>()
                .HasOne(mb => mb.employees)
                .WithMany(c => c.courses_registrations)
                .HasForeignKey(mb => mb.emp_no);

            modelBuilder.Entity<tr_course_registration>()
                .HasOne(mb => mb.courses)
                .WithMany(b => b.courses_registrations)
                .HasForeignKey(mb => mb.course_no);
        }
        public DbSet<tb_hrms> tb_hrms { get; set; }
        public DbSet<tb_band> tb_band { get; set; }
        public DbSet<tb_employee> tb_employee { get; set; }
        public DbSet<tb_employee_temp> tb_employee_temp { get; set; }
        public DbSet<tb_organization> tb_organization { get; set; }
        public DbSet<tb_organization_temp> tb_organization_temp { get; set; }
        public DbSet<tb_menus> tb_menus { get; set; }
        public DbSet<tb_role> tb_role { get; set; }
        public DbSet<tr_center> tr_center { get; set; }
        public DbSet<tr_course_master> tr_course_master { get; set; }
        public DbSet<tr_course_registration>  tr_course_registration { get; set; }
        public DbSet<tr_course> tr_course { get; set; }
        public DbSet<tr_stakeholder> tr_stakeholder { get; set; }
        public DbSet<tr_survey_detail> tr_survey_detail { get; set; }
        public DbSet<tr_survey_setting> tr_survey_setting { get; set; } 
        public DbSet<tr_trainer> tr_trainer { get; set; }
        public DbSet<tr_course_trainer> tr_course_trainer { get; set; }
        public DbSet<tr_course_band> tr_course_band { get; set; }
        public DbSet<tb_user> tb_user { get; set; }
        public DbSet<tb_holiday> tb_holiday { get; set; }
        public DbSet<api_hrgis.Models.tr_setting> tr_setting { get; set; }
    }
}