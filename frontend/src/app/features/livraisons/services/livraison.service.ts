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
  
  updateLivraison(id: string, livraison: LivraisonReq): Observable<Livraison> {
    // Add clear logging to see what's being sent
    console.log('Updating livraison with ID:', id);
    console.log('Data being sent:', JSON.stringify(livraison));
    
    // Make sure we're passing the data correctly
    return this.http.put<Livraison>(`${this.apiUrl}/${id}`, livraison);
  }
  getCompteureLivraison(): Observable<Compteure> {
    return this.http.get<Compteure>(`${this.apiUrl}/compteur`);
  }
  incrementCompteur(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/compteur`, {});
  }
}