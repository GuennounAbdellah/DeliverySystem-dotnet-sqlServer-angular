using System.ComponentModel.DataAnnotations;

namespace Backend.Entities
{
    public class Compteur
    {
        [Key]
        public Guid Id { get; set; }
        public required string Libelle { get; set; }
        public int Nombre { get; set; }
    }
}