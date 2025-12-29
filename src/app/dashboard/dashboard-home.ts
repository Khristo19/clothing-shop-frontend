import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api';
import { DashboardStats } from '../core/models';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h2 class="page-title">Dashboard Overview</h2>

      @if (loading()) {
        <div class="loading">Loading dashboard...</div>
      }

      @if (error()) {
        <div class="error">{{ error() }}</div>
      }

      @if (stats()) {
        <!-- KPI Cards -->
        <div class="kpi-grid">
          <!-- Today's Sales -->
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-icon">💰</span>
              <span class="kpi-label">Today's Sales</span>
            </div>
            <div class="kpi-value">{{ stats()!.today.revenue | number:'1.2-2' }} GEL</div>
            <div class="kpi-meta">{{ stats()!.today.transactions }} transactions</div>
          </div>

          <!-- This Week -->
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-icon">📅</span>
              <span class="kpi-label">This Week</span>
            </div>
            <div class="kpi-value">{{ stats()!.week.revenue | number:'1.2-2' }} GEL</div>
            <div class="kpi-meta">{{ stats()!.week.transactions }} transactions</div>
          </div>

          <!-- This Month -->
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-icon">📆</span>
              <span class="kpi-label">This Month</span>
            </div>
            <div class="kpi-value">{{ stats()!.month.revenue | number:'1.2-2' }} GEL</div>
            <div class="kpi-meta">{{ stats()!.month.transactions }} transactions</div>
          </div>

          <!-- Inventory Value -->
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-icon">📦</span>
              <span class="kpi-label">Inventory Value</span>
            </div>
            <div class="kpi-value">{{ stats()!.inventory.totalValue | number:'1.2-2' }} GEL</div>
            <div class="kpi-meta">Total stock value</div>
          </div>
        </div>

        <!-- Charts and Tables -->
        <div class="content-grid">
          <!-- Payment Methods -->
          <div class="card">
            <h3 class="card-title">Today's Payment Methods</h3>
            @if (stats()!.paymentMethods.length > 0) {
              <div class="payment-list">
                @for (pm of stats()!.paymentMethods; track pm.payment_method) {
                  <div class="payment-item">
                    <div class="payment-info">
                      <span class="payment-method">{{ pm.payment_method | uppercase }}</span>
                      @if (pm.payment_bank) {
                        <span class="payment-bank">({{ pm.payment_bank }})</span>
                      }
                    </div>
                    <div class="payment-stats">
                      <span class="payment-count">{{ pm.count }} txn</span>
                      <span class="payment-total">{{ pm.total | number:'1.2-2' }} GEL</span>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="empty-state">No transactions today</p>
            }
          </div>

          <!-- Top Products -->
          <div class="card">
            <h3 class="card-title">Top Selling Products (This Month)</h3>
            @if (stats()!.topProducts.length > 0) {
              <div class="product-list">
                @for (product of stats()!.topProducts; track product.product_id) {
                  <div class="product-item">
                    <div class="product-info">
                      <span class="product-name">{{ product.product_name }}</span>
                      <span class="product-sold">Sold: {{ product.total_sold }} units</span>
                    </div>
                    <div class="product-revenue">{{ product.revenue | number:'1.2-2' }} GEL</div>
                  </div>
                }
              </div>
            } @else {
              <p class="empty-state">No sales this month</p>
            }
          </div>
        </div>

        <!-- Inventory Alerts -->
        <div class="alerts-section">
          @if (stats()!.inventory.lowStock.length > 0) {
            <div class="alert alert-warning">
              <h3 class="alert-title">⚠️ Low Stock Alert</h3>
              <div class="alert-list">
                @for (item of stats()!.inventory.lowStock; track item.id) {
                  <div class="alert-item">
                    <span class="alert-item-name">{{ item.name }}</span>
                    <span class="alert-item-qty">Only {{ item.quantity }} left</span>
                  </div>
                }
              </div>
            </div>
          }

          @if (stats()!.inventory.outOfStock.length > 0) {
            <div class="alert alert-danger">
              <h3 class="alert-title">🚫 Out of Stock</h3>
              <div class="alert-list">
                @for (item of stats()!.inventory.outOfStock; track item.id) {
                  <div class="alert-item">
                    <span class="alert-item-name">{{ item.name }}</span>
                    <span class="alert-item-qty">Out of stock</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #111827;
    }

    .loading, .error {
      padding: 2rem;
      text-align: center;
      background: white;
      border-radius: 8px;
      margin: 1rem 0;
    }

    .error {
      color: #dc2626;
      border: 1px solid #fecaca;
      background: #fef2f2;
    }

    /* KPI Cards */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .kpi-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .kpi-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .kpi-icon {
      font-size: 1.5rem;
    }

    .kpi-label {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
    }

    .kpi-value {
      font-size: 1.875rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.25rem;
    }

    .kpi-meta {
      font-size: 0.875rem;
      color: #9ca3af;
    }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .card-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #111827;
    }

    .empty-state {
      color: #9ca3af;
      text-align: center;
      padding: 2rem 0;
    }

    /* Payment Methods */
    .payment-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .payment-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .payment-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .payment-method {
      font-weight: 600;
      color: #111827;
    }

    .payment-bank {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .payment-stats {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .payment-count {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .payment-total {
      font-weight: 600;
      color: #059669;
    }

    /* Products */
    .product-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .product-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .product-name {
      font-weight: 600;
      color: #111827;
    }

    .product-sold {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .product-revenue {
      font-weight: 600;
      color: #059669;
    }

    /* Alerts */
    .alerts-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .alert {
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .alert-warning {
      background: #fffbeb;
      border: 1px solid #fcd34d;
    }

    .alert-danger {
      background: #fef2f2;
      border: 1px solid #fecaca;
    }

    .alert-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .alert-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 0.75rem;
    }

    .alert-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0.75rem;
      background: white;
      border-radius: 6px;
    }

    .alert-item-name {
      font-weight: 500;
    }

    .alert-item-qty {
      font-size: 0.875rem;
      color: #6b7280;
    }
  `]
})
export class DashboardHomeComponent implements OnInit {
  private api = inject(ApiService);

  readonly stats = signal<DashboardStats | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    this.error.set(null);

    this.api.getDashboardStats().subscribe({
      next: (data: DashboardStats) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err?.error?.message || 'Failed to load dashboard');
        this.loading.set(false);
      }
    });
  }
}
