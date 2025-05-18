using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Entities;
using Backend.Models;

namespace Backend.Services
{
    public interface ILivraisonService
    {
        Task<List<Livraison>> GetAllLivraisons();
        Task<Livraison> GetLivraisonById(Guid id);
        Task<Livraison> CreateLivraison(LivraisonCreateRequest livraisonRequest);
        Task<Livraison> UpdateLivraison(Guid id, LivraisonCreateRequest livraisonRequest);
        Task DeleteLivraison(Guid id);
        Task<Compteur> GetLastCompteur();
        Task<Compteur> increaseCompteur();
    }

    public class LivraisonService : ILivraisonService 
    {
        private readonly AppDbContext _context;

        public LivraisonService(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<List<Livraison>> GetAllLivraisons()
        {
            return await _context.Livraisons
                .Include(l => l.Client)
                .Include(l => l.User)
                .Include(l => l.DetailLivraisons)
                .ThenInclude(d => d.Article)
                .ToListAsync();
        }

        public async Task<Livraison> GetLivraisonById(Guid id)
        {
            var livraison = await _context.Livraisons
                .Include(l => l.Client)
                .Include(l => l.User)
                .Include(l => l.DetailLivraisons)
                .ThenInclude(d => d.Article)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (livraison == null)
                throw new ApplicationException("Livraison not found.");

            return livraison;
        }

        public async Task<Livraison> CreateLivraison(LivraisonCreateRequest livraisonRequest)
        {
            if (string.IsNullOrEmpty(livraisonRequest.Numero))
                throw new ApplicationException("Livraison number is required.");

            // Verify that Client exists
            var client = await _context.Clients.FindAsync(livraisonRequest.ClientId);
            if (client == null)
                throw new ApplicationException("Selected Client does not exist.");

            // Verify that User exists
            var user = await _context.Users.FindAsync(livraisonRequest.UserId);
            if (user == null)
                throw new ApplicationException("Selected User does not exist.");

            var livraison = new Livraison
            {
                Id = Guid.NewGuid(),
                ClientId = livraisonRequest.ClientId,
                UserId = livraisonRequest.UserId,
                Date = livraisonRequest.Date,
                Info = livraisonRequest.Info,
                Numero = livraisonRequest.Numero,
                TotalHt = livraisonRequest.TotalHt,
                TotalTva = livraisonRequest.TotalTva,
                Escompte = livraisonRequest.Escompte,
                TotalTtc = livraisonRequest.TotalTtc,
                Editeur = livraisonRequest.Editeur,
                Client = client,
                User = user
            };

            _context.Livraisons.Add(livraison);

            // Process DetailLivraisons if provided
            if (livraisonRequest.DetailLivraisons != null && livraisonRequest.DetailLivraisons.Count > 0)
            {
                foreach (var detailRequest in livraisonRequest.DetailLivraisons)
                {
                    // Verify that Article exists
                    var article = await _context.Articles.FindAsync(detailRequest.ArticleId);
                    if (article == null)
                        throw new ApplicationException($"Article with ID {detailRequest.ArticleId} does not exist.");
                    if(article.Stock < detailRequest.Quantite)
                        throw new ApplicationException($"Insufficient stock for Article with ID {detailRequest.ArticleId}. Available: {article.Stock}, Required: {detailRequest.Quantite}");

                    var detailLivraison = new DetailLivraison
                    {
                        Id = Guid.NewGuid(),
                        LivraisonId = livraison.Id,
                        Livraison = livraison,
                        ArticleId = detailRequest.ArticleId,
                        Article = article,
                        Designation = detailRequest.Designation,
                        Quantite = detailRequest.Quantite,
                        PuHt = detailRequest.PuHt,
                        PuHtRemise = detailRequest.PuHtRemise,
                        RemiseHt = detailRequest.RemiseHt,
                        PuTtc = detailRequest.PuTtc,
                        PuTtcRemise = detailRequest.PuTtcRemise,
                        RemiseTtc = detailRequest.RemiseTtc,
                        MontantHt = detailRequest.MontantHt,
                        MontantTtc = detailRequest.MontantTtc
                    };
                    article.Stock -= detailRequest.Quantite;
                    livraison.DetailLivraisons.Add(detailLivraison);
                }
            }

            await _context.SaveChangesAsync();

            return await GetLivraisonById(livraison.Id);
        }

        public async Task<Livraison> UpdateLivraison(Guid id, LivraisonCreateRequest livraisonRequest)
        {
            var livraison = await _context.Livraisons
                .Include(l => l.DetailLivraisons)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (livraison == null)
                throw new ApplicationException("Livraison not found.");

            // Verify Client exists if ID is provided
            if (livraisonRequest.ClientId != Guid.Empty)
            {
                var client = await _context.Clients.FindAsync(livraisonRequest.ClientId);
                if (client == null)
                    throw new ApplicationException("Selected Client does not exist.");

                livraison.ClientId = livraisonRequest.ClientId;
            }

            // Verify User exists if ID is provided
            if (livraisonRequest.UserId != Guid.Empty)
            {
                var user = await _context.Users.FindAsync(livraisonRequest.UserId);
                if (user == null)
                    throw new ApplicationException("Selected User does not exist.");

                livraison.UserId = livraisonRequest.UserId;
            }

            // Update other properties
            if (!string.IsNullOrEmpty(livraisonRequest.Numero))
                livraison.Numero = livraisonRequest.Numero;

            livraison.Date = livraisonRequest.Date;
            livraison.Info = livraisonRequest.Info;
            livraison.TotalHt = livraisonRequest.TotalHt;
            livraison.TotalTva = livraisonRequest.TotalTva;
            livraison.Escompte = livraisonRequest.Escompte;
            livraison.TotalTtc = livraisonRequest.TotalTtc;
            livraison.Editeur = livraisonRequest.Editeur;

            // Update DetailLivraisons
            if (livraisonRequest.DetailLivraisons != null && livraisonRequest.DetailLivraisons.Count > 0)
            {
                // Remove existing details
                _context.DetailLivraisons.RemoveRange(livraison.DetailLivraisons);

                // Add new details
                foreach (var detailRequest in livraisonRequest.DetailLivraisons)
                {
                    // Verify Article exists
                    var article = await _context.Articles.FindAsync(detailRequest.ArticleId);
                    if (article == null)
                        throw new ApplicationException($"Article with ID {detailRequest.ArticleId} does not exist.");

                    var detailLivraison = new DetailLivraison
                    {
                        Id = Guid.NewGuid(),
                        LivraisonId = livraison.Id,
                        Livraison = livraison,
                        ArticleId = detailRequest.ArticleId,
                        Article = article,
                        Designation = detailRequest.Designation,
                        Quantite = detailRequest.Quantite,
                        PuHt = detailRequest.PuHt,
                        PuHtRemise = detailRequest.PuHtRemise,
                        RemiseHt = detailRequest.RemiseHt,
                        PuTtc = detailRequest.PuTtc,
                        PuTtcRemise = detailRequest.PuTtcRemise,
                        RemiseTtc = detailRequest.RemiseTtc,
                        MontantHt = detailRequest.MontantHt,
                        MontantTtc = detailRequest.MontantTtc
                    };

                    livraison.DetailLivraisons.Add(detailLivraison);
                }
            }

            await _context.SaveChangesAsync();

            return await GetLivraisonById(id);
        }

        public async Task DeleteLivraison(Guid id)
        {
            var livraison = await _context.Livraisons
                .Include(l => l.DetailLivraisons)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (livraison == null)
                throw new ApplicationException("Livraison not found.");

            // Remove associated detail livraisons
            _context.DetailLivraisons.RemoveRange(livraison.DetailLivraisons);

            // Remove the livraison
            _context.Livraisons.Remove(livraison);

            await _context.SaveChangesAsync();
        }

        public async Task<Compteur> GetLastCompteur()
        {
            var compteur = await _context.Compteurs
                .OrderByDescending(c => c.Nombre)
                .FirstOrDefaultAsync();

            if (compteur == null)
                throw new ApplicationException("No Compteur found.");

            Console.WriteLine($"Retrieved Compteur: {compteur.Id} - Nombre: {compteur.Nombre}");

            return compteur;
        }
        public async Task<Compteur> increaseCompteur()
        {
            var compteur = await _context.Compteurs
                .OrderByDescending(c => c.Nombre)
                .FirstOrDefaultAsync();

            if (compteur == null)
                throw new ApplicationException("No Compteur found.");

            compteur.Nombre++ ;

            await _context.SaveChangesAsync();

            return compteur;
        }
    }
}