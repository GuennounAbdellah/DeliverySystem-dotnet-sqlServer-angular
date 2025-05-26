import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../../../shared/layout/layout.component';
import { FamilleDialogComponent } from '../famille-dialog/famille-dialog.component';
import { Famille } from '../../../../core/models/famille.model';
import { FamilleService } from '../../services/famille.service';
import { PermissionService } from '../../../../core/services/PermissionService';

@Component({
  selector: 'app-famille-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent, FamilleDialogComponent],
  templateUrl: './famille-list.component.html',
  styleUrls: ['./famille-list.component.css']
})
export class FamilleListComponent implements OnInit {
  @ViewChild(FamilleDialogComponent) familleDialog!: FamilleDialogComponent;
  
  familles: Famille[] = [];
  loading = false;
  error: string | null = null;
  
  constructor(
    private familleService: FamilleService,
    private permissionService: PermissionService,
  ) { }
  
  // Permission check methods
  canCreateFamilles(): boolean {
    return this.permissionService.hasPermission('Familles.Create');
  }
  canEditFamilles(): boolean {
    return this.permissionService.hasPermission('Familles.Edit');
  }
  canDeleteFamilles(): boolean {
    return this.permissionService.hasPermission('Familles.Delete');
  }

  ngOnInit(): void {
    this.loadFamilles();
  }
  
  loadFamilles(): void {
    this.loading = true;
    this.familleService.getFamilles().subscribe({
      next: (familles) => {
        this.familles = familles;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Échec du chargement des familles';
        this.loading = false;
        console.error(err);
      }
    });
  }

  openAddFamilleDialog(): void {
    this.familleDialog.open();
  }
  
  deleteFamille(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette famille ?')) {
      this.familleService.deleteFamille(id).subscribe({
        next: () => {
          this.familles = this.familles.filter(famille => famille.id !== id);
        },
        error: (err) => {
          console.error('Échec de la suppression de la famille:', err);
          this.error = 'Échec de la suppression de la famille. Elle peut être référencée par des articles.';
        }
      });
    }
  }
}