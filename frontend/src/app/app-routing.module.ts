// Update the existing routes to include user management
const routes: Routes = [
  // ... existing routes
  {
    path: 'users',
    loadComponent: () => import('./features/users/components/user-list/user-list.component')
      .then(m => m.UserListComponent)
  },
  // ... other routes
];