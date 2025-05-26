import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, Role, UserCreateRequest, UserUpdateRequest, RoleGroup } from '../../../../core/models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.css']
})
//I still have to manage update problems (the problem may be in server side)
export class UserDialogComponent implements OnInit {
  @Output() userCreated = new EventEmitter<User>();
  @Output() userUpdated = new EventEmitter<User>();
  @Output() close = new EventEmitter<void>();

  showDialog = false;
  isEditMode = false;
  error: string | null = null;

  roles: Role[] = [];
  roleGroups: RoleGroup[] = [];
  user: User | null = null;

  newUser: UserCreateRequest = {
    username: '',
    passwordHash: '',
    isAdmin: false,
    rolesId: []
  };
  
  updateUser: UserUpdateRequest = {};
  selectedRoles: string[] = [];
  showPassword = false;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadRoles();
  }

  open(): void {
    this.showDialog = true;
    this.isEditMode = false;
    this.resetForm();
    this.error = null;
    this.user = null;
    
    this.loadRoles();
  }

  openEdit(u: User): void {
    this.showDialog = true;
    this.isEditMode = true;
    this.error = null;
    this.user = { ...u };
    
    
    // Set up update user object
    this.updateUser = {
      username: u.username,
      isAdmin: u.isAdmin,
      rolesId : []
    };
    if(this.user.rolesUsers)
      this.user.rolesUsers.forEach(element => {
        this.updateUser.rolesId?.push(element.roleId)
      });
    
    this.loadRoles();
  }

  closeDialog(): void {
    this.showDialog = false;
    this.error = null;
  }

  private resetForm(): void {
    this.newUser = {
      username: '',
      passwordHash: '',
      isAdmin: false,
      rolesId: []
    };
    this.updateUser = {};
    this.selectedRoles = [];
  }

  getUsernameValue(): string {
    return this.isEditMode ? (this.updateUser.username || '') : this.newUser.username;
  }

  setUsernameValue(value: string): void {
    if (this.isEditMode) {
      this.updateUser.username = value;
    } else {
      this.newUser.username = value;
    }
  }

  getPasswordValue(): string {
    return this.isEditMode ? (this.updateUser.passwordHash || '') : this.newUser.passwordHash;
  }

  setPasswordValue(value: string): void {
    if (this.isEditMode) {
      this.updateUser.passwordHash = value;
    } else {
      this.newUser.passwordHash = value;
    }
  }

  getIsAdminValue(): boolean {
    return this.isEditMode ? (this.updateUser.isAdmin === undefined ? false : this.updateUser.isAdmin) : this.newUser.isAdmin;
  }

  setIsAdminValue(value: boolean): void {
    if (this.isEditMode) {
      this.updateUser.isAdmin = value;
    } else {
      this.newUser.isAdmin = value;
    }
    
    // When admin is selected, automatically select all roles
    if (value) {
      this.selectedRoles = this.roles.map(role => role.id);
    }
    
    // Update the user model
    if (this.isEditMode) {
      this.updateUser.rolesId = [...this.selectedRoles];
    } else {
      this.newUser.rolesId = [...this.selectedRoles];
    }
  }

  loadRoles(): void {
    this.userService.getAllRoles().subscribe({
      next: (data) => {
        this.roles = data;
        
        // Group roles by entity type
        this.groupRolesByEntity();
        
        if (this.isEditMode && this.user && this.user.rolesUsers) {
          // In edit mode, keep the user's existing role selection
          this.selectedRoles = this.user.rolesUsers
            .filter(ru => ru.valeur)
            .map(ru => ru.roleId);
        } else {
          // In create mode, select ALL roles by default
          this.selectedRoles = this.roles.map(role => role.id);
        }
        
        // Update the user model with selected roles
        if (this.isEditMode) {
          this.updateUser.rolesId = [...this.selectedRoles];
        } else {
          this.newUser.rolesId = [...this.selectedRoles];
        }
      },
      error: (error) => {
        console.error('Error fetching roles', error);
        this.error = 'Échec du chargement des rôles. Veuillez réessayer.';
      }
    });
  }

  groupRolesByEntity(): void {
    // Create a map to group roles by their entity
    const entityMap = new Map<string, Role[]>();
    
    this.roles.forEach(role => {
      const [entity] = role.libelle.split('.');
      if (!entityMap.has(entity)) {
        entityMap.set(entity, []);
      }
      entityMap.get(entity)!.push(role);
    });
    
    // Convert map to array for template iteration
    this.roleGroups = Array.from(entityMap.entries())
      .map(([entity, roles]) => ({ 
        groupName: entity, 
        // Sort roles so that View comes first, followed by other actions
        roles: roles.sort((a, b) => {
          if (a.libelle.includes('.View') && !b.libelle.includes('.View')) return -1;
          if (!a.libelle.includes('.View') && b.libelle.includes('.View')) return 1;
          return a.libelle.localeCompare(b.libelle);
        })
      }))
      .sort((a, b) => a.groupName.localeCompare(b.groupName));
  }

  toggleRole(roleId: string, roleLibelle: string): void {
    // If user is admin, don't allow toggling roles
    if (this.getIsAdminValue()) {
      return;
    }
    
    const index = this.selectedRoles.indexOf(roleId);
    
    if (index > -1) {
      // Remove the role
      this.selectedRoles.splice(index, 1);
      
      // If this was a "View" permission, cascade and deselect all related entity permissions
      if (roleLibelle.includes('.View')) {
        const entity = roleLibelle.split('.')[0];
        // Find and deselect all roles for this entity
        this.roles.forEach(role => {
          if (role.libelle.startsWith(entity + '.') && role.id !== roleId) {
            const relatedIndex = this.selectedRoles.indexOf(role.id);
            if (relatedIndex > -1) {
              this.selectedRoles.splice(relatedIndex, 1);
            }
          }
        });
      }
    } else {
      // Add the role
      this.selectedRoles.push(roleId);
      
      // If adding a non-View permission, ensure View is also selected
      if (!roleLibelle.includes('.View')) {
        const entity = roleLibelle.split('.')[0];
        const viewRole = this.roles.find(r => r.libelle === `${entity}.View`);
        if (viewRole && !this.selectedRoles.includes(viewRole.id)) {
          this.selectedRoles.push(viewRole.id);
        }
      }
    }
    
    // Update the user model
    if (this.isEditMode) {
      this.updateUser.rolesId = [...this.selectedRoles];
    } else {
      this.newUser.rolesId = [...this.selectedRoles];
    }
  }

  isRoleSelected(roleId: string): boolean {
    return this.selectedRoles.includes(roleId);
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.error = null;
    console.log(this.updateUser)
    console.log(this.user?.id)
    
    if (this.isEditMode && this.user) {
      this.userService.updateUser(this.user.id, this.updateUser).subscribe({
        next: (updatedUser) => {
          this.userUpdated.emit(updatedUser);
          this.closeDialog();
        },
        error: (error) => {
          console.error('Error updating user', error);
          this.handleSubmissionError(error);
        }
      });
    } else {
      this.userService.createUser(this.newUser).subscribe({
        next: (createdUser) => {
          this.userCreated.emit(createdUser);
          this.closeDialog();
        },
        error: (error) => {
          console.error('Error creating user', error);
          this.handleSubmissionError(error);
        }
      });
    }
  }

  private handleSubmissionError(err: any): void {
    console.error('Failed to submit user:', err);

    if (err.status === 400) {
      if (err.error?.message) {
        this.error = err.error.message;
      } else if (err.error) {
        this.error = typeof err.error === 'string'
          ? err.error
          : 'Données utilisateur invalides. Consultez la console pour plus de détails.';
      } else {
        this.error = 'Données utilisateur invalides';
      }
    } else if (err.status === 500) {
      this.error = 'Erreur serveur. Veuillez contacter l\'administrateur.';
    } else if (err.status === 404) {
      this.error = 'Utilisateur non trouvé';
    } else if (err.status === 0) {
      this.error = 'Erreur réseau - le serveur est peut-être hors ligne';
    } else {
      this.error = `Échec du traitement de l'utilisateur (${err.status})`;
    }
  }
}