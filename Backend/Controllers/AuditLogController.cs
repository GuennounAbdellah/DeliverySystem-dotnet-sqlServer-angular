using Microsoft.AspNetCore.Mvc;
using Backend.Entities;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Backend.Models;

namespace Backend.Controllers
{ 
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Add authorization
    public class AuditLogController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;
        
        public AuditLogController(IAuditLogService auditLogService)
        {
            _auditLogService = auditLogService ?? throw new ArgumentNullException(nameof(auditLogService));
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAuditLogs(int page = 1, int pageSize = 10)
        {
            // Add input validation
            if (page <= 0 || pageSize <= 0)
                return BadRequest("Page and page size must be greater than zero.");

            // Log the request
            Console.WriteLine($"Fetching audit logs for page {page} with page size {pageSize}");

            try
            {
                var logs = await _auditLogService.GetAllAuditLogs(page, pageSize);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching audit logs: {ex.Message}");
                return StatusCode(500, "An error occurred while fetching audit logs.");
            }
        }


        [HttpPost] 
        public async Task<IActionResult> CreateAuditLog([FromBody] CreateAuditLogDto auditLog)
        {
            // Add input validation
            if (auditLog == null)
                return BadRequest("Audit log data is required");
            
            if (auditLog.UserId == Guid.Empty)
                return BadRequest("Valid UserId is required");
            
            if (string.IsNullOrWhiteSpace(auditLog.Action))
                return BadRequest("Action is required");
                
            if (string.IsNullOrWhiteSpace(auditLog.NumeroLivraison))
                return BadRequest("NumeroLivraison is required");

            try
            {
                await _auditLogService.CreateAuditLog(auditLog);
                return StatusCode(201, "Audit log created successfully.");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating audit log: {ex.Message}");
                return StatusCode(500, "An error occurred while creating the audit log.");
            }
        }
    }
}