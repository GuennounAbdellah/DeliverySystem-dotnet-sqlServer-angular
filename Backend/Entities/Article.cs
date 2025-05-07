using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebApi.Entities
{
public class Article
    {
        [Key]
        public Guid Id { get; set; }
        public required string Reference { get; set; }
        public required string Designation { get; set; }
        public int Stock { get; set; }
        public int Stock_Minimum { get; set; }

        [ForeignKey(nameof(Unite))]
        public Guid UniteId { get; set; }
        public virtual required Unite Unite { get; set; }

        [ForeignKey(nameof(Famille))]
        public Guid FamilleId { get; set; }
        public virtual required Famille Famille { get; set; }

        public decimal PuHt { get; set; }
        public decimal MontantHt { get; set; }

        public virtual ICollection<DetailLivraison> DetailLivraisons { get; set; } = new List<DetailLivraison>();
    }

}