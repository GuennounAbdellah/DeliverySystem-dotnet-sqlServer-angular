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
        console.error('Échec du chargement des unités :', err);
        this.error = 'Échec du chargement des unités. Veuillez réessayer.';
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
        console.error('Échec du chargement des familles :', err);
        this.error = 'Échec du chargement des familles. Veuillez réessayer.';
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
  
  openEdit(a: Article): void {
    if (this.unites.length === 0 || this.familles.length === 0) {
      this.loadUniteAndFamilleData();
    }
    this.showDialog = true;
    this.editMode = true;
    this.originalArticleId = a.id;
    
    this.article = {
      reference: a.reference,
      designation: a.designation,
      stock: a.stock,
      stock_Minimum: a.stock_Minimum,  
      uniteId: a.uniteId,
      familleId: a.familleId,
      puHt: a.puHt,
      montantHt: a.montantHt
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
      console.log('Article to update:', articleToUpdate);
      this.articleService.updateArticle(this.originalArticleId, articleToUpdate).subscribe({
        next: (updatedArticle) => {
          console.log(updatedArticle)
          this.close();
          this.articleUpdated.emit(updatedArticle);
        },
        error: (err) => {
          console.error('Échec de la mise à jour de l\'article :', err);
          if (err.status === 400) {
            this.error = err.error?.message || 'Données de l\'article invalides';
          } else {
            this.error = 'Échec de la mise à jour de l\'article';
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
          console.error('Échec de la création de l\'article :', err);
          if (err.status === 400) {
            this.error = err.error?.message || 'Données de l\'article invalides';
          } else {
            this.error = 'Échec de la création de l\'article';
          }
        }
      });
    }
  }
  
  validateForm(): boolean {
    if (!this.article.reference) {
      this.error = 'Référence de l\'article est requise';
      return false;
    }
    
    if (!this.article.designation) {
      this.error = 'La désignation de l\'article est requise';
      return false;
    }
    
    if (!this.article.uniteId) {
      this.error = 'Veuillez sélectionner une unité';
      return false;
    }
    
    if (!this.article.familleId) {
      this.error = 'Veuillez sélectionner une famille';
      return false;
    }
    
    if (this.article.puHt < 0) {
      this.error = 'Le prix ne peut pas être négatif';
      return false;
    }
    
    if (this.article.montantHt < 0) {
      this.error = 'Le montant ne peut pas être négatif';
      return false;
    }
    
    return true;
  }
}