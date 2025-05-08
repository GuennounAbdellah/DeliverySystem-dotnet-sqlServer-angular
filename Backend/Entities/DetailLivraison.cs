using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Entities
{ public class DetailLivraison
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey(nameof(Livraison))]
        public Guid LivraisonId { get; set; }
        public virtual required Livraison Livraison { get; set; }

        [ForeignKey(nameof(Article))]
        public Guid ArticleId { get; set; }
        public virtual required Article Article { get; set; }

        public string Designation { get; set; }="";
        public int Quantite { get; set; }
        public decimal PuHt { get; set; }
        public decimal PuHtRemise { get; set; }
        public decimal RemiseHt { get; set; }
        public decimal PuTtc { get; set; }
        public decimal PuTtcRemise { get; set; }
        public decimal RemiseTtc { get; set; }
        public decimal MontantHt { get; set; }
        public decimal MontantTtc { get; set; }
    }
}