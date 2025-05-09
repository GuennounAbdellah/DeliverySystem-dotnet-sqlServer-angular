import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Famille, FamilleCreateRequest } from '../../../../core/models/famille.model';
import { FamilleService } from '../../services/famille.service';

@Component({
  selector: 'app-famille-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './famille-dialog.component.html',
  styleUrls: ['./famille-dialog.component.css']
})
export class FamilleDialogComponent {
  @Output() familleAdded = new EventEmitter<Famille>();
  @Output() familleUpdated = new EventEmitter<Famille>();
  
  showDialog = false;
  editMode = false;
  
  famille: Famille | FamilleCreateRequest = {
    nom: '',
    tva: 0
  };
  
  originalFamilleId: string | null = null;
  error: string | null = null;
  
  constructor(private familleService: FamilleService) { }
  
  open(): void {
    this.showDialog = true;
    this.editMode = false;
    this.resetForm();
  }
  
  openEdit(famille: Famille): void {
    this.showDialog = true;
    this.editMode = true;
    this.originalFamilleId = famille.id;
    this.famille = { ...famille };
    this.error = null;
  }
  
  close(): void {
    this.showDialog = false;
  }
  
  resetForm(): void {
    this.famille = {
      nom: '',
      tva: 0
    };
    this.error = null;
    this.originalFamilleId = null;
  }

  submit(): void {
    if (!this.validateForm()) return;
    
    if (this.editMode && this.originalFamilleId) {
      const familleToUpdate = this.famille as Famille;
      this.familleService.updateFamille(this.originalFamilleId, familleToUpdate).subscribe({
        next: (updatedFamille) => {
          this.close();
          this.familleUpdated.emit(updatedFamille);
        },
        error: (err) => {
          console.error('Failed to update famille:', err);
          if (err.status === 400) {
            this.error = err.error?.message || 'Invalid famille data';
          } else {
            this.error = 'Failed to update famille';
          }
        }
      });
    } else {
      const familleToCreate = this.famille as FamilleCreateRequest;
      this.familleService.createFamille(familleToCreate).subscribe({
        next: (newFamille) => {
          this.close();
          this.familleAdded.emit(newFamille);
        },
        error: (err) => {
          console.error('Failed to create famille:', err);
          if (err.status === 400) {
            this.error = err.error?.message || 'Invalid famille data';
          } else {
            this.error = 'Failed to create famille';
          }
        }
      });
    }
  }
  
  validateForm(): boolean {
    if (!this.famille.nom) {
      this.error = 'Famille name is required';
      return false;
    }
    
    if (this.famille.tva < 0) {
      this.error = 'TVA cannot be negative';
      return false;
    }
    
    return true;
  }
}