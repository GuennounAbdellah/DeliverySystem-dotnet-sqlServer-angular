import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';

import { Livraison } from '../../../../core/models/livraison.model';
import { DetailLivraison } from '../../../../core/models/detail-livraison.model';
import { Client } from '../../../../core/models/client.model';
import { Article } from '../../../../core/models/article.model';

import { LivraisonService } from '../../services/livraison.service';
import { ClientService } from '../../../clients/services/client.service';
import { ArticleService } from '../../../articles/services/article.service';
import { AuthService, AuthResponse } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-livraison-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatRadioModule],
  templateUrl: './livraison-dialog.component.html',
  styleUrls: ['./livraison-dialog.component.css']
})
export class LivraisonDialogComponent implements OnInit {
  @Output() livraisonAdded = new EventEmitter<Livraison>();
  @Output() livraisonUpdated = new EventEmitter<Livraison>();
  
  showDialog = false;
  editMode = false;
  isHT = true;
  detailCounter = 0;
  
  livraison: Livraison = this.getEmptyLivraison();
  details: DetailLivraison[] = [];
  
  clients: Client[] = [];
  articles: Article[] = [];
  selectedArticleId: string = '';
  
  originalLivraisonId: string | null = null;
  error: string | null = null;
  authResponse: AuthResponse | null = null;
  
  constructor(
    private livraisonService: LivraisonService,
    private clientService: ClientService,
    private articleService: ArticleService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.authResponse = this.authService.getCurrentUser();
  }
  
  open(): void {
    this.showDialog = true;
    this.editMode = false;
    this.resetForm();
    this.loadData();
    this.generateLivraisonNumber();
    this.setCurrentUserInfo();
  }
  
  openEdit(livraison: Livraison): void {
    this.showDialog = true;
    this.editMode = true;
    this.originalLivraisonId = livraison.id ?? null;
    this.livraison = { ...livraison };
    this.details = [...(livraison.detailLivraisons || [])];
    this.error = null;
    this.loadData();
  }
  
  close(): void {
    this.showDialog = false;
  }
  
  private getEmptyLivraison(): Livraison {
    return {
      clientId: '',
      userId: '',
      date: new Date(),
      info: '',
      numero: '',
      totalHt: 0,
      totalTva: 0,
      escompte: 0,
      totalTtc: 0,
      editeur: '',
      detailLivraisons: [],
      id: '',
      client: undefined,
      user: undefined
    };
  }
  
  private resetForm(): void {
    this.livraison = this.getEmptyLivraison();
    this.details = [];
    this.error = null;
    this.originalLivraisonId = null;
    this.detailCounter = 0;
  }
  
  private loadData(): void {
    this.loadClients();
    this.loadArticles();
  }
  
  private setCurrentUserInfo(): void {
    if (this.authResponse) {
      this.livraison.userId = this.authResponse.id;
      this.livraison.editeur = this.authResponse.username;
    }
  }
  
  private generateLivraisonNumber(): void {
    this.livraisonService.getCompteureLivraison().subscribe({
      next: (compteur) => {
        const nombre = (compteur.nombre + 1).toString().padStart(3, '0');
        const now = new Date();
        const yy = now.getFullYear().toString().slice(-2);
        const mm = (now.getMonth() + 1).toString().padStart(2, '0');
        const d = yy + mm;
        this.livraison.numero = `BL${d}-${nombre}`;
      },
      error: (err) => {
        console.error('Failed to load Compteure:', err);
        this.error = 'Failed to load delivery counter';
      }
    });
  }
  
