export interface Famille {
  id: string;
  nom: string;
  tva: number;
}

export interface FamilleCreateRequest {
  nom: string;
  tva: number;
}