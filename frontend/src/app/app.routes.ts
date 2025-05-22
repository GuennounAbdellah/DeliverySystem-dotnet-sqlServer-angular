import { Routes } from '@angular/router';
import {HomeComponent} from './features/home/home.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) 
    },
    
    {
        path: 'clients',
        loadChildren: () => import('./features/clients/clients.routes').then(m => m.CLIENTS_ROUTES)
    },
    {
        path: 'familles',
        loadChildren: () => import('./features/familles/familles.routes').then(m => m.FAMILLES_ROUTES)
    }, 
    {
        path: 'unites',
        loadChildren: () => import('./features/unites/unites.routes').then(m => m.UNITES_ROUTES)
    },
    {
        path: 'articles',
        loadChildren: () => import('./features/articles/articles.routes').then(m => m.ARTICLES_ROUTES)
    },
    {
         path: 'livraisons',
         loadChildren: () => import('./features/livraisons/livraisons.routes').then(m => m.LIVRAISONS_ROUTES)
    },
    {
        path: 'users',
        loadComponent: () => import('./features/users/components/user-list/user-list.component')
          .then(m => m.UserListComponent)
      },
    {
        path: '**', 
        redirectTo: '' 
    }
];
