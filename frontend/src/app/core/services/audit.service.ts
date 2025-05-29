import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = 'http://localhost:5297/api/auditlog';

  constructor(private http: HttpClient) {}

  postAudit(userId: string, action: string, numeroLivraison: string): Observable<any> {
    const auditData = { userId, action, numeroLivraison };
    console.log('Posting audit data:', JSON.stringify(auditData));
    return this.http.post<any>(this.apiUrl, auditData);
  }

  getAuditLogs(page: number = 1, pageSize: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?page=${page}&pageSize=${pageSize}`);
  }
}