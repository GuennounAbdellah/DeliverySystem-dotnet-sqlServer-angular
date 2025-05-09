import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Unite, UniteCreateRequest } from '../../../core/models/unite.model';

@Injectable({
  providedIn: 'root'
})
export class UniteService {
  private apiUrl = 'http://localhost:5297/api/unites';

  constructor(private http: HttpClient) {}
  
  getUnites(): Observable<Unite[]> {
    return this.http.get<Unite[]>(this.apiUrl);
  }
  
  createUnite(unite: UniteCreateRequest): Observable<Unite> {
    return this.http.post<Unite>(this.apiUrl, unite);
  }
  
  deleteUnite(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  updateUnite(id: string, unite: Unite): Observable<Unite> {
    return this.http.put<Unite>(`${this.apiUrl}/${id}`, unite);
  }
}