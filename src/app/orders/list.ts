import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from './orders.service';
import { TranslationService } from '../core/translation.service';
import { DarkModeService } from '../core/dark-mode.service';
import { SettingsService } from '../core/settings.service';
import { ApiService } from '../core/api';
import { Location, User } from '../core/models';

type OrderItem = {
  id: number;
  qty: number;
  name?: string | null;
  price?: number | null;
};

type Order = {
  id: number;
  total: number;
  payment_method: string;
  created_at?: string | null;
  cashier_email?: string | null;
  items: OrderItem[];
  location_id: number | null;
  location_name: string | null;
  served_by_email: string | null;
  served_by_name: string | null;
  served_by_surname: string | null;
  partner_email: string | null;
  partner_name: string | null;
  partner_surname: string | null;
};

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersListComponent {
  private ordersService = inject(OrdersService);
  private apiService = inject(ApiService);
  readonly translate = inject(TranslationService);
  readonly darkMode = inject(DarkModeService);
  readonly settingsService = inject(SettingsService);
  readonly t = computed(() => this.translate.t());
  readonly isDarkMode = computed(() => this.darkMode.isDarkMode());
  readonly currency = computed(() => this.settingsService.getCurrency());

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly orders = signal<Order[]>([]);
  readonly expandedOrderId = signal<number | null>(null);

  // Filters
  readonly locations = signal<Location[]>([]);
  readonly cashiers = signal<User[]>([]);
  readonly filterLocationId = signal<number | null>(null);
  readonly filterServedByCashierId = signal<number | null>(null);
  readonly filterPartnerCashierId = signal<number | 'null' | null>(null);

  constructor() {
    this.loadLocations();
    this.loadCashiers();
    this.load();
  }

  private loadLocations() {
    this.apiService.listLocations().subscribe({
      next: (locations) => {
        this.locations.set(locations);
      },
      error: (err) => {
        console.error('Failed to load locations:', err);
      }
    });
  }

  private loadCashiers() {
    this.apiService.listCashiers().subscribe({
      next: (users) => {
        this.cashiers.set(users);
      },
      error: (err) => {
        console.error('Failed to load cashiers:', err);
      }
    });
  }

  readonly totalRevenue = computed(() =>
    this.orders().reduce((sum, order) => sum + Number(order.total ?? 0), 0)
  );

  readonly latestOrder = computed(() => this.orders()[0]?.created_at ?? null);

  load() {
    this.loading.set(true);
    this.error.set(null);

    // Build filters object
    const filters: any = {};
    if (this.filterLocationId()) {
      filters.location_id = this.filterLocationId();
    }
    if (this.filterServedByCashierId()) {
      filters.served_by_cashier_id = this.filterServedByCashierId();
    }
    if (this.filterPartnerCashierId()) {
      filters.partner_cashier_id = this.filterPartnerCashierId();
    }

    this.apiService.salesHistory(Object.keys(filters).length > 0 ? filters : undefined).subscribe({
      next: (rows) => {
        const normalized: Order[] = (rows ?? []).map((row: any) => {
          const items: OrderItem[] = Array.isArray(row.items)
            ? row.items.map((item: any) => ({
                id: Number(item.id ?? 0),
                qty: Number(item.qty ?? 0),
                name: item.name ?? null,
                price: item.price != null ? Number(item.price) : null,
              }))
            : [];
          return {
            id: Number(row.id ?? 0),
            total: Number(row.total ?? 0),
            payment_method: row.payment_method ?? 'unknown',
            created_at: row.created_at ?? null,
            cashier_email: row.cashier_email ?? null,
            location_id: row.location_id ?? null,
            location_name: row.location_name ?? null,
            served_by_email: row.served_by_email ?? null,
            served_by_name: row.served_by_name ?? null,
            served_by_surname: row.served_by_surname ?? null,
            partner_email: row.partner_email ?? null,
            partner_name: row.partner_name ?? null,
            partner_surname: row.partner_surname ?? null,
            items,
          };
        });
        this.orders.set(normalized);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Could not load orders');
      },
    });
  }

  applyFilters() {
    this.load();
  }

  clearFilters() {
    this.filterLocationId.set(null);
    this.filterServedByCashierId.set(null);
    this.filterPartnerCashierId.set(null);
    this.load();
  }

  getLocationName(locationName: string | null): string {
    return locationName || 'N/A';
  }

  getCashierDisplay(email: string | null, name: string | null, surname: string | null): string {
    if (!email) return 'N/A';
    if (name || surname) {
      return `${name || ''} ${surname || ''}`.trim();
    }
    return email;
  }

  toggleOrderDetails(orderId: number) {
    if (this.expandedOrderId() === orderId) {
      this.expandedOrderId.set(null);
    } else {
      this.expandedOrderId.set(orderId);
    }
  }

  isExpanded(orderId: number): boolean {
    return this.expandedOrderId() === orderId;
  }

  getPaymentMethodIcon(method: string): string {
    const normalized = method.toLowerCase();
    if (normalized === 'cash') return '💵';
    if (normalized.includes('tbc')) return '💳';
    if (normalized.includes('bog')) return '💳';
    if (normalized === 'card') return '💳';
    return '💰';
  }

  getPaymentMethodLabel(method: string): string {
    const normalized = method.toLowerCase();
    const translations = this.t().paymentMethods;

    if (normalized === 'cash') return translations.cash;
    if (normalized.includes('tbc') || normalized === 'tbc') return translations.tbcBank;
    if (normalized.includes('bog') || normalized === 'bog') return translations.bankOfGeorgia;
    if (normalized === 'card') return translations.card;

    return method;
  }

  readonly trackById = (_: number, order: Order) => order.id;
}
