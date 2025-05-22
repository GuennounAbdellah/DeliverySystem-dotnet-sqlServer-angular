export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  rolesUsers?: RoleUser[];
}

export interface RoleUser {
  id: string;
  roleId: string;
  role?: Role;
  userId: string;
  user?: User;
  valeur: boolean;
}

export interface Role {
  id: string;
  libelle: string;
}

export interface UserCreateRequest {
  username: string;
  passwordHash: string;
  isAdmin: boolean;
  rolesId ?: string[];
}

export interface UserUpdateRequest {
  username?: string;
  passwordHash?: string;
  isAdmin?: boolean;
  rolesId?: string[];
}

export interface RoleGroup {
  groupName: string;
  roles: Role[];
}