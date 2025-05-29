using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Entities;
using Backend.Models;

namespace Backend.Services
{
    public interface IAuditLogService
    {
        Task<List<object>> GetAllAuditLogs(int page = 1, int pageSize = 10);
        Task CreateAuditLog(CreateAuditLogDto auditLog);
    }

    public class AuditLogService : IAuditLogService
    {
        private readonly AppDbContext _context;
        private readonly IUserService _userService; // Change this from UserService to IUserService

        public AuditLogService(AppDbContext context, IUserService userService) // Change parameter type
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
        }

        public async Task<List<object>> GetAllAuditLogs(int page = 1, int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;

            return await _context.AuditLogs
                .Include(a => a.User)
                .OrderByDescending(a => a.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => (object)new
                {
                    Id = a.Id,
                    Action = a.Action,
                    NumeroLivraison = a.NumeroLivraison,
                    Username = a.User != null ? a.User.Username : "Utilisateur inconnu",
                    UserId = a.UserId,
                    Timestamp = a.Timestamp,
                    Date = a.Timestamp
                })
                .ToListAsync();
        }

        public async Task CreateAuditLog(CreateAuditLogDto dto)
        {
            // Verify that the user exists
            var user = await _userService.GetUserById(dto.UserId);
            if (user == null)
                throw new ArgumentException($"User with ID {dto.UserId} not found");

            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = dto.UserId,
                Action = dto.Action,
                NumeroLivraison = dto.NumeroLivraison,
                Timestamp = DateTime.UtcNow,
                User = user
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }
    }
}