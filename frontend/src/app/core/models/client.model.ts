export interface Client {
  id: string;
  nom: string;
  telephone: string;
  fax: string;
  adresse: string;
}

export interface ClientCreateRequest {
  nom: string;
  telephone: string;
  fax: string;
  adresse: string;
}