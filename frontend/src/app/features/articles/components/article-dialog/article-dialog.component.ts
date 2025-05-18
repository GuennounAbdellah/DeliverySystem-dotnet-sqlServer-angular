import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Article, ArticleCreateRequest } from '../../../../core/models/article.model';
import { ArticleService } from '../../services/article.service';
import { Unite } from '../../../../core/models/unite.model';
import { Famille } from '../../../../core/models/famille.model';
import {TextFormatterDirective} from '../../../../shared/directives/text-formatter.directive';

@Component({
  selector: 'app-article-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, TextFormatterDirective],
  templateUrl: './article-dialog.component.html',
  styleUrls: ['./article-dialog.component.css']
})
export class ArticleDialogComponent implements OnInit {
  @Output() articleAdded = new EventEmitter<Article>();
  @Output() articleUpdated = new EventEmitter<Article>();
  
  showDialog = false;
  editMode = false;
  
  article: Article | ArticleCreateRequest = {
    reference: '',
    designation: '',
    stock: 0,
    stock_Minimum: 0,
    uniteId: '',
    familleId: '',
    puHt: 0,
    montantHt: 0
  };
  
  unites: Unite[] = [];
  familles: Famille[] = [];
  
  originalArticleId: string | null = null;
  error: string | null = null;
  loadingLists = false;
  
  constructor(private articleService: ArticleService) { }
  
  ngOnInit(): void {
    this.loadUniteAndFamilleData();
  }
  
  loadUniteAndFamilleData(): void {
    this.loadingLists = true;
    
    // Load unites
    this.articleService.getUnites().subscribe({
      next: (unites) => {
        this.unites = unites;
        this.loadingLists = false;
      },
      error: (err) => {
        console.error('Failed to load unites:', err);
        this.error = 'Failed to load unites. Please try again.';
        this.loadingLists = false;
      }
    });
    
    // Load familles
    this.articleService.getFamilles().subscribe({
      next: (familles) => {
        this.familles = familles;
        this.loadingLists = false;
      },
      error: (err) => {
        console.error('Failed to load familles:', err);
        this.error = 'Failed to load familles. Please try again.';
        this.loadingLists = false;
      }
    });
  }
  
  open(): void {
    if (this.unites.length === 0 || this.familles.length === 0) {
      this.loadUniteAndFamilleData();
    }
    this.showDialog = true;
    this.editMode = false;
    this.resetForm();
  }
  
  openEdit(article: Article): void {
    if (this.unites.length === 0 || this.familles.length === 0) {
      this.loadUniteAndFamilleData();
    }
    this.showDialog = true;
    this.editMode = true;
    this.originalArticleId = article.id;
    
    this.article = {
      reference: article.reference,
      designation: article.designation,
      stock: article.stock,
      stock_Minimum: article.stock_Minimum,  
      uniteId: article.uniteId,
      familleId: article.familleId,
      puHt: article.puHt,
      montantHt: article.montantHt
    };
    
    this.error = null;
  }
  
  close(): void {
    this.showDialog = false;
  }
  
  resetForm(): void {
    this.article = {
      reference: '',
      designation: '',
      stock: 0,
      stock_Minimum: 0,
      uniteId: '',
      familleId: '',
      puHt: 0,
      montantHt: 0
    };
    this.error = null;
    this.originalArticleId = null;
  }

  submit(): void {
    if (!this.validateForm()) return;
    
    if (this.editMode && this.originalArticleId) {
      const articleToUpdate = this.article as ArticleCreateRequest;
      this.articleService.updateArticle(this.originalArticleId, articleToUpdate).subscribe({
        next: (updatedArticle) => {
          console.log(updatedArticle)
          this.close();
          this.articleUpdated.emit(updatedArticle);
        },
        error: (err) => {
          console.error('Failed to update article:', err);
          if (err.status === 400) {
            this.error = err.error?.message || 'Invalid article data';
          } else {
            this.error = 'Failed to update article';
          }
        }
      });
    } else {
      const articleToCreate = this.article as ArticleCreateRequest;
      this.articleService.createArticle(articleToCreate).subscribe({
        next: (newArticle) => {
          this.close();
          this.articleAdded.emit(newArticle);
        },
        error: (err) => {
          console.error('Failed to create article:', err);
          if (err.status === 400) {
            this.error = err.error?.message || 'Invalid article data';
          } else {
            this.error = 'Failed to create article';
          }
        }
      });
    }
  }
  
  validateForm(): boolean {
    if (!this.article.reference) {
      this.error = 'Article reference is required';
      return false;
    }
    
    if (!this.article.designation) {
      this.error = 'Article designation is required';
      return false;
    }
    
    if (!this.article.uniteId) {
      this.error = 'Please select a unite';
      return false;
    }
    
    if (!this.article.familleId) {
      this.error = 'Please select a famille';
      return false;
    }
    
    if (this.article.puHt < 0) {
      this.error = 'Price cannot be negative';
      return false;
    }
    
    if (this.article.montantHt < 0) {
      this.error = 'Amount cannot be negative';
      return false;
    }
    
    return true;
  }
}