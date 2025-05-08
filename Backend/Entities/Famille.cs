using System.ComponentModel.DataAnnotations;

namespace Backend.Entities
    {
    public class Famille
    {
        [Key]
        public Guid Id { get; set; }
        public required string Nom { get; set; }
        public int Tva { get; set; }

        public virtual ICollection<Article> Articles { get; set; } = new List<Article>();
    }
}