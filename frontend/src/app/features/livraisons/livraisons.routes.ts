import { Routes } from '@angular/router';

export const LIVRAISONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/livraison-list/livraison-list.component').then(m => m.LivraisonListComponent),
  }
];