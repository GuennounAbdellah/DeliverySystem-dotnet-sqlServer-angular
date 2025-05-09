import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Article, ArticleCreateRequest } from '../../../core/models/article.model';
import { Unite } from '../../../core/models/unite.model';
import { Famille } from '../../../core/models/famille.model';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = 'http://localhost:5297/api/articles';
  private uniteApiUrl = 'http://localhost:5297/api/unites';
  private familleApiUrl = 'http://localhost:5297/api/familles';

  constructor(private http: HttpClient) {}
  
  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(this.apiUrl);
  }
  
  getUnites(): Observable<Unite[]> {
    return this.http.get<Unite[]>(this.uniteApiUrl);
  }
  
  getFamilles(): Observable<Famille[]> {
    return this.http.get<Famille[]>(this.familleApiUrl);
  }
  
  createArticle(article: ArticleCreateRequest): Observable<Article> {
    return this.http.post<Article>(this.apiUrl, article);
  }
  
  deleteArticle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  updateArticle(id: string, article: ArticleCreateRequest): Observable<Article> {
    return this.http.put<Article>(`${this.apiUrl}/${id}`, article);
  }
}