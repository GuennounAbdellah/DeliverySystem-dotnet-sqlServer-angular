import { Article } from "./article.model";

export interface DetailLivraison {
  numero ?: number;
  articleId: string;
  article ?: Article;
  designation: string;
  quantite: number;
  puHt: number;
  puHtRemise: number;
  remiseHt: number;
  puTtc: number;
  puTtcRemise: number;
  remiseTtc: number;
  montantHt: number;
  montantTtc: number;
  rowVersion?: string; // Added rowVersion for concurrency control
  rowVersionString?: string;  // Add this field
}
export interface DetailLivraisonReq {
  articleId: string;
  designation: string;
  quantite: number;
  puHt: number;
  puHtRemise: number;
  remiseHt: number;
  puTtc: number;
  puTtcRemise: number;
  remiseTtc: number;
  montantHt: number;
  montantTtc: number;
  rowVersion?: string; // Added rowVersion for concurrency control
  rowVersionString?: string;  // Add this field
}

/*
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

        [Timestamp]
        public byte[] RowVersion { get; set; }
    }
*/