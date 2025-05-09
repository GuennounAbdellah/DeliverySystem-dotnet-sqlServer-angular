using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Entities;

namespace Backend.Services
{
    public interface IUniteService
    {
        Task<List<Unite>> GetAllUnites();
        Task<Unite> GetUniteById(Guid id);
        Task<Unite> CreateUnite(Unite unite);
        Task<Unite> UpdateUnite(Guid id, Unite unite);
        Task DeleteUnite(Guid id);
    }

    public class UniteService : IUniteService
    {
        private readonly AppDbContext _context;

        public UniteService(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<List<Unite>> GetAllUnites()
        {
            return await _context.Unites.ToListAsync();
        }

        public async Task<Unite> GetUniteById(Guid id)
        {
            var unite = await _context.Unites.FirstOrDefaultAsync(u => u.Id == id);

            if (unite == null)
                throw new ApplicationException("Unite not found.");
                
            return unite;
        }

        public async Task<Unite> CreateUnite(Unite unite)
        {
            if (string.IsNullOrEmpty(unite.Nom))
                throw new ApplicationException("Unite name is required.");

            if (string.IsNullOrEmpty(unite.Abreviation))
                throw new ApplicationException("Unite abreviation is required.");

            unite.Id = Guid.NewGuid();
            
            _context.Unites.Add(unite);
            
            await _context.SaveChangesAsync();

            return await GetUniteById(unite.Id);
        }

        public async Task<Unite> UpdateUnite(Guid id, Unite updatedUnite)
        {
            var unite = await _context.Unites.FirstOrDefaultAsync(u => u.Id == id);
            if (unite == null)
                throw new ApplicationException("Unite not found.");

            if (!string.IsNullOrEmpty(updatedUnite.Nom))
                unite.Nom = updatedUnite.Nom;
            if (!string.IsNullOrEmpty(updatedUnite.Abreviation))
                unite.Abreviation = updatedUnite.Abreviation;

            await _context.SaveChangesAsync();
            
            return unite;
        }

        public async Task DeleteUnite(Guid id)
        {
            var unite = await _context.Unites.FindAsync(id);
            if (unite == null)
                throw new ApplicationException("Unite not found.");

            var isReferenced = await _context.Articles.AnyAsync(a => a.UniteId == id);
            if (isReferenced)
                throw new ApplicationException("Cannot delete unite because it is associated with articles.");

            _context.Unites.Remove(unite);
            
            await _context.SaveChangesAsync();
        }
    }
}