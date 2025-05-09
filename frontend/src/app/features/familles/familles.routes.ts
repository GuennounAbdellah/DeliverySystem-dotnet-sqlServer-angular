import { Routes } from '@angular/router';

export const FAMILLES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/famille-list/famille-list.component').then(m => m.FamilleListComponent),
  }
];