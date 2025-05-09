import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../../../shared/layout/layout.component';
import { ClientDialogComponent } from '../client-dialog/client-dialog.component';
import { Client } from '../../../../core/models/client.model';
import { ClientService } from '../../services/client.service';

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
  ) { }
  
  ngOnInit(): void {
    this.loadClients();
  }
  
  loadClients(): void {
    this.loading = true;
    this.clientService.getClients().subscribe({
      next: (clients) => {

        this.clients = clients;
        this.loading = false;

      },
      error: (err) => {
        this.error = 'Failed to load clients';
        this.loading = false;
        console.error(err);
      }
    });
  }

  openAddClientDialog(): void {
      this.clientDialog.open();
    
  }
  
  deleteClient(id: string): void {
    
    if (confirm('Are you sure you want to delete this client?')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => {
          this.clients = this.clients.filter(client => client.id !== id);
        },
        error: (err) => {
          console.error('Failed to delete client:', err);
          this.error = 'Failed to delete client. It may be referenced by deliveries.';
        }
      });
    }
  }
}