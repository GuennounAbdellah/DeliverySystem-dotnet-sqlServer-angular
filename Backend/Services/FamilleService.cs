using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Entities;

namespace Backend.Services
{
    public interface IFamilleService
    {
        Task<List<Famille>> GetAllFamilles();
        Task<Famille> GetFamilleById(Guid id);
        Task<Famille> CreateFamille(Famille famille);
        Task<Famille> UpdateFamille(Guid id, Famille famille);
        Task DeleteFamille(Guid id);
    }

    public class FamilleService : IFamilleService
    {
        private readonly AppDbContext _context;

        public FamilleService(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<List<Famille>> GetAllFamilles()
        {
            return await _context.Familles.ToListAsync();
        }

        public async Task<Famille> GetFamilleById(Guid id)
        {
            var famille = await _context.Familles.FirstOrDefaultAsync(f => f.Id == id);

            if (famille == null)
                throw new ApplicationException("Famille not found.");
                
            return famille;
        }

        public async Task<Famille> CreateFamille(Famille famille)
        {
            if (string.IsNullOrEmpty(famille.Nom))
                throw new ApplicationException("Famille name is required.");

            famille.Id = Guid.NewGuid();
            
            _context.Familles.Add(famille);
            
            await _context.SaveChangesAsync();

            return await GetFamilleById(famille.Id);
        }

        public async Task<Famille> UpdateFamille(Guid id, Famille updatedFamille)
        {
            var famille = await _context.Familles.FirstOrDefaultAsync(f => f.Id == id);
            if (famille == null)
                throw new ApplicationException("Famille not found.");

            if (!string.IsNullOrEmpty(updatedFamille.Nom))
                famille.Nom = updatedFamille.Nom;
            
            famille.Tva = updatedFamille.Tva;

            await _context.SaveChangesAsync();
            
            return famille;
        }

        public async Task DeleteFamille(Guid id)
        {
            var famille = await _context.Familles.FindAsync(id);
            if (famille == null)
                throw new ApplicationException("Famille not found.");

            var isReferenced = await _context.Articles.AnyAsync(a => a.FamilleId == id);
            if (isReferenced)
                throw new ApplicationException("Cannot delete famille because it is associated with articles.");

            _context.Familles.Remove(famille);
            
            await _context.SaveChangesAsync();
        }
    }
}