import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { PermissionService } from '../../core/services/PermissionService';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  isAdmin: boolean = false;
  showLogoutConfirmation: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private permissionService: PermissionService
  ) {}
  
  canViewArticles(): boolean {
    return this.permissionService.hasPermission('Articles.View');
  }
  canViewClients(): boolean {
    return this.permissionService.hasPermission('Clients.View');
  }
  canViewFamilles(): boolean {
    return this.permissionService.hasPermission('Familles.View');
  }
  canViewLivraisons(): boolean {
    return this.permissionService.hasPermission('Livraisons.View');
  }
  canViewUnites(): boolean {
    return this.permissionService.hasPermission('Unites.View');
  }
  canViewUsers(): boolean {
    return this.permissionService.hasPermission('Users.View');
  }

  
  logout(): void {
    this.showLogoutConfirmation = true;
  }

  confirmLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.showLogoutConfirmation = false;
  }

  cancelLogout(): void {
    this.showLogoutConfirmation = false;
  }
}