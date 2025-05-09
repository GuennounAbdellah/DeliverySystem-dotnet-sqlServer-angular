using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Entities;
using Backend.Services;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UnitesController : ControllerBase
    {
        private readonly IUniteService _uniteService;

        public UnitesController(IUniteService uniteService)
        {
            _uniteService = uniteService ?? throw new ArgumentNullException(nameof(uniteService));
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUnites()
        {
            try
            {
                var unites = await _uniteService.GetAllUnites();
                return Ok(unites);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while fetching unites.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUniteById(Guid id)
        {
            try
            {
                var unite = await _uniteService.GetUniteById(id);
                if (unite == null)
                    return NotFound("Unite not found.");

                return Ok(unite);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while fetching the unite.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateUnite([FromBody] Unite unite)
        {
            if (unite == null)
                return BadRequest("Unite cannot be null.");

            try
            {
                var createdUnite = await _uniteService.CreateUnite(unite);
                return CreatedAtAction(nameof(GetUniteById), new { id = createdUnite.Id }, createdUnite);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while creating the unite.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUnite(Guid id, [FromBody] Unite unite)
        {
            if (unite == null)
                return BadRequest("Unite cannot be null.");

            try
            {
                var updatedUnite = await _uniteService.UpdateUnite(id, unite);
                return Ok(updatedUnite);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while updating the unite.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUnite(Guid id)
        {
            try
            {
                await _uniteService.DeleteUnite(id);
                return NoContent();
            }
            catch (ApplicationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while deleting the unite.");
            }
        }
    }
}