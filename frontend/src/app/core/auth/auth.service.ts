import { Inject , Injectable , PLATFORM_ID } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";
import { BehaviorSubject, Observable, tap } from "rxjs";

export interface AuthRequest {
    username: string;
    password: string;
  }
  
  export interface AuthResponse {
    id: string;
    username: string;
    token: string;
  }

@Injectable({
  providedIn: "root",
})
export class AuthService {
    private apiUrl = "http://localhost:5297/api/";
    private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();
    private isBrowser: boolean;
    
    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) platformId: Object
      ) {
        this.isBrowser = isPlatformBrowser(platformId);
        
        // Only access localStorage in browser context
        if (this.isBrowser) {
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            this.currentUserSubject.next(JSON.parse(storedUser));
          }
        }
      }
    login(authRequest: AuthRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}users/authenticate`, authRequest)
        .pipe(
          tap((response) => {
            this.currentUserSubject.next(response);
            if (this.isBrowser) {
              localStorage.setItem('currentUser', JSON.stringify(response));
            }
            this.currentUserSubject.next(response);
          })
        );  
    }
    logout(): void {
        if (this.isBrowser) {
          localStorage.removeItem('currentUser');
        }
        this.currentUserSubject.next(null);
      }
    isLoggedIn(): boolean {
        if (this.isBrowser) {
          return !!localStorage.getItem('currentUser');
        }
        return false;
      }

    getCurrentUser(): AuthResponse | null {
        return this.currentUserSubject.value;
    }
    getToken(): string | null {
        const currentUser = this.getCurrentUser();
        return currentUser ? currentUser.token : null;
      }
}