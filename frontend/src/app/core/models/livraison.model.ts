import { Client } from './client.model';
import { DetailLivraison } from './detail-livraison.model';
import { User } from './user.model';

export interface Livraison {
  id ?: string;
  clientId: string;
  client ?: Client;
  userId: string;
  user ?: User;
  date: Date;
  info: string;
  numero: string;
  totalHt: number;
  totalTva: number;
  escompte: number;
  totalTtc: number;
  editeur: string;
  detailLivraisons: DetailLivraison[];
}

export interface LivraisonReq {
  clientId: string;
  userId: string;
  date: Date;
  info: string;
  numero: string;
  totalHt: number;
  totalTva: number;
  escompte: number;
  totalTtc: number;
  editeur: string;
  detailLivraisons: DetailLivraison[];

}

export interface Compteure {
  id: string;
  libelle: string;
  nombre: number;
}
/*
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
        
        public List<DetailLivraisonCreateRequest> DetailLivraisons { get; set; } = new List<DetailLivraisonCreateRequest>();
    }
*/