using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class LivraisonCreateRequest
    {
        public Guid ClientId { get; set; }
        public Guid UserId { get; set; }
        public DateTime Date { get; set; }
        public string Info { get; set; } = "";
        public required string Numero { get; set; } 
        public decimal TotalHt { get; set; }
        public decimal TotalTva { get; set; }
        public decimal Escompte { get; set; }
        public decimal TotalTtc { get; set; }
        public string Editeur { get; set; } = "";
        
        // RowVersion as byte array for EF concurrency check
        [Timestamp]
        public byte[] RowVersion { get; set; }
        
        // String representation of RowVersion for frontend
        [JsonIgnore]
        public string RowVersionString 
        { 
            get => RowVersion != null ? Convert.ToBase64String(RowVersion) : null;
            set
            {
                if (!string.IsNullOrEmpty(value))
                {
                    RowVersion = Convert.FromBase64String(value);
                }
            }
        }
        
        public List<DetailLivraisonCreateRequest> DetailLivraisons { get; set; } = new List<DetailLivraisonCreateRequest>();
    }
    
    public class DetailLivraisonCreateRequest
    {
        public Guid ArticleId { get; set; }
        public string Designation { get; set; } = "";
        public int Quantite { get; set; }
        public decimal PuHt { get; set; }
        public decimal PuHtRemise { get; set; }
        public decimal RemiseHt { get; set; }
        public decimal PuTtc { get; set; }
        public decimal PuTtcRemise { get; set; }
        public decimal RemiseTtc { get; set; }
        public decimal MontantHt { get; set; }
        public decimal MontantTtc { get; set; }

        // RowVersion as byte array for EF concurrency check
        [Timestamp]
        public byte[] RowVersion { get; set; }
        
        // String representation of RowVersion for frontend
        [JsonIgnore]
        public string RowVersionString 
        { 
            get => RowVersion != null ? Convert.ToBase64String(RowVersion) : null;
            set
            {
                if (!string.IsNullOrEmpty(value))
                {
                    RowVersion = Convert.FromBase64String(value);
                }
            }
        }
    }
}