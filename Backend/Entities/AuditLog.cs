using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Backend.Entities
{
    public class AuditLog
        {
            [Key]
            public Guid Id { get; set; }

            [ForeignKey(nameof(User))]
            public Guid UserId { get; set; }

            [JsonIgnore]
            public virtual User? User { get; set; }
 
            public string NumeroLivraison { get; set; } = "";
            public string Action { get; set; } = "";
            public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        }
}