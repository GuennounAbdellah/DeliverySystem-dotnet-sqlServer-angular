import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'clients',
        loadChildren: () => import('./features/clients/clients.routes').then(m => m.CLIENTS_ROUTES),
        canActivate: [authGuard]
    },
    {
        path: 'familles',
        loadChildren: () => import('./features/familles/familles.routes').then(m => m.FAMILLES_ROUTES),
        canActivate: [authGuard]
    }, 
    {
        path: 'unites',
        loadChildren: () => import('./features/unites/unites.routes').then(m => m.UNITES_ROUTES),
        canActivate: [authGuard]
    },
    {
        path: 'articles',
        loadChildren: () => import('./features/articles/articles.routes').then(m => m.ARTICLES_ROUTES),
        canActivate: [authGuard]
    },
    {
        path: 'livraisons',
        loadChildren: () => import('./features/livraisons/livraisons.routes').then(m => m.LIVRAISONS_ROUTES),
        canActivate: [authGuard]
    },
    {
        path: 'users',
        loadComponent: () => import('./features/users/components/user-list/user-list.component')
          .then(m => m.UserListComponent),
        canActivate: [authGuard]
    },
    {
        path: '**', 
        redirectTo: '' 
    }
];
