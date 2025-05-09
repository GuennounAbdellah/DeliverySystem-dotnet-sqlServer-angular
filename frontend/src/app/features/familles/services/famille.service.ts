import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Famille, FamilleCreateRequest } from '../../../core/models/famille.model';

@Injectable({
  providedIn: 'root'
})
export class FamilleService {
  private apiUrl = 'http://localhost:5297/api/familles';

  constructor(private http: HttpClient) {}
  
  getFamilles(): Observable<Famille[]> {
    return this.http.get<Famille[]>(this.apiUrl);
  }
  
  createFamille(famille: FamilleCreateRequest): Observable<Famille> {
    return this.http.post<Famille>(this.apiUrl, famille);
  }
  
  deleteFamille(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  updateFamille(id: string, famille: Famille): Observable<Famille> {
    return this.http.put<Famille>(`${this.apiUrl}/${id}`, famille);
  }
}