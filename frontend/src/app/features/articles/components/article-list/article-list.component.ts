import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../../../shared/layout/layout.component';
import { ArticleDialogComponent } from '../article-dialog/article-dialog.component';
import { Article } from '../../../../core/models/article.model';
import { ArticleService } from '../../services/article.service';

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
  
  constructor(
    private articleService: ArticleService,
  ) { }
  
  ngOnInit(): void {
    this.loadArticles();
  }
  
  loadArticles(): void {
    this.loading = true;
    this.articleService.getArticles().subscribe({
      next: (articles) => {
        this.articles = articles;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load articles';
        this.loading = false;
        console.error(err);
      }
    });
  }

  openAddArticleDialog(): void {
    this.articleDialog.open();
  }
  
  deleteArticle(id: string): void {
    if (confirm('Are you sure you want to delete this article?')) {
      this.articleService.deleteArticle(id).subscribe({
        next: () => {
          this.articles = this.articles.filter(article => article.id !== id);
        },
        error: (err) => {
          console.error('Failed to delete article:', err);
          this.error = 'Failed to delete article. It may be referenced by deliveries.';
        }
      });
    }
  }
}