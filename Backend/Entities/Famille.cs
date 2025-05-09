using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Entities
    {
    public class Famille
    {
        [Key]
        public Guid Id { get; set; }
        public required string Nom { get; set; }
        public int Tva { get; set; }

        [JsonIgnore]
        public virtual ICollection<Article> Articles { get; set; } = new List<Article>();
    }
}