import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../../../shared/layout/layout.component';
import { FamilleDialogComponent } from '../famille-dialog/famille-dialog.component';
import { Famille } from '../../../../core/models/famille.model';
import { FamilleService } from '../../services/famille.service';

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
  ) { }
  
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
        this.error = 'Failed to load familles';
        this.loading = false;
        console.error(err);
      }
    });
  }

  openAddFamilleDialog(): void {
    this.familleDialog.open();
  }
  
  deleteFamille(id: string): void {
    if (confirm('Are you sure you want to delete this famille?')) {
      this.familleService.deleteFamille(id).subscribe({
        next: () => {
          this.familles = this.familles.filter(famille => famille.id !== id);
        },
        error: (err) => {
          console.error('Failed to delete famille:', err);
          this.error = 'Failed to delete famille. It may be referenced by articles.';
        }
      });
    }
  }
}