using System.ComponentModel.DataAnnotations;

namespace WebApi.Entities{
    public class Role
    {  
        [Key]
        public Guid Id { get; set; }
        public required string Libelle { get; set; }

        public virtual ICollection<RolesUser> RolesUsers { get; set; } = new List<RolesUser>();
    }
}