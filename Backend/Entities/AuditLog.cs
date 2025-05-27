using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Entities
{
    public class AuditLog
        {
            [Key]
            public Guid Id { get; set; }

            [ForeignKey(nameof(User))]
            public Guid UserId { get; set; }
            public virtual User? User { get; set; }
 
            public string NumeroLivraison { get; set; } = "";
            public string Action { get; set; } = "";
            public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        }
}