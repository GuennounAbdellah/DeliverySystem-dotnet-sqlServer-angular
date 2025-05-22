import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../../../core/models/user.model';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
import { LayoutComponent } from "../../../../shared/layout/layout.component";

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, UserDialogComponent, LayoutComponent],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  @ViewChild(UserDialogComponent) userDialog!: UserDialogComponent;

  users: User[] = [];
  loading = false;
  error: string | null = null;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching users', error);
        this.error = 'Failed to load users';
        this.loading = false;
      }
    });
  }

  openCreateDialog(): void {
    this.userDialog.open();
  }

  openEditDialog(user: User): void {
    this.userDialog.openEdit(user);
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user', error);
          this.error = 'Failed to delete user';
        }
      });
    }
  }
}