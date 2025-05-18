import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../../../shared/layout/layout.component';
import { LivraisonDialogComponent } from '../livraison-dialog/livraison-dialog.component';
import { Livraison } from '../../../../core/models/livraison.model';
import { LivraisonService } from '../../services/livraison.service';

@Component({
  selector: 'app-livraison-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent, LivraisonDialogComponent],
  templateUrl: './livraison-list.component.html',
  styleUrls: ['./livraison-list.component.css']
})
export class LivraisonListComponent implements OnInit {
  @ViewChild(LivraisonDialogComponent) livraisonDialog!: LivraisonDialogComponent;
  
  livraisons: Livraison[] = [];
  loading = false;
  error: string | null = null;
  
  constructor(
    private livraisonService: LivraisonService,
  ) { }
  
  ngOnInit(): void {
    this.loadLivraisons();
  }
  
  loadLivraisons(): void {
    this.loading = true;
    this.livraisonService.getLivraisons().subscribe({
      next: (livraisons) => {
        this.livraisons = livraisons;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load livraisons';
        this.loading = false;
        console.error(err);
      }
    });
  }

  openAddLivraisonDialog(): void {
    this.livraisonDialog.open();
  }
  
  deleteLivraison(id: string): void {
    if (confirm('Are you sure you want to delete this livraison?')) {
      this.livraisonService.deleteLivraison(id).subscribe({
        next: () => {
          this.livraisons = this.livraisons.filter(livraison => livraison.id !== id);
        },
        error: (err) => {
          console.error('Failed to delete livraison:', err);
          this.error = 'Failed to delete livraison.';
        }
      });
    }
  }
}