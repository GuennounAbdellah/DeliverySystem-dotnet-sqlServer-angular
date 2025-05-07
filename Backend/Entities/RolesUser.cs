using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApi.Entities
{
    public class RolesUser
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey(nameof(Role))]
        public Guid RoleId { get; set; }
        public required virtual Role Role { get; set; }

        [ForeignKey(nameof(User))]
        public Guid UserId { get; set; }
        public required virtual User User { get; set; }

        public bool Valeur { get; set; }
    }

}