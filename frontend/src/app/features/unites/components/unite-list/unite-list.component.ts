import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../../../shared/layout/layout.component';
import { UniteDialogComponent } from '../unite-dialog/unite-dialog.component';
import { Unite } from '../../../../core/models/unite.model';
import { UniteService } from '../../services/unite.service';

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
  ) { }
  
  ngOnInit(): void {
    this.loadUnites();
  }
  
  loadUnites(): void {
    this.loading = true;
    this.uniteService.getUnites().subscribe({
      next: (unites) => {
        this.unites = unites;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load unites';
        this.loading = false;
        console.error(err);
      }
    });
  }

  openAddUniteDialog(): void {
    this.uniteDialog.open();
  }
  
  deleteUnite(id: string): void {
    if (confirm('Are you sure you want to delete this unite?')) {
      this.uniteService.deleteUnite(id).subscribe({
        next: () => {
          this.unites = this.unites.filter(unite => unite.id !== id);
        },
        error: (err) => {
          console.error('Failed to delete unite:', err);
          this.error = 'Failed to delete unite. It may be referenced by articles.';
        }
      });
    }
  }
}