import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ApiService } from '../core/api';
import { SalesReport, CashierPerformance } from '../core/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseChartDirective],
  template: `
    <div class="reports-container">
      <h2 class="page-title">Sales Reports & Analytics</h2>

      <!-- Date Range Selector -->
      <div class="filters-card">
        <form [formGroup]="dateForm" class="date-range-form">
          <div class="form-group">
            <label for="fromDate">From Date</label>
            <input
              type="date"
              id="fromDate"
              formControlName="fromDate"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="toDate">To Date</label>
            <input
              type="date"
              id="toDate"
              formControlName="toDate"
              class="form-control"
            />
          </div>

          <div class="form-actions">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="setQuickRange('week')"
            >
              Last 7 Days
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              (click)="setQuickRange('month')"
            >
              Last 30 Days
            </button>
            <button
              type="button"
              class="btn btn-primary"
              (click)="loadReports()"
              [disabled]="dateForm.invalid || loading()"
            >
              {{ loading() ? 'Loading...' : 'Generate Report' }}
            </button>
          </div>
        </form>
      </div>

      @if (error()) {
        <div class="error-message">{{ error() }}</div>
      }

      @if (salesReport()) {
        <!-- Summary KPIs -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon">💰</div>
            <div class="kpi-content">
              <div class="kpi-label">Total Revenue</div>
              <div class="kpi-value">{{ salesReport()!.summary.total_revenue | number:'1.2-2' }} GEL</div>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon">🧾</div>
            <div class="kpi-content">
              <div class="kpi-label">Total Transactions</div>
              <div class="kpi-value">{{ salesReport()!.summary.total_transactions }}</div>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon">📊</div>
            <div class="kpi-content">
              <div class="kpi-label">Average Order Value</div>
              <div class="kpi-value">{{ salesReport()!.summary.avg_order_value | number:'1.2-2' }} GEL</div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-grid">
          <!-- Daily Sales Line Chart -->
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Daily Sales Trend</h3>
              <button class="btn btn-icon" (click)="exportCSV()" [disabled]="exporting()">
                {{ exporting() ? 'Exporting...' : '📥 Export CSV' }}
              </button>
            </div>
            <div class="chart-container">
              @if (lineChartData()) {
                <canvas
                  baseChart
                  [type]="'line'"
                  [data]="lineChartData()!"
                  [options]="lineChartOptions"
                ></canvas>
              }
            </div>
          </div>

          <!-- Payment Methods Pie Chart -->
          <div class="chart-card">
            <h3 class="chart-title">Payment Method Breakdown</h3>
            <div class="chart-container pie-chart">
              @if (pieChartData()) {
                <canvas
                  baseChart
                  [type]="'pie'"
                  [data]="pieChartData()!"
                  [options]="pieChartOptions"
                ></canvas>
              }
            </div>
          </div>
        </div>

        <!-- Cashier Performance Table -->
        @if (cashierPerformance() && cashierPerformance()!.length > 0) {
          <div class="table-card">
            <h3 class="card-title">Cashier Performance</h3>
            <div class="table-responsive">
              <table class="performance-table">
                <thead>
                  <tr>
                    <th>Cashier</th>
                    <th>Total Sales</th>
                    <th>Transactions</th>
                    <th>Average Sale</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  @for (cashier of cashierPerformance(); track cashier.id) {
                    <tr>
                      <td class="cashier-name">{{ cashier.email }}</td>
                      <td class="amount">{{ cashier.total_revenue | number:'1.2-2' }} GEL</td>
                      <td class="count">{{ cashier.total_transactions }}</td>
                      <td class="amount">{{ cashier.avg_transaction_value | number:'1.2-2' }} GEL</td>
                      <td>
                        <div class="performance-bar">
                          <div
                            class="performance-fill"
                            [style.width.%]="getPerformancePercentage(+cashier.total_revenue)"
                          ></div>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }

      @if (!salesReport() && !loading() && !error()) {
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <h3>No Report Generated</h3>
          <p>Select a date range and click "Generate Report" to view sales analytics.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .reports-container {
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

    /* Filters Card */
    .filters-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .date-range-form {
      display: grid;
      grid-template-columns: 1fr 1fr 2fr;
      gap: 1rem;
      align-items: end;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .form-control {
      padding: 0.625rem 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.625rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e5e7eb;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-icon {
      padding: 0.5rem 0.875rem;
      font-size: 0.875rem;
    }

    .error-message {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
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
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: transform 0.2s;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .kpi-icon {
      font-size: 2.5rem;
      line-height: 1;
    }

    .kpi-content {
      flex: 1;
    }

    .kpi-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.25rem;
    }

    .kpi-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
    }

    /* Charts Grid */
    .charts-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .chart-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 1.5rem 0;
    }

    .chart-header .chart-title {
      margin: 0;
    }

    .chart-container {
      position: relative;
      height: 300px;
    }

    .chart-container.pie-chart {
      height: 350px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Table Card */
    .table-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .card-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 1rem 0;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .performance-table {
      width: 100%;
      border-collapse: collapse;
    }

    .performance-table th {
      text-align: left;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #6b7280;
      background: #f9fafb;
      border-bottom: 2px solid #e5e7eb;
    }

    .performance-table td {
      padding: 1rem;
      border-bottom: 1px solid #f3f4f6;
    }

    .performance-table tbody tr:hover {
      background: #f9fafb;
    }

    .cashier-name {
      font-weight: 500;
      color: #111827;
    }

    .amount {
      font-weight: 600;
      color: #059669;
    }

    .count {
      color: #6b7280;
    }

    .performance-bar {
      width: 200px;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .performance-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
      border-radius: 4px;
      transition: width 0.3s;
    }

    /* Empty State */
    .empty-state {
      background: white;
      border-radius: 12px;
      padding: 4rem 2rem;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #6b7280;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .date-range-form {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }

      .kpi-grid {
        grid-template-columns: 1fr;
      }

      .performance-bar {
        width: 100px;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly exporting = signal(false);
  readonly error = signal<string | null>(null);
  readonly salesReport = signal<SalesReport | null>(null);
  readonly cashierPerformance = signal<CashierPerformance[] | null>(null);

  dateForm = this.fb.group({
    fromDate: ['', Validators.required],
    toDate: ['', Validators.required]
  });

  // Line Chart Configuration
  readonly lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (value === null || value === undefined) return `${label}: N/A`;
            if (label.includes('Revenue')) {
              return `${label}: ${value.toFixed(2)} GEL`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue (GEL)'
        }
      },
      y1: {
        display: true,
        beginAtZero: true,
        position: 'right',
        grid: {
          drawOnChartArea: false
        },
        title: {
          display: true,
          text: 'Transactions'
        }
      }
    }
  };

  // Pie Chart Configuration
  readonly pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toFixed(2)} GEL (${percentage}%)`;
          }
        }
      }
    }
  };

  // Computed chart data
  readonly lineChartData = computed<ChartData<'line'> | null>(() => {
    const report = this.salesReport();
    if (!report || !report.dailySales || report.dailySales.length === 0) {
      return null;
    }

    const labels = report.dailySales.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: report.dailySales.map(d => +d.revenue),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: 'Transactions',
          data: report.dailySales.map(d => +d.transaction_count),
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1',
        }
      ]
    };
  });

  readonly pieChartData = computed<ChartData<'pie'> | null>(() => {
    const report = this.salesReport();
    if (!report || !report.paymentBreakdown || report.paymentBreakdown.length === 0) {
      return null;
    }

    const labels = report.paymentBreakdown.map(pm => {
      let label = pm.payment_method.toUpperCase();
      if (pm.payment_bank) {
        label += ` (${pm.payment_bank})`;
      }
      return label;
    });

    const data = report.paymentBreakdown.map(pm => +pm.total);

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#3b82f6',
          '#8b5cf6',
          '#ec4899',
          '#f59e0b',
          '#10b981',
          '#6366f1',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      }]
    };
  });

  ngOnInit() {
    // Set default date range to last 30 days
    this.setQuickRange('month');
  }

  setQuickRange(range: 'week' | 'month') {
    const today = new Date();
    const toDate = this.formatDate(today);

    const fromDate = new Date(today);
    if (range === 'week') {
      fromDate.setDate(today.getDate() - 7);
    } else {
      fromDate.setDate(today.getDate() - 30);
    }

    this.dateForm.patchValue({
      fromDate: this.formatDate(fromDate),
      toDate
    });
  }

  loadReports() {
    if (this.dateForm.invalid) return;

    const { fromDate, toDate } = this.dateForm.value;
    if (!fromDate || !toDate) return;

    this.loading.set(true);
    this.error.set(null);

    // Load sales report and cashier performance in parallel
    Promise.all([
      this.api.getSalesReport(fromDate, toDate).toPromise(),
      this.api.getCashierPerformance(fromDate, toDate).toPromise()
    ])
      .then(([salesData, cashierData]) => {
        this.salesReport.set(salesData as SalesReport);
        this.cashierPerformance.set(cashierData as CashierPerformance[]);
        this.loading.set(false);
      })
      .catch((err) => {
        this.error.set(err?.error?.message || 'Failed to load reports');
        this.loading.set(false);
      });
  }

  exportCSV() {
    if (this.dateForm.invalid) return;

    const { fromDate, toDate } = this.dateForm.value;
    if (!fromDate || !toDate) return;

    this.exporting.set(true);

    this.api.exportSalesCSV(fromDate, toDate).subscribe({
      next: (blob: Blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sales-report-${fromDate}-to-${toDate}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.exporting.set(false);
      },
      error: (err: any) => {
        this.error.set(err?.error?.message || 'Failed to export CSV');
        this.exporting.set(false);
      }
    });
  }

  getPerformancePercentage(sales: number): number {
    const allSales = this.cashierPerformance();
    if (!allSales || allSales.length === 0) return 0;

    const maxSales = Math.max(...allSales.map(c => +c.total_revenue));
    return maxSales > 0 ? (sales / maxSales) * 100 : 0;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
