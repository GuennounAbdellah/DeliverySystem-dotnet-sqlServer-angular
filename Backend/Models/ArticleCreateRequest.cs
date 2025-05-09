namespace Backend.Models
{
    public class ArticleCreateRequest
    {
        public string Reference { get; set; } = "";
        public string Designation { get; set; } = "";
        public int Stock { get; set; }
        public int Stock_Minimum { get; set; }
        public Guid UniteId { get; set; }
        public Guid FamilleId { get; set; }
        public decimal PuHt { get; set; }
        public decimal MontantHt { get; set; }
    }
}