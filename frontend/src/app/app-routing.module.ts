import { Routes } from '@angular/router';

// Update the existing routes to include the dashboard and user management
const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/components/user-list/user-list.component')
      .then(m => m.UserListComponent)
  },
  // ... other routes
];

export const appRoutes: Routes = routes;