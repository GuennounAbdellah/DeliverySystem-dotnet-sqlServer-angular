import { Routes } from '@angular/router';

export const UNITES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/unite-list/unite-list.component').then(m => m.UniteListComponent),
  }
];