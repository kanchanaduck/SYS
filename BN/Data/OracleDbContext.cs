using Microsoft.EntityFrameworkCore;
using api_hrgis.Models;

namespace api_hrgis.Data
{
    public class OracleDbContext : DbContext
    {
        public OracleDbContext (DbContextOptions<OracleDbContext> options)
            : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }   
    }
}