import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Unite, UniteCreateRequest } from '../../../../core/models/unite.model';
import { UniteService } from '../../services/unite.service';
import { TextFormatterDirective } from '../../../../shared/directives/text-formatter.directive';
@Component({
  selector: 'app-unite-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule , TextFormatterDirective],
  templateUrl: './unite-dialog.component.html',
  styleUrls: ['./unite-dialog.component.css']
})
export class UniteDialogComponent {
  @Output() uniteAdded = new EventEmitter<Unite>();
  @Output() uniteUpdated = new EventEmitter<Unite>();
  
  showDialog = false;
  editMode = false;
  
  unite: Unite | UniteCreateRequest = {
    nom: '',
    abreviation: ''
  };
  
  originalUniteId: string | null = null;
  error: string | null = null;
  
  constructor(private uniteService: UniteService) { }
  
  open(): void {
    this.showDialog = true;
    this.editMode = false;
    this.resetForm();
  }
  
  openEdit(unite: Unite): void {
    this.showDialog = true;
    this.editMode = true;
    this.originalUniteId = unite.id;
    this.unite = { ...unite };
    this.error = null;
  }
  
  close(): void {
    this.showDialog = false;
  }
  
  resetForm(): void {
    this.unite = {
      nom: '',
      abreviation: ''
    };
    this.error = null;
    this.originalUniteId = null;
  }

  submit(): void {
    if (!this.validateForm()) return;
    
    if (this.editMode && this.originalUniteId) {
      const uniteToUpdate = this.unite as Unite;
      this.uniteService.updateUnite(this.originalUniteId, uniteToUpdate).subscribe({
        next: (updatedUnite) => {
          this.close();
          this.uniteUpdated.emit(updatedUnite);
        },
        error: (err) => {
          console.error('Echec à mettre à jour l\'unité:', err);
          if (err.status === 400) {
            this.error = err.error?.message || 'Invalid unite data';
          } else {
            this.error = 'Echec à mettre à jour l\'unité';
          }
        }
      });
    } else {
      const uniteToCreate = this.unite as UniteCreateRequest;
      this.uniteService.createUnite(uniteToCreate).subscribe({
        next: (newUnite) => {
          this.close();
          this.uniteAdded.emit(newUnite);
        },
        error: (err) => {
          console.error('Failed to create unite:', err);
          if (err.status === 400) {
            this.error = err.error?.message || 'donnees d\'unité invalides';
          } else {
            this.error = 'Echec à créer l\'unité';
          }
        }
      });
    }
  }
  
  validateForm(): boolean {
    if (!this.unite.nom) {
      this.error = 'Unite name is required';
      return false;
    }
    
    if (!this.unite.abreviation) {
      this.error = 'Unite abreviation is required';
      return false;
    }
    
    return true;
  }
}