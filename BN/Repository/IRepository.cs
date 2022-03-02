using api_hrgis.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace api_hrgis.Repository
{
    public interface IRepository
    {
        Task<List<T>> SelectAll<T>() where T : class;
        Task<T> SelectById<T>(int id) where T : class;
        Task CreateAsync<T>(T entity) where T : class;
        Task AddRange<T>(List<T> lists) where T : class;
        Task UpdateAsync<T>(T entity) where T : class;
        Task UpdateRange<T>(List<T> lists) where T : class;
        Task DeleteAsync<T>(T entity) where T : class;
        Task RemoveRange<T>(List<T> lists) where T : class;
        DataTable get_datatable(string query);
        DataTable dt_insert_update(string query);
        SqlDataReader dr_insert_update(string query);
        HashSalt EncryptPassword(string password);
        bool VerifyPassword(string enteredPassword, byte[] salt, string storedPassword);
    }
}
