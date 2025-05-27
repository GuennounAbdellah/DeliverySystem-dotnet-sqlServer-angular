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
        public async Task<IActionResult> GetAllAuditLogs()
        {
            Console.WriteLine("Fetching all audit logs...");
            try
            {
                var logs = await _auditLogService.GetAllAuditLogs();
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