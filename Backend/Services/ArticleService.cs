using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Entities;
using Backend.Models;

namespace Backend.Services
{
    public interface IArticleService
    {
        Task<List<Article>> GetAllArticles();
        Task<Article> GetArticleById(Guid id);
        Task<Article> CreateArticle(ArticleCreateRequest articleRequest);
        Task<Article> UpdateArticle(Guid id, ArticleCreateRequest articleRequest);
        Task DeleteArticle(Guid id);
    }

    public class ArticleService : IArticleService
    {
        private readonly AppDbContext _context;

        public ArticleService(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<List<Article>> GetAllArticles()
        {
            return await _context.Articles
                .Include(a => a.Unite)
                .Include(a => a.Famille)
                .ToListAsync();
        }

        public async Task<Article> GetArticleById(Guid id)
        {
            var article = await _context.Articles
                .Include(a => a.Unite)
                .Include(a => a.Famille)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (article == null)
                throw new ApplicationException("Article not found.");
                
            return article;
        }

        public async Task<Article> CreateArticle(ArticleCreateRequest articleRequest)
        {
            if (string.IsNullOrEmpty(articleRequest.Reference))
                throw new ApplicationException("Article reference is required.");

            if (string.IsNullOrEmpty(articleRequest.Designation))
                throw new ApplicationException("Article designation is required.");

            var existingArticle = await _context.Articles
                .FirstOrDefaultAsync(a => a.Reference == articleRequest.Reference);
            if (existingArticle != null)
                throw new ApplicationException("Article with the same reference exists.");

            // Verify that Unite exists
            var unite = await _context.Unites.FindAsync(articleRequest.UniteId);
            if (unite == null)
                throw new ApplicationException("Selected Unite does not exist.");

            // Verify that Famille exists
            var famille = await _context.Familles.FindAsync(articleRequest.FamilleId);
            if (famille == null)
                throw new ApplicationException("Selected Famille does not exist.");

            var article = new Article
            {
                Id = Guid.NewGuid(),
                Reference = articleRequest.Reference,
                Designation = articleRequest.Designation,
                Stock = articleRequest.Stock,
                UniteId = articleRequest.UniteId,
                FamilleId = articleRequest.FamilleId,
                PuHt = articleRequest.PuHt,
                MontantHt = articleRequest.MontantHt,
                Stock_Minimum = articleRequest.Stock_Minimum,
                Unite = unite, 
                Famille = famille
            };
            
            _context.Articles.Add(article);
            await _context.SaveChangesAsync();

            return await GetArticleById(article.Id);
        }

        public async Task<Article> UpdateArticle(Guid id, ArticleCreateRequest articleRequest)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article == null)
                throw new ApplicationException("Article not found.");

            // Verify that Unite exists
            if (articleRequest.UniteId != Guid.Empty)
            {
                var unite = await _context.Unites.FindAsync(articleRequest.UniteId);
                if (unite == null)
                    throw new ApplicationException("Selected Unite does not exist.");
                
                article.UniteId = articleRequest.UniteId;
            }

            // Verify that Famille exists
            if (articleRequest.FamilleId != Guid.Empty)
            {
                var famille = await _context.Familles.FindAsync(articleRequest.FamilleId);
                if (famille == null)
                    throw new ApplicationException("Selected Famille does not exist.");
                
                article.FamilleId = articleRequest.FamilleId;
            }

            if (!string.IsNullOrEmpty(articleRequest.Reference))
                article.Reference = articleRequest.Reference;
            
            if (!string.IsNullOrEmpty(articleRequest.Designation))
                article.Designation = articleRequest.Designation;
            
            article.Stock = articleRequest.Stock;
            article.PuHt = articleRequest.PuHt;
            article.MontantHt = articleRequest.MontantHt;

            await _context.SaveChangesAsync();
            
            return await GetArticleById(id);
        }

        public async Task DeleteArticle(Guid id)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article == null)
                throw new ApplicationException("Article not found.");

            var isReferenced = await _context.DetailLivraisons.AnyAsync(d => d.ArticleId == id);
            if (isReferenced)
                throw new ApplicationException("Cannot delete article because it is associated with deliveries.");

            _context.Articles.Remove(article);
            
            await _context.SaveChangesAsync();
        }
    }
}