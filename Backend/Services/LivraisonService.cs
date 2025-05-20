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
            //So if something goes wrong, all changes can be undone safely.
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Load the Livraison entity including RowVersion for concurrency check
                var livraison = await _context.Livraisons.FindAsync(id);
                if (livraison == null)
                    throw new ApplicationException("Livraison not found.");

                // Set the RowVersion from the request for concurrency check
                _context.Entry(livraison).Property("RowVersion").OriginalValue = livraisonRequest.RowVersion;

                // Then load the related entities
                await _context.Entry(livraison).Collection(l => l.DetailLivraisons).LoadAsync();
                
                // Store article IDs for needed stock updates
                var articleIds = livraison.DetailLivraisons.Select(d => d.ArticleId).ToList();

                // Load all articles that need stock updates in a single query to ensure fresh data
                var articlesToUpdate = await _context.Articles
                    .Where(a => articleIds.Contains(a.Id))
                    .ToDictionaryAsync(a => a.Id);
                        
                // Update stock quantities - restore stock for existing details
                foreach (var detail in livraison.DetailLivraisons)
                {
                    if (articlesToUpdate.TryGetValue(detail.ArticleId, out var article))
                    {
                        article.Stock += detail.Quantite;
                    }
                }

                await _context.SaveChangesAsync();
                
                // Now handle the detail removals
                var detailsToRemove = livraison.DetailLivraisons.ToList();
                _context.DetailLivraisons.RemoveRange(detailsToRemove);
                livraison.DetailLivraisons.Clear();
                await _context.SaveChangesAsync();
                
                // Update livraison properties
                livraison.Numero = livraisonRequest.Numero;
                livraison.Date = livraisonRequest.Date;
                livraison.Info = livraisonRequest.Info;
                livraison.TotalHt = livraisonRequest.TotalHt;
                livraison.TotalTva = livraisonRequest.TotalTva;
                livraison.Escompte = livraisonRequest.Escompte;
                livraison.TotalTtc = livraisonRequest.TotalTtc;
                livraison.Editeur = livraisonRequest.Editeur;

                // Update client if changed
                if (livraison.ClientId != livraisonRequest.ClientId)
                {
                    var client = await _context.Clients.FindAsync(livraisonRequest.ClientId);
                    if (client == null)
                        throw new ApplicationException("Selected Client does not exist.");
                    
                    livraison.ClientId = livraisonRequest.ClientId;
                }

                // Update user if changed
                if (livraison.UserId != livraisonRequest.UserId)
                {
                    var user = await _context.Users.FindAsync(livraisonRequest.UserId);
                    if (user == null)
                        throw new ApplicationException("Selected User does not exist.");
                    
                    livraison.UserId = livraisonRequest.UserId;
                }

                // Process new details with fresh article data
                if (livraisonRequest.DetailLivraisons != null && livraisonRequest.DetailLivraisons.Count > 0)
                {
                    foreach (var detailRequest in livraisonRequest.DetailLivraisons)
                    {
                        // Get article with fresh data
                        var article = await _context.Articles.FindAsync(detailRequest.ArticleId);
                        if (article == null)
                            throw new ApplicationException($"Article with ID {detailRequest.ArticleId} does not exist.");
                        
                        if (article.Stock < detailRequest.Quantite)
                            throw new ApplicationException($"Insufficient stock for Article with ID {detailRequest.ArticleId}. Available: {article.Stock}, Required: {detailRequest.Quantite}");

                        article.Stock -= detailRequest.Quantite;
                        
                        // Add new detail
                        var newDetail = new DetailLivraison
                        {
                            Id = Guid.NewGuid(),
                            LivraisonId = livraison.Id,
                            ArticleId = detailRequest.ArticleId,
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
                        
                        _context.DetailLivraisons.Add(newDetail);
                    }
                }
                
                try 
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    // If we get here, the record has been modified since it was loaded
                    throw new ApplicationException("The record has been modified by another user. Please refresh and try again.");
                }

                await transaction.CommitAsync();
                
                // Return the updated livraison with all included data
                return await GetLivraisonById(livraison.Id);
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync();
                throw new ApplicationException("The record has been modified by another user. Please refresh and try again.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new ApplicationException($"Error updating livraison: {ex.Message}", ex);
            }
        }

        public async Task DeleteLivraison(Guid id)
        {
            var livraison = await _context.Livraisons
                .Include(l => l.DetailLivraisons)
                    .ThenInclude(dl => dl.Article)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (livraison == null)
                throw new ApplicationException("Livraison not found.");

            // Restore stock for articles in this livraison
            foreach (var detail in livraison.DetailLivraisons)
            {
                if (detail.Article != null)
                {
                    detail.Article.Stock += detail.Quantite;
                }
            }
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