import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api';
import { TranslationService } from '../core/translation.service';
import { DarkModeService } from '../core/dark-mode.service';
import { SettingsService } from '../core/settings.service';
import { CashierPerformance } from '../core/models';

@Component({
  selector: 'app-cashier-performance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashier-performance.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashierPerformanceComponent {
  private api = inject(ApiService);
  readonly translate = inject(TranslationService);
  readonly darkMode = inject(DarkModeService);
  readonly settingsService = inject(SettingsService);
  readonly t = computed(() => this.translate.t());
  readonly isDarkMode = computed(() => this.darkMode.isDarkMode());
  readonly currency = computed(() => this.settingsService.getCurrency());

  readonly performance = signal<CashierPerformance[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // Date range signals
  readonly fromDate = signal(this.getCurrentMonthStart());
  readonly toDate = signal(this.getCurrentMonthEnd());

  constructor() {
    this.loadPerformance();
  }

  private getCurrentMonthStart(): string {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.formatDate(firstDay);
  }

  private getCurrentMonthEnd(): string {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return this.formatDate(lastDay);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  setThisMonth() {
    this.fromDate.set(this.getCurrentMonthStart());
    this.toDate.set(this.getCurrentMonthEnd());
    this.loadPerformance();
  }

  setLastMonth() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    this.fromDate.set(this.formatDate(firstDay));
    this.toDate.set(this.formatDate(lastDay));
    this.loadPerformance();
  }

  setThisYear() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0, 1);
    const lastDay = new Date(now.getFullYear(), 11, 31);
    this.fromDate.set(this.formatDate(firstDay));
    this.toDate.set(this.formatDate(lastDay));
    this.loadPerformance();
  }

  loadPerformance() {
    this.loading.set(true);
    this.error.set(null);

    this.api.getCashierPerformance(this.fromDate(), this.toDate()).subscribe({
      next: (data) => {
        this.performance.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Failed to load user performance');
      },
    });
  }

  readonly totalRevenue = computed(() =>
    this.performance().reduce((sum, c) => sum + parseFloat(c.total_revenue || '0'), 0)
  );

  readonly totalTransactions = computed(() =>
    this.performance().reduce((sum, c) => sum + parseInt(c.total_transactions || '0', 10), 0)
  );

  readonly activeUsers = computed(() =>
    this.performance().filter((c) => parseInt(c.total_transactions || '0', 10) > 0).length
  );

  getDisplayName(cashier: CashierPerformance): string {
    if (cashier.name && cashier.surname) {
      return `${cashier.name} ${cashier.surname}`;
    }
    if (cashier.name) return cashier.name;
    return cashier.email;
  }

  getMedalEmoji(rank: number): string {
    const medals = ['🥇', '🥈', '🥉'];
    return medals[rank - 1] || '👤';
  }

  getRoleIcon(role: string): string {
    return role === 'admin' ? '👑' : '👤';
  }

  getRoleBadgeColor(role: string): string {
    return role === 'admin' ? '#8b5cf6' : '#3b82f6';
  }

  calculatePercentage(amount: string, total: number): number {
    if (total === 0) return 0;
    return (parseFloat(amount) / total) * 100;
  }

  formatDateShort(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  exportToCSV() {
    const headers = [
      'Rank',
      'Name',
      'Email',
      'Role',
      'Total Revenue',
      'Transactions',
      'Avg Transaction',
      'First Sale',
      'Last Sale',
    ];

    const rows = this.performance().map((user, index) => [
      index + 1,
      this.getDisplayName(user),
      user.email,
      user.role,
      user.total_revenue,
      user.total_transactions,
      user.avg_transaction_value,
      this.formatDateShort(user.first_sale),
      this.formatDateShort(user.last_sale),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-performance-${this.fromDate()}-${this.toDate()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  readonly trackById = (_: number, cashier: CashierPerformance) => cashier.id;
}