  private loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (clients) => this.clients = clients,
      error: (err) => {
        console.error('Failed to load clients:', err);
        this.error = 'Failed to load clients';
      }
    });
  }
  
  private loadArticles(): void {
    this.articleService.getArticles().subscribe({
      next: (articles) => this.articles = articles,
      error: (err) => {
        console.error('Failed to load articles:', err);
        this.error = 'Failed to load articles';
      }
    });
  }
  
  addDetailLivraison(): void {
    this.error = null;

    if (!this.selectedArticleId) {
      this.error = 'Please select an article';
      return;
    }
    
    const selectedArticle = this.articles.find(a => a.id === this.selectedArticleId);
    if (!selectedArticle) {
      this.error = 'Selected article not found';
      return;
    }
    
    this.detailCounter++;
    const newDetail: DetailLivraison = {
      numero: this.detailCounter,
      articleId: selectedArticle.id,
      article: selectedArticle,
      designation: selectedArticle.designation,
      quantite: 1,
      puHt: selectedArticle.puHt,
      puHtRemise: selectedArticle.puHt,
      remiseHt: 0,
      puTtc: selectedArticle.puHt,
      puTtcRemise: selectedArticle.puHt,
      remiseTtc: 0,
      montantHt: selectedArticle.puHt,
      montantTtc: selectedArticle.puHt,
    };
    
    this.details.push(newDetail);
    this.selectedArticleId = '';
    this.calculateTotals();
  }
  
  removeDetailLivraison(index: number): void {
    if (index >= 0 && index < this.details.length) {
      this.details.splice(index, 1);
      this.calculateTotals();
    }
  }
  
  calculateTotals(): void {
    // Implement total calculation logic
    let totalHt = 0;
    let totalTtc = 0;
    
    for (const detail of this.details) {
      totalHt += detail.montantHt;
      totalTtc += detail.montantTtc;
    }
    
    // Apply discount if needed
    const discountFactor = 1 - (this.livraison.escompte / 100);
    
    this.livraison.totalHt = totalHt;
    this.livraison.totalTtc = totalTtc;
    this.livraison.totalTva = totalTtc - totalHt;
    
    // Apply discount if present
    if (this.livraison.escompte > 0) {
      this.livraison.totalHt *= discountFactor;
      this.livraison.totalTtc *= discountFactor;
      this.livraison.totalTva *= discountFactor;
    }
  }
  
  submit(): void {
    if (!this.validateForm()) return;
    
    // Prepare data for submission
    const livraisonToSubmit = this.prepareLivraisonForSubmission();
    
    if (this.editMode && this.originalLivraisonId) {
      this.updateLivraison(this.originalLivraisonId, livraisonToSubmit);
    } else {
      this.createLivraison(livraisonToSubmit);
    }
  }
  
  private prepareLivraisonForSubmission(): Livraison {
    const livraisonCopy = { ...this.livraison };
    
    // Clean up references that shouldn't be sent to the API
    delete livraisonCopy.client;
    delete livraisonCopy.user;
    
    // Prepare details
    livraisonCopy.detailLivraisons = this.details.map(detail => {
      const detailCopy = { ...detail };
      delete detailCopy.article;
      delete detailCopy.numero;
      return detailCopy;
    });
    
    return livraisonCopy;
  }
  
  private createLivraison(livraison: Livraison): void {
    this.livraisonService.createLivraison(livraison).subscribe({
      next: (newLivraison) => {
        this.close();
        this.livraisonAdded.emit(newLivraison);
      },
      error: (err) => this.handleSubmissionError(err)
    });
  }
  
  private updateLivraison(id: string, livraison: Livraison): void {
    this.livraisonService.updateLivraison(id, livraison).subscribe({
      next: (updatedLivraison) => {
        this.close();
        this.livraisonUpdated.emit(updatedLivraison);
      },
      error: (err) => this.handleSubmissionError(err)
    });
  }
  
  private handleSubmissionError(err: any): void {
    console.error('Failed to submit livraison:', err);
    if (err.status === 400) {
      this.error = err.error?.message || 'Invalid delivery data';
    } else {
      this.error = 'Failed to process delivery';
    }
  }
  
  validateForm(): boolean {
    if (!this.livraison.clientId) {
      this.error = 'Client is required';
      return false;
    }
    
    if (!this.livraison.numero) {
      this.error = 'Number is required';
      return false;
    }
    
    if (this.details.length === 0) {
      this.error = 'At least one detail is required';
      return false;
    }
    
    this.error = null;
    return true;
  }
}