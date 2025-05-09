using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Entities
{
       public class User
    {
        [Key]
        public Guid Id { get; set; }
        public required string Username { get; set; }
        [JsonIgnore]
        public  string PasswordHash { get; set; } = "";
        public bool IsAdmin { get; set; }

        public virtual ICollection<RolesUser> RolesUsers { get; set; } = new List<RolesUser>();
        public virtual ICollection<Livraison> Livraisons { get; set; } = new List<Livraison>();
        public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    }
}