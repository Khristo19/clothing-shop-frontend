import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { OffersService } from './offers.service';
import { TranslationService } from '../core/translation.service';
import { DarkModeService } from '../core/dark-mode.service';

type OfferItem = {
  id: number;
  qty: number;
  name?: string | null;
  price?: number | null;
};

type DiscountRequest = {
  type: 'percentage' | 'manual';
  value: number;
  notes?: string;
  cart_total?: number;
};

type Offer = {
  id: number;
  from_shop: string;
  status: 'pending' | 'approved' | 'rejected';
  payment_method?: 'cash' | 'TBC' | 'BOG';
  cashier_id?: number | null;
  cashier_name?: string | null;
  cashier_surname?: string | null;
  cashier_email?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  requested_discount?: DiscountRequest;
  items: OfferItem[];
};

@Component({
  selector: 'app-offers-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './offers-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersListComponent {
  private offersApi = inject(OffersService);
  private fb = inject(FormBuilder);
  readonly translate = inject(TranslationService);
  readonly darkMode = inject(DarkModeService);
  readonly t = computed(() => this.translate.t());
  readonly isDarkMode = computed(() => this.darkMode.isDarkMode());

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly offers = signal<Offer[]>([]);
  readonly showCreate = signal(false);

  readonly form = this.fb.nonNullable.group({
    from_shop: ['', [Validators.required]],
    items: ['[]', [Validators.required]],
    requested_discount: ['{}', [Validators.required]],
  });

  constructor() {
    this.loadOffers();
  }

  readonly totals = computed(() => {
    const all = this.offers();
    return {
      total: all.length,
      pending: all.filter((o) => o.status === 'pending').length,
      approved: all.filter((o) => o.status === 'approved').length,
    };
  });

  loadOffers() {
    this.loading.set(true);
    this.error.set(null);
    this.offersApi.list().subscribe({
      next: (rows) => {
        const normalized: Offer[] = (rows ?? []).map((row: any) => {
          const rawStatus = typeof row.status === 'string' ? row.status.toLowerCase() : '';
          const status: 'pending' | 'approved' | 'rejected' =
            rawStatus === 'approved'
              ? 'approved'
              : rawStatus === 'rejected'
              ? 'rejected'
              : 'pending';

          // Parse items if it's a string
          let items: OfferItem[] = [];
          const rawItems = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
          if (Array.isArray(rawItems)) {
            items = rawItems.map((item: any) => ({
              id: Number(item.id ?? 0),
              qty: Number(item.qty ?? 0),
              name: item.name ?? null,
              price: item.price != null ? Number(item.price) : null,
            }));
          }

          // Parse requested_discount if it's a string
          let requested_discount: DiscountRequest | undefined;
          const rawDiscount = typeof row.requested_discount === 'string'
            ? JSON.parse(row.requested_discount)
            : row.requested_discount;
          if (rawDiscount && typeof rawDiscount === 'object') {
            requested_discount = {
              type: rawDiscount.type || 'percentage',
              value: Number(rawDiscount.value ?? 0),
              notes: rawDiscount.notes,
              cart_total: rawDiscount.cart_total ? Number(rawDiscount.cart_total) : undefined,
            };
          }

          return {
            id: Number(row.id ?? 0),
            from_shop: row.from_shop ?? 'Unknown shop',
            status,
            payment_method: row.payment_method || undefined,
            cashier_id: row.cashier_id != null ? Number(row.cashier_id) : null,
            cashier_name: row.cashier_name ?? null,
            cashier_surname: row.cashier_surname ?? null,
            cashier_email: row.cashier_email ?? null,
            created_at: row.created_at ?? null,
            updated_at: row.updated_at ?? null,
            requested_discount,
            items,
          };
        });
        this.offers.set(normalized);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Could not load offers');
      },
    });
  }

  formatPaymentMethod(method?: string): string {
    const t = this.translate.t();
    switch (method) {
      case 'cash': return t.pos.cash;
      case 'TBC': return t.offersStatus.cardTBC;
      case 'BOG': return t.offersStatus.cardBOG;
      default: return '-';
    }
  }

  formatDate(dateStr?: string | null): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  }

  getStatusBgColor(status: string): string {
    switch (status) {
      case 'approved': return this.isDarkMode() ? '#065f46' : '#d1fae5';
      case 'rejected': return this.isDarkMode() ? '#7f1d1d' : '#fee2e2';
      case 'pending': return this.isDarkMode() ? '#78350f' : '#fef3c7';
      default: return this.isDarkMode() ? '#374151' : '#f3f4f6';
    }
  }

  getStatusTextColor(status: string): string {
    switch (status) {
      case 'approved': return this.isDarkMode() ? '#6ee7b7' : '#065f46';
      case 'rejected': return this.isDarkMode() ? '#fca5a5' : '#991b1b';
      case 'pending': return this.isDarkMode() ? '#fcd34d' : '#92400e';
      default: return this.isDarkMode() ? '#e5e7eb' : '#374151';
    }
  }

  getCashierDisplay(offer: Offer): string {
    // If cashier_name AND cashier_surname exist: Show "Name Surname"
    if (offer.cashier_name && offer.cashier_surname) {
      return `${offer.cashier_name} ${offer.cashier_surname}`;
    }
    // If only cashier_name exists: Show "Name"
    if (offer.cashier_name) {
      return offer.cashier_name;
    }
    // If neither exist but email exists: Show email
    if (offer.cashier_email) {
      return offer.cashier_email;
    }
    // If nothing exists: Show "-" or "Unknown"
    return '-';
  }

  create() {
    if (this.form.invalid) return;
    try {
      const raw = this.form.getRawValue();
      const payload = {
        from_shop: raw.from_shop,
        items: JSON.parse(raw.items),
        requested_discount: JSON.parse(raw.requested_discount),
      };
      this.loading.set(true);
      this.offersApi.create(payload).subscribe({
        next: () => {
          this.showCreate.set(false);
          this.form.reset({ from_shop: '', items: '[]', requested_discount: '{}' });
          this.loadOffers();
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err?.error?.message || 'Could not create offer');
        },
      });
    } catch (err) {
      this.error.set('Items or discount is not valid JSON');
    }
  }

  updateStatus(id: number, status: 'approved' | 'rejected') {
    this.loading.set(true);
    this.offersApi.updateStatus({ offer_id: id, status }).subscribe({
      next: () => this.loadOffers(),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Could not update offer');
      },
    });
  }

  readonly trackById = (_: number, o: Offer) => o.id;
}

