import { Routes } from '@angular/router';

export const ARTICLES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/article-list/article-list.component').then(m => m.ArticleListComponent),
  }
];