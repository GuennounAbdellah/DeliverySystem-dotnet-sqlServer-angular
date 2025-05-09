export interface Article {
    stock_Minimum: number;
    id: string;
    reference: string;
    designation: string;
    stock: number;
    uniteId: string;
    unite: Unite;
    familleId: string;
    famille: Famille;
    puHt: number;
    montantHt: number;
}
export interface ArticleCreateRequest {
    reference: string;
    designation: string;
    stock: number;
    stock_Minimum: number;
    uniteId: string;
    familleId: string;
    puHt: number;
    montantHt: number;
}
export interface Unite {
abreviation: string;
    id: string;
    nom: string;
} 
export interface Famille {
    id: string;
    pourcentage: number;
    nom: string;
}


// using System.Text.Json.Serialization;

// namespace WebApi.Entities
// {
//     public class Article
//     {
//         public Guid Id { get; set; }
//         public string Reference { get; set; } = "";
//         public string Designation { get; set; } = "";
//         public int Stock { get; set; }
//         public Guid UniteId { get; set; } 
//         public required Unite  Unite { get; set; } 
//         public Guid FamilleId { get; set; }
//         public required Famille Famille { get; set; }
//         public decimal PuHt { get; set; }
//         public decimal MontantHt { get; set; }

//         [JsonIgnore]
//         public List<DetailLivraison> DetailsLivraison { get; set; } = new List<DetailLivraison>();
//     }
// }