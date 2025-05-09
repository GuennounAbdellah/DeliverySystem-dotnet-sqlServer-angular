import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

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
    private router: Router
  ) {}
  
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