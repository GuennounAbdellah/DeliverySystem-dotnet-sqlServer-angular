import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  
  constructor(private authService: AuthService) {}

  /**
   * Check if current user has a specific permission
   */
  hasPermission(permission: string): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      return false;
    }

    // Admin users have all permissions
    if (currentUser.isAdmin) {
      return true;
    }

    // Check if user has the specific role
    return currentUser.roles?.includes(permission) || false;
  }

}