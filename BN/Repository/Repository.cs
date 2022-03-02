using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using api_hrgis.Models;
using api_hrgis.Repository;

namespace api_hrgis.Repository
{
    public class Repository<TDbContext> : IRepository where TDbContext : DbContext
    {
        protected TDbContext _dbContext;
        private IConfiguration _configuration;
        private string errorMsg;

        public Repository(TDbContext dbcontext, IConfiguration configuration)
        {
            _dbContext = dbcontext;
            _configuration = configuration;
        }

        public async Task<List<T>> SelectAll<T>() where T : class
        {
            return await this._dbContext.Set<T>().ToListAsync();
        }

        public async Task<T> SelectById<T>(int id) where T : class
        {
            return await this._dbContext.Set<T>().FindAsync(id);
        }

        public async Task CreateAsync<T>(T entity) where T : class
        {
            this._dbContext.Set<T>().Add(entity);

            _ = await this._dbContext.SaveChangesAsync();
        }

        public async Task AddRange<T>(List<T> lists) where T : class
        {
            await this._dbContext.Set<T>().AddRangeAsync(lists);

            _ = await this._dbContext.SaveChangesAsync();
        }

        public async Task DeleteAsync<T>(T entity) where T : class
        {
            this._dbContext.Set<T>().Remove(entity);

            _ = await this._dbContext.SaveChangesAsync();
        }
        public async Task RemoveRange<T>(List<T> lists) where T : class
        {
            this._dbContext.Set<T>().RemoveRange(lists);

            _ = await this._dbContext.SaveChangesAsync();
        }
        public async Task UpdateAsync<T>(T entity) where T : class
        {
            this._dbContext.Set<T>().Update(entity);

            _ = await this._dbContext.SaveChangesAsync();
        }

        public async Task UpdateRange<T>(List<T> lists) where T : class
        {
            this._dbContext.Set<T>().UpdateRange(lists);

            _ = await this._dbContext.SaveChangesAsync();
        }

        /// <summary>
        /// db
        /// </summary>
        /// <param name="query"></param>
        /// <returns></returns>
        public DataTable get_datatable(string query)
        {
            DataTable dt = new DataTable();
            string constr = _configuration.GetConnectionString("DefaultConnection");
            using (SqlConnection con = new SqlConnection(constr))
            {
                using (SqlCommand cmd = new SqlCommand(query))
                {
                    cmd.Connection = con;
                    using (SqlDataAdapter sda = new SqlDataAdapter(cmd))
                    {
                        sda.Fill(dt);
                    }
                }
            }

            return dt;
        }

        public DataTable dt_insert_update(string query)
        {
            string constr = _configuration.GetConnectionString("DefaultConnection");

            DataTable dt = new DataTable();
            SqlConnection con = new SqlConnection(constr);
            SqlCommand cmd = new SqlCommand(query, con);
            con.Open();
            // create data adapter
            SqlDataAdapter da = new SqlDataAdapter(cmd);
            // this will query your database and return the result to your datatable
            da.Fill(dt);
            con.Close();
            da.Dispose();

            return dt;
        }

        public SqlDataReader dr_insert_update(string cmd)
        {
            SqlCommand command = new SqlCommand();
            SqlDataAdapter sqlda = new SqlDataAdapter();
            SqlDataReader dr = null;
            string constr = _configuration.GetConnectionString("DefaultConnection");
            SqlConnection conn = new SqlConnection(constr);
            try
            {
                conn.Open();
                command = new SqlCommand(cmd, conn);
                dr = command.ExecuteReader();
                conn.Close();
            }
            catch (Exception ex)
            {
                errorMsg = ex.Message.ToString();
            }
            finally
            {
                if (!(conn == null))
                    conn.Dispose();
                if (!(command == null))
                    command.Dispose();
                if (!(sqlda == null))
                    sqlda.Dispose();
            }
            return dr;
        }

        public HashSalt EncryptPassword(string password)
        {
            // using System.Security.Cryptography;
            // using Microsoft.AspNetCore.Cryptography.KeyDerivation;
            byte[] salt = new byte[128 / 8]; // Generate a 128-bit salt using a secure PRNG
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }
            string encryptedPassw = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA1,
                iterationCount: 10000,
                numBytesRequested: 256 / 8
            ));
            return new HashSalt { Hash = encryptedPassw, Salt = salt };
        }

        public bool VerifyPassword(string enteredPassword, byte[] salt, string storedPassword)
        {
            string encryptedPassw = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: enteredPassword,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA1,
                iterationCount: 10000,
                numBytesRequested: 256 / 8
            ));
            return encryptedPassw == storedPassword;
        }

    }
}

public class HashSalt
{
    public string Hash { get; set; }
    public byte[] Salt { get; set; }
}