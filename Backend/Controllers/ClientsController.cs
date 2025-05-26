using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Entities;
using Backend.Services;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientsController : ControllerBase
    {
        private readonly IClientService _clientService;

        public ClientsController(IClientService clientService)
        {
            _clientService = clientService ?? throw new ArgumentNullException(nameof(clientService));
        }

        [HttpGet]
        [RoleOrAdmin("Clients.View")]
        public async Task<IActionResult> GetAllClients()
        {
            try
            {
                var clients = await _clientService.GetAllClients();
                return Ok(clients);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while fetching clients.");
            }
        }

        [HttpGet("{id}")]
        [RoleOrAdmin("Clients.View")]
        public async Task<IActionResult> GetClientById(Guid id)
        {
            try
            {
                var client = await _clientService.GetClientById(id);
                if (client == null)
                    return NotFound("Client not found.");

                return Ok(client);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while fetching the client.");
            }
        }

        [HttpPost]
        [RoleOrAdmin("Clients.Create")]
        public async Task<IActionResult> CreateClient([FromBody] Client client)
        {
            if (client == null)
                return BadRequest("Client cannot be null.");

            try
            {
                var createdClient = await _clientService.CreateClient(client);
                return CreatedAtAction(nameof(GetClientById), new { id = createdClient.Id }, createdClient);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while creating the client.");
            }
        }

        [HttpPut("{id}")]
        [RoleOrAdmin("Clients.Edit")]
        public async Task<IActionResult> UpdateClient(Guid id, [FromBody] Client client)
        {
            if (client == null)
                return BadRequest("Client cannot be null.");

            try
            {
                var updatedClient = await _clientService.UpdateClient(id, client);
                return Ok(updatedClient);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while updating the client.");
            }
        }

        [HttpDelete("{id}")]
        [RoleOrAdmin("Clients.Delete")]
        public async Task<IActionResult> DeleteClient(Guid id)
        {
            try
            {
                await _clientService.DeleteClient(id);
                return NoContent();
            }
            catch (ApplicationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while deleting the client.");
            }
        }
    }
}