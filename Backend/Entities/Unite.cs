using System.ComponentModel.DataAnnotations;

namespace Backend.Entities
{
    public class Unite
    {
        [Key]
        public Guid Id { get; set; }
        public required string Nom { get; set; }
        public required string Abreviation { get; set; }

        public virtual ICollection<Article> Articles { get; set; } = new List<Article>();
    }
    
} 