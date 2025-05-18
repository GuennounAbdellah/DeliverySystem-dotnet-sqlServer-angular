import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Livraison,Compteure,LivraisonReq } from '../../../core/models/livraison.model';

@Injectable({
  providedIn: 'root'
})
export class LivraisonService {
  private apiUrl = 'http://localhost:5297/api/livraisons';

  constructor(private http: HttpClient) {}
  
  getLivraisons(): Observable<LivraisonReq[]> {
    return this.http.get<LivraisonReq[]>(this.apiUrl);
  }
  
  getLivraisonById(id: string): Observable<Livraison> {
    return this.http.get<Livraison>(`${this.apiUrl}/${id}`);
  }
  
  createLivraison(livraison: Livraison): Observable<Livraison> {
    return this.http.post<Livraison>(this.apiUrl, livraison);
  }
  
  deleteLivraison(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  updateLivraison(id: string, livraison: Livraison): Observable<Livraison> {
    return this.http.put<Livraison>(`${this.apiUrl}/${id}`, livraison);
  }
  getCompteureLivraison(): Observable<Compteure> {
    return this.http.get<Compteure>(`${this.apiUrl}/compteur`);
  } 
}