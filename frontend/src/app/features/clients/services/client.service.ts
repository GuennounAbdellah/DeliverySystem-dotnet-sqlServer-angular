import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Client, ClientCreateRequest } from '../../../core/models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:5297/api/clients';

  constructor(private http: HttpClient) {}
  
  getClients(): Observable<Client[]> {

    return this.http.get<Client[]>(this.apiUrl);
  }
  
  createClient(client: ClientCreateRequest): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }
  
  deleteClient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getClientById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }
  
  updateClient(id: string, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client);
  }
}