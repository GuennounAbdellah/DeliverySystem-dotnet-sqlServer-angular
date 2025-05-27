import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LayoutComponent } from "../../shared/layout/layout.component";
import { LivraisonService } from '../livraisons/services/livraison.service';
import { ClientService } from '../clients/services/client.service';
import { ArticleService } from '../articles/services/article.service';
import { AuditService } from '../../core/services/audit.service';
import { Livraison } from '../../core/models/livraison.model';
import { Client } from '../../core/models/client.model';
import { Article } from '../../core/models/article.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface DashboardStats {
  totalClients: number;
  totalArticles: number;
  totalUsers: number;
  todayDeliveries: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalAuditLogs: number;
  todayAuditLogs: number;
}

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  dueDate: Date;
}

interface AuditLog {
  id: string;
  userId: string;
  user?: {
    username: string;
    email: string;
  };
  numeroLivraison: string;
  action: string;
  timestamp: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalClients: 0,
    totalArticles: 0,
    totalUsers: 0,
    todayDeliveries: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalAuditLogs: 0,
    todayAuditLogs: 0
  };

  todayLivraisons: Livraison[] = [];
  lowStockArticles: Article[] = [];
  recentClients: Client[] = [];
  recentAuditLogs: AuditLog[] = [];
  loading = true;
  error: string | null = null;
  currentUser: any = null;
  currentDate: string = '';
  isAdmin: boolean = false;

  tasks: Task[] = [
    {
      id: '1',
      title: 'Vérifier les stocks faibles',
      priority: 'high',
      status: 'pending',
      dueDate: new Date()
    },
    {
      id: '2',
      title: 'Traiter les commandes en attente',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date(Date.now() + 86400000)
    },
    {
      id: '3',
      title: 'Mise à jour des prix articles',
      priority: 'low',
      status: 'completed',
      dueDate: new Date(Date.now() - 86400000)
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private livraisonService: LivraisonService,
    private clientService: ClientService,
    private articleService: ArticleService,
    private auditService: AuditService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser?.role === 'Admin' || this.currentUser?.role === 'admin';
    this.currentDate = new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    const loadTasks: Promise<void>[] = [
      this.loadStats(),
      this.loadTodayLivraisons(),
      this.loadLowStockArticles(),
      this.loadRecentClients()
    ];

    // Add audit logs loading for admin users
    if (this.isAdmin) {
      loadTasks.push(
        this.loadAuditStats(),
        this.loadRecentAuditLogs()
      );
    }
    
    // Load all data concurrently
    Promise.all(loadTasks).then(() => {
      this.loading = false;
      setTimeout(() => {
        this.initializeCharts();
      }, 100);
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
      this.error = 'Erreur lors du chargement des données du tableau de bord';
      this.loading = false;
    });
  }

  private async loadStats(): Promise<void> {
    try {
      const [clients, articles, livraisons] = await Promise.all([
        this.clientService.getClients().toPromise(),
        this.articleService.getArticles().toPromise(),
        this.livraisonService.getLivraisons().toPromise()
      ]);

      this.stats.totalClients = clients?.length || 0;
      this.stats.totalArticles = articles?.length || 0;
      this.stats.totalUsers = 5; // Default value since UserService doesn't have getUsers method

      // Calculate revenue and today's deliveries
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      let todayDeliveries = 0;
      let totalRevenue = 0;
      let monthlyRevenue = 0;

      livraisons?.forEach((livraison: Livraison) => {
        const livraisonDate = new Date(livraison.date);
        totalRevenue += livraison.totalTtc;
        
        if (this.isSameDay(livraisonDate, today)) {
          todayDeliveries++;
        }
        
        if (livraisonDate >= startOfMonth) {
          monthlyRevenue += livraison.totalTtc;
        }
      });

      this.stats.todayDeliveries = todayDeliveries;
      this.stats.totalRevenue = totalRevenue;
      this.stats.monthlyRevenue = monthlyRevenue;
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  private async loadAuditStats(): Promise<void> {
    try {
      const auditLogs = await this.auditService.getAuditLogs().toPromise();
      const today = new Date();
      
      this.stats.totalAuditLogs = auditLogs?.length || 0;
      this.stats.todayAuditLogs = auditLogs?.filter(log => 
        this.isSameDay(new Date(log.timestamp), today)
      ).length || 0;
    } catch (error) {
      console.error('Error loading audit stats:', error);
    }
  }

  private async loadRecentAuditLogs(): Promise<void> {
    try {
      const auditLogs = await this.auditService.getAuditLogs().toPromise();
      
      // Sort by timestamp descending and take the first 10
      this.recentAuditLogs = auditLogs
        ?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)
        .map(log => ({
          id: log.id,
          userId: log.userId,
          user: log.user,
          numeroLivraison: log.numeroLivraison,
          action: log.action,
          timestamp: new Date(log.timestamp)
        })) || [];
    } catch (error) {
      console.error('Error loading recent audit logs:', error);
    }
  }

  private async loadTodayLivraisons(): Promise<void> {
    try {
      const livraisons = await this.livraisonService.getLivraisons().toPromise();
      const today = new Date();
      
      this.todayLivraisons = livraisons?.filter(livraison => 
        this.isSameDay(new Date(livraison.date), today)
      ) || [];
    } catch (error) {
      console.error('Error loading today livraisons:', error);
    }
  }

  private async loadLowStockArticles(): Promise<void> {
    try {
      const articles = await this.articleService.getArticles().toPromise();
      // Since stockMin doesn't exist in Article model, we'll use a default minimum stock of 10
      this.lowStockArticles = articles?.filter(article => 
        article.stock <= 10
      ).slice(0, 5) || [];
    } catch (error) {
      console.error('Error loading low stock articles:', error);
    }
  }

  private async loadRecentClients(): Promise<void> {
    try {
      const clients = await this.clientService.getClients().toPromise();
      this.recentClients = clients?.slice(-5) || [];
    } catch (error) {
      console.error('Error loading recent clients:', error);
    }
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  private initializeCharts(): void {
    this.createRevenueChart();
    this.createDeliveryChart();
    if (this.isAdmin) {
      this.createAuditChart();
    }
  }

  private createRevenueChart(): void {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
          datasets: [{
            label: 'Chiffre d\'affaires',
            data: [12000, 19000, 15000, 25000, 22000, 30000],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#f0f0f0'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }
  }

  private createDeliveryChart(): void {
    const ctx = document.getElementById('deliveryChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Livré', 'En attente', 'Annulé'],
          datasets: [{
            data: [65, 25, 10],
            backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }

  private createAuditChart(): void {
    const ctx = document.getElementById('auditChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
          datasets: [{
            label: 'Activités Audit',
            data: [12, 19, 8, 15, 22, 6, 4],
            backgroundColor: 'rgba(156, 39, 176, 0.8)',
            borderColor: '#9C27B0',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#f0f0f0'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }
  }

  toggleTask(taskId: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = task.status === 'pending' ? 'completed' : 'pending';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#757575';
    }
  }

  getActionColor(action: string): string {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
      case 'add':
        return '#4CAF50';
      case 'update':
      case 'updated':
      case 'modify':
        return '#FF9800';
      case 'delete':
      case 'deleted':
      case 'remove':
        return '#F44336';
      case 'view':
      case 'viewed':
      case 'read':
        return '#2196F3';
      default:
        return '#757575';
    }
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  navigateToLivraisons(): void {
    this.router.navigate(['/livraisons']);
  }

  navigateToClients(): void {
    this.router.navigate(['/clients']);
  }

  navigateToArticles(): void {
    this.router.navigate(['/articles']);
  }

  navigateToAuditLogs(): void {
    this.router.navigate(['/audit-logs']);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR');
  }

  formatDateTime(date: Date): string {
    return date.toLocaleString('fr-FR');
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    return this.formatDate(date);
  }
}