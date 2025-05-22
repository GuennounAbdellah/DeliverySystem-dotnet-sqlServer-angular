using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Backend.Entities
{
    public class RolesUser
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey(nameof(Role))]
        public Guid RoleId { get; set; }
        public  virtual Role? Role { get; set; }

        [ForeignKey(nameof(User))]
        public Guid UserId { get; set; }

        [JsonIgnore]
        public virtual User? User { get; set; }

        public bool Valeur { get; set; }
    }

}