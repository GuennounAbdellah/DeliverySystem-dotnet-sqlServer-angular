using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Entities;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LivraisonsController : ControllerBase
    {
        private readonly ILivraisonService _livraisonService;

        public LivraisonsController(ILivraisonService livraisonService)
        {
            _livraisonService = livraisonService ?? throw new ArgumentNullException(nameof(livraisonService));
        }

        [HttpGet]
        [RoleOrAdmin("Livraisons.View")]
        public async Task<IActionResult> GetAllLivraisons()
        {
            try
            {
                var livraisons = await _livraisonService.GetAllLivraisons();
                return Ok(livraisons);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while fetching livraisons.");
            }
        }

        [HttpGet("{id}")]
        [RoleOrAdmin("Livraisons.View")]
        public async Task<IActionResult> GetLivraisonById(Guid id)
        {
            try
            {
                var livraison = await _livraisonService.GetLivraisonById(id);
                if (livraison == null)
                    return NotFound("Livraison not found.");

                return Ok(livraison);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while fetching the livraison.");
            }
        }

        [HttpPost]
        [RoleOrAdmin("Livraisons.Create")]
        public async Task<IActionResult> CreateLivraison([FromBody] LivraisonCreateRequest livraison)
        {
            if (livraison == null)
                return BadRequest("Livraison cannot be null.");

            try
            {
                var createdLivraison = await _livraisonService.CreateLivraison(livraison);
                return CreatedAtAction(nameof(GetLivraisonById), new { id = createdLivraison.Id }, createdLivraison);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while creating the livraison: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        [RoleOrAdmin("Livraisons.Edit")]
        public async Task<IActionResult> UpdateLivraison(Guid id, [FromBody] LivraisonCreateRequest livraison)
        {   
            if (livraison == null)
                return BadRequest("Livraison cannot be null.");

            try
            {
                var updatedLivraison = await _livraisonService.UpdateLivraison(id, livraison);
                return Ok(updatedLivraison);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating livraison: {ex.ToString()}");
                return StatusCode(500, $"An error occurred while updating the livraison: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [RoleOrAdmin("Livraisons.Delete")]
        public async Task<IActionResult> DeleteLivraison(Guid id)
        {
            try
            {
                await _livraisonService.DeleteLivraison(id);
                return NoContent();
            }
            catch (ApplicationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while deleting the livraison.");
            }
        }
        [HttpGet("compteur")]
        [Authorize]
        public async Task<IActionResult> GetCompteur()
        {
            try
            {
                var compteur = await _livraisonService.GetLastCompteur();
                return Ok(compteur);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while fetching the compteur.");
            }
        }
        [HttpPut("compteur")]
        [Authorize]
        public async Task<IActionResult> UpdateCompteur()
        {
            try
            {
                var compteur = await _livraisonService.increaseCompteur();
                return Ok(compteur);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while updating the compteur.");
            }
        }
    }
}