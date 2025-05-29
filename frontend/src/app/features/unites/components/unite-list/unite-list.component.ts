import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../../../shared/layout/layout.component';
import { UniteDialogComponent } from '../unite-dialog/unite-dialog.component';
import { Unite } from '../../../../core/models/unite.model';
import { UniteService } from '../../services/unite.service';
import { PermissionService } from '../../../../core/services/PermissionService';

@Component({
  selector: 'app-unite-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent, UniteDialogComponent],
  templateUrl: './unite-list.component.html',
  styleUrls: ['./unite-list.component.css']
})
export class UniteListComponent implements OnInit {
  @ViewChild(UniteDialogComponent) uniteDialog!: UniteDialogComponent;
  
  unites: Unite[] = [];
  loading = false;
  error: string | null = null;
  
  constructor(
    private uniteService: UniteService,
    private permissionService: PermissionService,
  ) { }
  
  // Permission check methods
  canCreateUnites(): boolean {
    return this.permissionService.hasPermission('Unites.Create');
  }
  canEditUnites(): boolean {
    return this.permissionService.hasPermission('Unites.Edit');
  }
  canDeleteUnites(): boolean {
    return this.permissionService.hasPermission('Unites.Delete');
  }
  ngOnInit(): void {
    this.loadUnites();
  }
  
  loadUnites(): void {
    this.loading = true;
    this.uniteService.getUnites().subscribe({
      next: (unites) => {
        this.unites = unites.sort((a, b) => a.nom.localeCompare(b.nom));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Echec à charger les unites';
        this.loading = false;
        console.error(err);
      }
    });
  }

  openAddUniteDialog(): void {
    this.uniteDialog.open();
  }
  
  deleteUnite(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette unité ?')) {
      this.uniteService.deleteUnite(id).subscribe({
        next: () => {
          this.unites = this.unites.filter(unite => unite.id !== id);
        },
        error: (err) => {
          console.error('Failed to delete unite:', err);
          this.error = 'Echec à supprimer l\'unité. Elle peut être référencée par des articles.';
        }
      });
    }
  }
}