import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';

import { Livraison, LivraisonReq } from '../../../../core/models/livraison.model';
import { DetailLivraison, DetailLivraisonReq } from '../../../../core/models/detail-livraison.model';
import { Client } from '../../../../core/models/client.model';
import { Article } from '../../../../core/models/article.model';

import { LivraisonService } from '../../services/livraison.service';
import { ClientService } from '../../../clients/services/client.service';
import { ArticleService } from '../../../articles/services/article.service';
import { AuthService, AuthResponse } from '../../../../core/auth/auth.service';
import { forkJoin, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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
    this.setCurrentUserInfo();

    this.error = null;
    this.loadData().subscribe({
      next: () => {
       
        this.generateLivraisonNumber();
      },
      error: (err) => {
        console.error('Failed to load data for new livraison:', err);
        this.error = 'Failed to load necessary data (clients/articles). Please try again.';
      }
    });
  }
  
  openEdit(livraison: Livraison): void {
    this.originalLivraisonId = livraison.id ?? null;
    
    // Create a deep copy of the livraison to avoid reference issues
    this.livraison = { 
      ...livraison,
      // Ensure date is properly formatted as a Date object
      date: livraison.date instanceof Date ? livraison.date : new Date(livraison.date)
    };
    
    console.log('Original rowVersion:', livraison.rowVersion);
    console.log('Original rowVersionString:', livraison.rowVersionString);
    
    this.showDialog = true;
    this.editMode = true;
    this.error = null;
    this.detailCounter = 0;
    
    this.loadData().subscribe({
      next: () => {
        // Map detail data properly preserving rowVersion fields
        this.details = (livraison.detailLivraisons || []).map(detail => ({
          ...detail,
          numero: ++this.detailCounter,
          article: this.articles.find(a => a.id === detail.articleId) ?? undefined,
          // Make sure rowVersion fields are preserved
          rowVersion: detail.rowVersion || '',
          rowVersionString: detail.rowVersionString || ''
        }));
        
        console.log('Editing livraison details:', this.details);
      },
      error: (err) => {
        console.error('Failed to load data for editing livraison:', err);
        this.error = 'Failed to load necessary data for editing. Please try again.';
      }
    });
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
      user: undefined,
      rowVersion: '',          // Initialize with empty string 
      rowVersionString: ''     // Initialize with empty string
    };
  }
  
  private resetForm(): void {
    this.livraison = this.getEmptyLivraison();
    this.details = [];
    this.error = null;
    this.originalLivraisonId = null;
    this.detailCounter = 0;
  }
  
  private loadData(): Observable<[Client[], Article[]]> {
    this.error = null; 
    return forkJoin([
      this.clientService.getClients().pipe(
        tap(clients => this.clients = clients)
      ),
      this.articleService.getArticles().pipe(
        tap(articles => this.articles = articles)
      )
    ]);
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
      remiseHt: 0,
      puHtRemise: 0,
      puTtc: 0,
      remiseTtc: 0,
      puTtcRemise: 0,
      montantHt: 0,
      montantTtc: 0,
      rowVersion: '',          // Initialize with empty string
      rowVersionString: ''     // Initialize with empty string
    };
    
    this.details.push(newDetail);
    this.selectedArticleId = '';
    this.updateCalculations();
  }
  
  removeDetailLivraison(index: number): void {
    if (index >= 0 && index < this.details.length) {
      this.details.splice(index, 1);
      this.updateCalculations();
      
    }
  }
  updateCalculations(): void {
    let totalHt = 0;
    let totalTva = 0;
    let totalTtc = 0;
    
    for (const detail of this.details) {
      // Get TVA rate (as a decimal)
      const tvaRate = (detail.article?.famille?.tva ?? 0) / 100;
      
      // Calculate prices with discounts
      // First apply HT discount to the base HT price
      const puHtAfterHtDiscount = detail.puHt * (1 - (detail.remiseHt / 100));
      
      // Then calculate the TTC price after HT discount
      const puTtcAfterHtDiscount = puHtAfterHtDiscount * (1 + tvaRate);
      
      // Apply TTC discount to get final TTC price with all discounts
      detail.puTtcRemise = puTtcAfterHtDiscount * (1 - (detail.remiseTtc / 100));
      
      // Calculate final HT price with all discounts
      detail.puHtRemise = detail.puTtcRemise / (1 + tvaRate);
      
      // For reference, store the original prices (rounded to 2 decimals)
      detail.puTtc = +(puTtcAfterHtDiscount).toFixed(2); // so we take the HT and apply discount and tva to get TTC
      detail.puHt = +(detail.puHt).toFixed(2);
      
      // Calculate total amounts
      detail.montantTtc = detail.puTtcRemise * detail.quantite;
      detail.montantHt = detail.puHtRemise * detail.quantite;
      let montantTva = detail.montantTtc - detail.montantHt;
      
      // Add to totals
      totalHt += detail.montantHt;
      totalTtc += detail.montantTtc;
      totalTva += montantTva;
    }
    
    // Set delivery totals
    this.livraison.totalHt = totalHt;
    this.livraison.totalTva = totalTva;
    this.livraison.totalTtc = totalTtc;
    
    // Apply any discount/escompte to the final total
    if (this.livraison.escompte) {
      this.livraison.totalTtc -= this.livraison.escompte;
    }
  }
  
  
  submit(): void {
    if (!this.validateForm()) return;
    
    // Prepare data for submission
    const livraisonToSubmit = this.prepareLivraisonForSubmission();
    
    if (this.editMode && this.originalLivraisonId) {
      console.log('Updating livraison with ID:', this.originalLivraisonId);
      this.updateLivraison(this.originalLivraisonId, livraisonToSubmit);
    } else {
      this.createLivraison(livraisonToSubmit);
      this.livraisonService.incrementCompteur().subscribe({
        next: () => { 
          console.log('Compteur incremented successfully');
        },
        error: (err) => {
          console.error('Failed to increment compteur:', err);
          this.error = 'Failed to increment delivery counter';
        }
      });
    }
  }
  
  private prepareLivraisonForSubmission(): LivraisonReq {
    // Create a new object rather than mutating the original
    const livraisonCopy: LivraisonReq = {
      clientId: this.livraison.clientId,
      userId: this.livraison.userId,
      date: this.livraison.date,
      info: this.livraison.info,
      numero: this.livraison.numero,
      totalHt: this.livraison.totalHt,
      totalTva: this.livraison.totalTva,
      escompte: this.livraison.escompte,
      totalTtc: this.livraison.totalTtc,
      editeur: this.livraison.editeur,
      rowVersion: this.livraison.rowVersion || '',
      rowVersionString: this.livraison.rowVersionString || '',
      detailLivraisons: this.details.map(detail => ({
        articleId: detail.articleId,
        designation: detail.designation,
        quantite: detail.quantite,
        puHt: detail.puHt,
        puHtRemise: detail.puHtRemise,
        remiseHt: detail.remiseHt,
        puTtc: detail.puTtc,
        puTtcRemise: detail.puTtcRemise,
        remiseTtc: detail.remiseTtc,
        montantHt: detail.montantHt,
        montantTtc: detail.montantTtc,
        rowVersion: detail.rowVersion || '',
        rowVersionString: detail.rowVersionString || ''
      }))
    };
    
    console.log('Prepared livraison data:', livraisonCopy);
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
  
  private updateLivraison(id: string, livraison: LivraisonReq): void {
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
      // Log detailed error information
      console.error('Error details:', err.error);
      
      if (err.error?.message) {
        this.error = err.error.message;
      } else if (err.error) {
        this.error = typeof err.error === 'string' 
          ? err.error 
          : 'Invalid delivery data. Check the console for details.';
        
        // If it's an object, try to extract more useful information
        if (typeof err.error === 'object') {
          console.log('Validation errors:', JSON.stringify(err.error));
        }
      } else {
        this.error = 'Invalid delivery data';
      }
    } else if (err.status === 500) {
      this.error = 'Server error occurred. Please contact administrator.';
    } else if (err.status === 404) {
      this.error = 'Delivery not found';
    } else if (err.status === 0) {
      this.error = 'Network error - server may be offline';
    } else {
      this.error = `Failed to process delivery (${err.status})`;
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