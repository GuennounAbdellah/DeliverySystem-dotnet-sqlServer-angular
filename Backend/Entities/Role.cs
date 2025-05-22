using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Entities{
    public class Role
    {  
        [Key]
        public Guid Id { get; set; }
        public required string Libelle { get; set; }
        [JsonIgnore]
        public virtual ICollection<RolesUser> RolesUsers { get; set; } = new List<RolesUser>();
    }
}