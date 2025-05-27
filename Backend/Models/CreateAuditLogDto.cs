using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class CreateAuditLogDto
    {
        public required Guid UserId { get; set; }
        
        public required string NumeroLivraison { get; set; } = "";

        public required string Action { get; set; } = "";
    }
}