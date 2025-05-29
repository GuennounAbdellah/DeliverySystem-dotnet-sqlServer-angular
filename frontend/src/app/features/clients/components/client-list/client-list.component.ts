import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../../../shared/layout/layout.component';
import { ClientDialogComponent } from '../client-dialog/client-dialog.component';
import { Client } from '../../../../core/models/client.model';
import { ClientService } from '../../services/client.service';
import { PermissionService } from '../../../../core/services/PermissionService';
@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent, ClientDialogComponent],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {
  @ViewChild(ClientDialogComponent) clientDialog!: ClientDialogComponent;
  
  clients: Client[] = [];
  loading = false;
  error: string | null = null;
  
  constructor(
    private clientService: ClientService,
    private permissionService: PermissionService,
  ) { }
  
  ngOnInit(): void {
    this.loadClients();
  }
  
  // Permission check methods
  canCreateClients(): boolean {
    return this.permissionService.hasPermission('Clients.Create');
  }
  canEditClients(): boolean {
    return this.permissionService.hasPermission('Clients.Edit');
  }
  canDeleteClients(): boolean {
    return this.permissionService.hasPermission('Clients.Delete');
  }
  loadClients(): void {
    this.loading = true;
    this.clientService.getClients().subscribe({
      next: (clients) => {

        this.clients = clients.sort((a, b) => a.nom.localeCompare(b.nom));
        this.loading = false;

      },
      error: (err) => {
        this.error = 'Échec du chargement des clients';
        this.loading = false;
        console.error(err);
      }
    });
  }

  openAddClientDialog(): void {
      this.clientDialog.open();
    
  }
  
  deleteClient(id: string): void {
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => {
          this.clients = this.clients.filter(client => client.id !== id);
        },
        error: (err) => {
          console.error('Failed to delete client:', err);
          this.error = 'Échec de la suppression du client. Il peut être référencé par des livraisons.';
        }
      });
    }
  }
}