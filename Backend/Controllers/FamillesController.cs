using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Entities;
using Backend.Services;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FamillesController : ControllerBase
    {
        private readonly IFamilleService _familleService;

        public FamillesController(IFamilleService familleService)
        {
            _familleService = familleService ?? throw new ArgumentNullException(nameof(familleService));
        }

        [HttpGet]
        [RoleOrAdmin("Familles.View")]
        public async Task<IActionResult> GetAllFamilles()
        {
            try
            {
                var familles = await _familleService.GetAllFamilles();
                return Ok(familles);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while fetching familles.");
            }
        }

        [HttpGet("{id}")]
        [RoleOrAdmin("Familles.View")]
        public async Task<IActionResult> GetFamilleById(Guid id)
        {
            try
            {
                var famille = await _familleService.GetFamilleById(id);
                if (famille == null)
                    return NotFound("Famille not found.");

                return Ok(famille);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while fetching the famille.");
            }
        }

        [HttpPost]
        [RoleOrAdmin("Familles.Create")]
        public async Task<IActionResult> CreateFamille([FromBody] Famille famille)
        {
            if (famille == null)
                return BadRequest("Famille cannot be null.");

            try
            {
                var createdFamille = await _familleService.CreateFamille(famille);
                return CreatedAtAction(nameof(GetFamilleById), new { id = createdFamille.Id }, createdFamille);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while creating the famille.");
            }
        }

        [HttpPut("{id}")]
        [RoleOrAdmin("Familles.Edit")]
        public async Task<IActionResult> UpdateFamille(Guid id, [FromBody] Famille famille)
        {
            if (famille == null)
                return BadRequest("Famille cannot be null.");

            try
            {
                var updatedFamille = await _familleService.UpdateFamille(id, famille);
                return Ok(updatedFamille);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while updating the famille.");
            }
        }

        [HttpDelete("{id}")]
        [RoleOrAdmin("Familles.Delete")]
        public async Task<IActionResult> DeleteFamille(Guid id)
        {
            try
            {
                await _familleService.DeleteFamille(id);
                return NoContent();
            }
            catch (ApplicationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while deleting the famille.");
            }
        }
    }
}