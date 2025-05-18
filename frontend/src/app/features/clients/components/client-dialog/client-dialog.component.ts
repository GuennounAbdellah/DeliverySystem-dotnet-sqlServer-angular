import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client, ClientCreateRequest } from '../../../../core/models/client.model';
import { ClientService } from '../../services/client.service';
import { TextFormatterDirective } from '../../../../shared/directives/text-formatter.directive';
@Component({
  selector: 'app-client-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, TextFormatterDirective],
  templateUrl: './client-dialog.component.html',
  styleUrls: ['./client-dialog.component.css']
})
export class ClientDialogComponent {
  @Output() clientAdded = new EventEmitter<Client>();
  @Output() clientUpdated = new EventEmitter<Client>();
  
  showDialog = false;
  editMode = false;
  
  client: Client | ClientCreateRequest = {
    nom: '',
    telephone: '',
    fax: '',
    adresse: ''
  };
  
  originalClientId: string | null = null;
  error: string | null = null;
  
  constructor(private clientService: ClientService) { }
  
  open(): void {
    this.showDialog = true;
    this.editMode = false;
    this.resetForm();
  }
  
  openEdit(client: Client): void {
    this.showDialog = true;
    this.editMode = true;
    this.originalClientId = client.id;
    this.client = { ...client };
    this.error = null;
  }
  
  close(): void {
    this.showDialog = false;
  }
  
  resetForm(): void {
    this.client = {
      nom: '',
      telephone: '',
      fax: '',
      adresse: ''
    };
    this.error = null;
    this.originalClientId = null;
  }

  submit(): void {
    if (!this.validateForm()) return;
    
    if (this.editMode && this.originalClientId) {
      const clientToUpdate = this.client as Client;
      this.clientService.updateClient(this.originalClientId, clientToUpdate).subscribe({
        next: (updatedClient) => {
          this.close();
          this.clientUpdated.emit(updatedClient);
        },
        error: (err) => {
          console.error('Failed to update client:', err);
          if (err.status === 400) {
            this.error = err.error?.message || 'Invalid client data';
          } else {
            this.error = 'Failed to update client';
          }
        }
      });
    } else {
      const clientToCreate = this.client as ClientCreateRequest;
      this.clientService.createClient(clientToCreate).subscribe({
        next: (newClient) => {
          this.close();
          this.clientAdded.emit(newClient);
        },
        error: (err) => {
          console.error('Failed to create client:', err);
          if (err.status === 400) {
            this.error = err.error?.message || 'Invalid client data';
          } else {
            this.error = 'Failed to create client';
          }
        }
      });
    }
  }
  
  validateForm(): boolean {
    if (!this.client.nom) {
      this.error = 'Client name is required';
      return false;
    }
    
    if (!this.client.telephone) {
      this.error = 'Phone number is required';
      return false;
    }
    
    return true;
  }
}
