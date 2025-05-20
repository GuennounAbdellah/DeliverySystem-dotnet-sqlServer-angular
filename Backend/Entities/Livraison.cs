using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Entities
{
public class Livraison
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey(nameof(Client))]
        public Guid ClientId { get; set; }
        public virtual required Client Client { get; set; }

        [ForeignKey(nameof(User))]
        public Guid UserId { get; set; }
        public virtual required User User { get; set; }

        public DateTime Date { get; set; }
        public required string Info { get; set; }
        public required string Numero { get; set; }
        public decimal TotalHt { get; set; }
        public decimal TotalTva { get; set; }
        public decimal Escompte { get; set; }
        public decimal TotalTtc { get; set; }
        public required string Editeur { get; set; }
        
        [Timestamp]
        public byte[] RowVersion { get; set; }

        public virtual ICollection<DetailLivraison> DetailLivraisons { get; set; } = new List<DetailLivraison>();
    }
}