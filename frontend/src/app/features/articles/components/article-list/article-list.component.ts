import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../../../shared/layout/layout.component';
import { ArticleDialogComponent } from '../article-dialog/article-dialog.component';
import { Article } from '../../../../core/models/article.model';
import { ArticleService } from '../../services/article.service';
import { PermissionService } from '../../../../core/services/PermissionService';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent, ArticleDialogComponent],
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.css']
})
export class ArticleListComponent implements OnInit {
  @ViewChild(ArticleDialogComponent) articleDialog!: ArticleDialogComponent;
  
  articles: Article[] = [];
  loading = false;
  error: string | null = null;
  allowedCrudAccess : string[] = [];
  roles: string[] = [];
  
  constructor(
    private articleService: ArticleService,
    private permissionService: PermissionService,
  ) { }
  
  ngOnInit(): void { 
    this.loadArticles();
  }
    // Permission check methods
  canCreateArticles(): boolean {
    return this.permissionService.hasPermission('Articles.Create');
  }

  canEditArticles(): boolean {
    return this.permissionService.hasPermission('Articles.Edit');
  }

  canDeleteArticles(): boolean {
    return this.permissionService.hasPermission('Articles.Delete');
  }
  
  
  loadArticles(): void {
    this.loading = true;
    this.articleService.getArticles().subscribe({
      next: (articles) => {
        this.articles = articles.sort((a, b) => a.designation.localeCompare(b.designation));
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 403) {
          this.error = 'Accès refusé. Vous n\'avez pas les autorisations nécessaires.';
        } else {
          this.error = 'Échec du chargement des articles';
        }
        this.loading = false;
        console.error(err);
      }
    });
  }

  openAddArticleDialog(): void {
    this.articleDialog.open();
  }
  
  deleteArticle(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      this.articleService.deleteArticle(id).subscribe({
        next: () => {
          this.articles = this.articles.filter(article => article.id !== id);
        },
        error: (err) => {
          console.error('Échec de la suppression de l\'article :', err);
          this.error = 'Échec de la suppression de l\'article. Il peut être référencé par des livraisons.';
        }
      });
    }
  }
}