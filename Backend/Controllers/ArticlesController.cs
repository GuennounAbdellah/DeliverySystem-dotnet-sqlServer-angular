using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Entities;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ArticlesController : ControllerBase
    {
        private readonly IArticleService _articleService;

        public ArticlesController(IArticleService articleService)
        {
            _articleService = articleService ?? throw new ArgumentNullException(nameof(articleService));
        }

        [HttpGet]
        public async Task<IActionResult> GetAllArticles()
        {
            try
            {
                var articles = await _articleService.GetAllArticles();
                return Ok(articles);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while fetching articles.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetArticleById(Guid id)
        {
            try
            {
                var article = await _articleService.GetArticleById(id);
                if (article == null)
                    return NotFound("Article not found.");

                return Ok(article);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while fetching the article.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateArticle([FromBody] ArticleCreateRequest article)
        {
            if (article == null)
                return BadRequest("Article cannot be null.");

            try
            {
                var createdArticle = await _articleService.CreateArticle(article);
                return CreatedAtAction(nameof(GetArticleById), new { id = createdArticle.Id }, createdArticle);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while creating the article: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateArticle(Guid id, [FromBody] ArticleCreateRequest article)
        {
            if (article == null)
                return BadRequest("Article cannot be null.");

            try
            {
                var updatedArticle = await _articleService.UpdateArticle(id, article);
                return Ok(updatedArticle);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while updating the article.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArticle(Guid id)
        {
            try
            {
                await _articleService.DeleteArticle(id);
                return NoContent();
            }
            catch (ApplicationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while deleting the article.");
            }
        }
    }
}