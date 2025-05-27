using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Entities;
using Backend.Models;

namespace Backend.Services
{
    public interface IAuditLogService
    {
        Task<List<AuditLog>> GetAllAuditLogs();
        Task CreateAuditLog(CreateAuditLogDto auditLog);
    }

    public class AuditLogService : IAuditLogService
    {
        private readonly AppDbContext _context;

        public AuditLogService(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<List<AuditLog>> GetAllAuditLogs()
        {
            return await _context.AuditLogs
                .Include(a => a.User)
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();
        }
 
        public async Task CreateAuditLog(CreateAuditLogDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            // Validate user exists
            var userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId);
            if (!userExists)
                throw new ArgumentException("User not found");

            // Validate required fields
            if (string.IsNullOrWhiteSpace(dto.Action))
                throw new ArgumentException("Action is required");
                
            if (string.IsNullOrWhiteSpace(dto.NumeroLivraison))
                throw new ArgumentException("NumeroLivraison is required");

            var newAuditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                NumeroLivraison = dto.NumeroLivraison.Trim(),
                Action = dto.Action.Trim(),
                UserId = dto.UserId,
                Timestamp = DateTime.UtcNow
            };

            _context.AuditLogs.Add(newAuditLog);
            await _context.SaveChangesAsync();
        }
    }
}