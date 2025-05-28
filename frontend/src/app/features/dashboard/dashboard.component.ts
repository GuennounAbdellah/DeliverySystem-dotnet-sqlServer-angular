import { Component, OnInit, OnDestroy, LOCALE_ID, Inject } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../shared/layout/layout.component';
import { AuthService } from '../../core/auth/auth.service';
import { AuditService } from '../../core/services/audit.service';
import { LivraisonService } from '../livraisons/services/livraison.service';
import { ArticleService } from '../articles/services/article.service';
import { ClientService } from '../clients/services/client.service';
import { FamilleService } from '../familles/services/famille.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart, registerables, ChartType } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

// Register French locale
registerLocaleData(localeFr);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr' }
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Key metrics
  totalArticles: number = 0;
  totalDeliveries: number = 0;
  totalRevenueHT: number = 0;
  totalRevenueTTC: number = 0;
  totalClients: number = 0;
  
  // Charts
  deliveriesChart: Chart | null = null;
  stockDistributionChart: Chart | null = null;
  
  // Chart configuration
  activeDeliveryChartType: ChartType = 'bar';
  activeStockChartType: ChartType = 'pie';
  deliveryChartData: any = { labels: [], data: [] };
  stockChartData: any = { labels: [], data: [] };
  
  // Tables data
  topClients: any[] = [];
  lowStockArticles: any[] = [];
  
  // User data
  currentUser: any;
  userAuditLogs: any[] = [];
  
  // UI state
  today = new Date();
  isRefreshing = false;
  
  // Loading states
  loading = {
    metrics: true,
    deliveriesChart: true,
    stockChart: true,
    topClients: true,
    lowStock: true,
    auditLogs: true
  };
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private auditService: AuditService,
    private livraisonService: LivraisonService,
    private articleService: ArticleService,
    private clientService: ClientService,
    private familleService: FamilleService
  ) {}

  ngOnInit(): void {
    // Get current user info
    this.currentUser = this.authService.getCurrentUser();
    
    // Load dashboard data
    this.loadKeyMetrics();
    this.loadDeliveriesChart();
    this.loadStockDistributionChart();
    this.loadTopClients();
    this.loadUserAuditLogs();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Destroy charts to prevent memory leaks
    if (this.deliveriesChart) {
      this.deliveriesChart.destroy();
    }
    if (this.stockDistributionChart) {
      this.stockDistributionChart.destroy();
    }
  }

  // UI interaction methods
  refreshDashboard(): void {
    this.isRefreshing = true;
    
    // Reset loading states
    Object.keys(this.loading).forEach(key => {
      this.loading[key as keyof typeof this.loading] = true;
    });
    
    // Reload all data
    this.loadKeyMetrics();
    this.loadDeliveriesChart();
    this.loadStockDistributionChart();
    this.loadTopClients();
    this.loadUserAuditLogs();
    
    // Update current date
    this.today = new Date();
    
    // Reset refresh state after a short delay to show animation
    setTimeout(() => {
      this.isRefreshing = false;
    }, 800);
  }
  
  printDashboard(): void {
    window.print();
  }

  changeDeliveryChartType(type: ChartType): void {
    if (this.activeDeliveryChartType === type) return;
    
    this.activeDeliveryChartType = type;
    if (this.deliveryChartData.labels.length > 0) {
      this.renderDeliveriesChart(this.deliveryChartData.labels, this.deliveryChartData.data);
    }
  }

  changeStockChartType(type: ChartType): void {
    if (this.activeStockChartType === type) return;
    
    this.activeStockChartType = type;
    if (this.stockChartData.labels.length > 0) {
      this.renderStockDistributionChart(this.stockChartData.labels, this.stockChartData.data);
    }
  }
  
  // Data loading methods (keep existing implementation)
  loadKeyMetrics(): void {
    // Count total articles
    this.articleService.getArticles().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (articles) => {
        this.totalArticles = articles.length;
        this.loading.metrics = false;
      },
      error: (err) => {
        console.error('Error fetching articles:', err);
        this.loading.metrics = false;
      }
    });
    
    // Get current month's deliveries
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    this.livraisonService.getLivraisons().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (livraisons) => {
        // Filter for current month
        const currentMonthLivraisons = livraisons.filter(livraison => 
          new Date(livraison.date) >= firstDayOfMonth
        );
        
        this.totalDeliveries = currentMonthLivraisons.length;
        
        // Calculate total revenue
        this.totalRevenueHT = currentMonthLivraisons.reduce((sum, livraison) => 
          sum + (livraison.totalHt || 0), 0);
        this.totalRevenueTTC = currentMonthLivraisons.reduce((sum, livraison) => 
          sum + (livraison.totalTtc || 0), 0);
      },
      error: (err) => {
        console.error('Error fetching livraisons:', err);
        this.loading.metrics = false;
      }
    });
    
    // Count total clients
    this.clientService.getClients().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (clients) => {
        this.totalClients = clients.length;
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
        this.loading.metrics = false;
      }
    });
  }
  
  loadDeliveriesChart(): void {
    // Modify to store chart data for reuse when changing chart types
    this.loading.deliveriesChart = true;
    
    // Get last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.livraisonService.getLivraisons().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (livraisons) => {
        // Filter for last 30 days and group by date
        const filteredLivraisons = livraisons.filter(
          livraison => new Date(livraison.date) >= thirtyDaysAgo
        );
        
        // Create a map for the last 30 days (all days should appear even if no deliveries)
        const deliveriesByDay = new Map();
        
        // Initialize all days with 0 deliveries
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(today.getDate() - (29 - i));
          const dateStr = date.toISOString().split('T')[0];
          deliveriesByDay.set(dateStr, 0);
        }
        
        // Count deliveries for each day
        filteredLivraisons.forEach(livraison => {
          const dateStr = new Date(livraison.date).toISOString().split('T')[0];
          if (deliveriesByDay.has(dateStr)) {
            deliveriesByDay.set(dateStr, deliveriesByDay.get(dateStr) + 1);
          }
        });
        
        // Prepare chart data
        const labels = Array.from(deliveriesByDay.keys()).map(dateStr => {
          const date = new Date(dateStr);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        });
        const data = Array.from(deliveriesByDay.values());
        
        // Store data for chart type changes
        this.deliveryChartData = { labels, data };
        
        // Create chart
        this.renderDeliveriesChart(labels, data);
        this.loading.deliveriesChart = false;
      },
      error: (err) => {
        console.error('Error fetching deliveries for chart:', err);
        this.loading.deliveriesChart = false;
      }
    });
  }
  
  renderDeliveriesChart(labels: string[], data: number[]): void {
    const ctx = document.getElementById('deliveriesChart') as HTMLCanvasElement;
    if (ctx) {
      // Destroy previous chart instance if it exists
      if (this.deliveriesChart) {
        this.deliveriesChart.destroy();
      }
      
      const gradient = ctx.getContext('2d')?.createLinearGradient(0, 0, 0, 300);
      if (gradient) {
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
      }

      this.deliveriesChart = new Chart(ctx, {
        type: this.activeDeliveryChartType,
        data: {
          labels: labels,
          datasets: [{
            label: 'Livraisons par jour',
            data: data,
            backgroundColor: this.activeDeliveryChartType === 'line' ? gradient : 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            tension: 0.3,
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
            pointRadius: this.activeDeliveryChartType === 'line' ? 3 : 0,
            fill: this.activeDeliveryChartType === 'line'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              padding: 12,
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              },
              displayColors: false,
              callbacks: {
                title: (items) => `Date: ${items[0].label}`,
                label: (item) => `${item.parsed.y} livraison${item.parsed.y !== 1 ? 's' : ''}`
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#64748b',
                font: {
                  size: 11
                }
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(226, 232, 240, 0.5)'
              },
              border: {
                dash: [5, 5]
              },
              ticks: {
                precision: 0,
                color: '#64748b',
                font: {
                  size: 11
                }
              }
            }
          }
        }
      });
    }
  }
  
  loadStockDistributionChart(): void {
    // Modify to store chart data for reuse when changing chart types
    this.loading.stockChart = true;
    
    // Get all articles and families
    this.articleService.getArticles().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (articles) => {
        this.familleService.getFamilles().pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (familles) => {
            // Group articles by family
            const articlesByFamily = new Map();
            
            // Initialize families with 0 articles
            familles.forEach(famille => {
              articlesByFamily.set(famille.nom, 0);
            });
            
            // Count articles in each family
            articles.forEach(article => {
              if (article.famille && article.famille.nom) {
                const familyName = article.famille.nom;
                if (articlesByFamily.has(familyName)) {
                  articlesByFamily.set(familyName, articlesByFamily.get(familyName) + 1);
                } else {
                  articlesByFamily.set(familyName, 1);
                }
              }
            });
            
            // Prepare chart data
            const labels = Array.from(articlesByFamily.keys());
            const data = Array.from(articlesByFamily.values());
            
            // Store data for chart type changes
            this.stockChartData = { labels, data };
            
            // Create chart
            this.renderStockDistributionChart(labels, data);
            this.loading.stockChart = false;
          },
          error: (err) => {
            console.error('Error fetching families:', err);
            this.loading.stockChart = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching articles for chart:', err);
        this.loading.stockChart = false;
      }
    });
  }
  
  renderStockDistributionChart(labels: string[], data: number[]): void {
    const ctx = document.getElementById('stockDistributionChart') as HTMLCanvasElement;
    if (ctx) {
      // Destroy previous chart instance if it exists
      if (this.stockDistributionChart) {
        this.stockDistributionChart.destroy();
      }
      
      const colors = [
        '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6',
        '#ec4899', '#6366f1', '#14b8a6', '#f43f5e', '#84cc16'
      ];

      this.stockDistributionChart = new Chart(ctx, {
        type: this.activeStockChartType,
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors.map(color => color + 'cc'),
            borderColor: colors,
            borderWidth: 2,
            hoverOffset: 15
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                usePointStyle: true,
                padding: 15,
                font: {
                  size: 11
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              padding: 12,
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              },
              callbacks: {
                label: (item) => `${item.label}: ${item.raw} article${item.raw !== 1 ? 's' : ''} (${Math.round(item.parsed * 100 / data.reduce((a, b) => a + b, 0))}%)`
              }
            }
          },
          //radius: this.activeStockChartType === 'doughnut' ? '60%' : undefined
        }
      });
    }
  }
  
  loadTopClients(): void {
    this.loading.topClients = true;
    
    // First get all clients to create a mapping of client IDs to names
    this.clientService.getClients().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (clients) => {
        // Create a map of client IDs to client names for efficient lookup
        const clientMap = new Map(
          clients.map(client => [client.id, client.nom || 'Inconnu'])
        );
        
        // Now get all deliveries
        this.livraisonService.getLivraisons().pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (livraisons) => {
            // Group deliveries by client
            const deliveriesByClient = new Map();
            
            livraisons.forEach(livraison => {
              if (livraison && livraison.clientId) {
                const clientId = livraison.clientId;
                const clientName = clientMap.get(clientId) || 'Inconnu';
                
                if (!deliveriesByClient.has(clientId)) {
                  deliveriesByClient.set(clientId, { 
                    id: clientId, 
                    nom: clientName, 
                    count: 0, 
                    totalAmount: 0 
                  });
                }
                
                const client = deliveriesByClient.get(clientId);
                client.count++;
                client.totalAmount += livraison.totalTtc || 0;
                deliveriesByClient.set(clientId, client);
              }
            });
            
            // Sort clients by delivery count and take top 5
            this.topClients = Array.from(deliveriesByClient.values())
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);
            
            this.loading.topClients = false;
          },
          error: (err) => {
            console.error('Error fetching deliveries:', err);
            this.loading.topClients = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
        this.loading.topClients = false;
      }
    });
  }
  
 
  
  loadUserAuditLogs(): void {
    this.loading.auditLogs = true;
    
    if (this.currentUser && this.currentUser.id) {
      // Fetch last 5 audit logs for current user
      this.auditService.getAuditLogs().pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (logs) => {
          this.userAuditLogs = logs;
          this.loading.auditLogs = false;
        },
        error: (err) => {
          console.error('Error fetching user audit logs:', err);
          this.loading.auditLogs = false;
        }
      });
    } else {
      this.loading.auditLogs = false;
    }
  }
  
  // Format number as currency
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(value);
  }
}