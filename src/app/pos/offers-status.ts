import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api';
import { TranslationService } from '../core/translation.service';
import { DarkModeService } from '../core/dark-mode.service';
import { Offer } from '../core/models';

@Component({
  selector: 'app-offers-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [style.background]="isDarkMode() ? '#0f172a' : '#f9fafb'" [style.color]="isDarkMode() ? '#e2e8f0' : '#111827'" style="padding:1.75rem;max-width:1200px;margin:0 auto;min-height:100vh;transition:background 0.3s,color 0.3s">
      <header style="margin-bottom:2rem">
        <h1 style="margin:0;font-size:1.75rem" [style.color]="isDarkMode() ? '#e2e8f0' : '#111827'">{{ t().offersStatus.title }}</h1>
        <p style="margin:.5rem 0 0" [style.color]="isDarkMode() ? '#94a3b8' : '#6b7280'">
          {{ t().offersStatus.subtitle }}
        </p>
      </header>

      <!-- Loading State -->
      <div *ngIf="loading()" [style.background]="isDarkMode() ? '#1e293b' : '#fff'" [style.box-shadow]="isDarkMode() ? '0 10px 30px rgba(0,0,0,.3)' : '0 1px 3px rgba(0,0,0,0.1)'" style="padding:2rem;text-align:center;border-radius:12px">
        <p [style.color]="isDarkMode() ? '#94a3b8' : '#6b7280'">{{ t().offersStatus.loadingOffers }}</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" [style.background]="isDarkMode() ? '#991b1b' : '#fee2e2'" [style.color]="isDarkMode() ? '#fca5a5' : '#991b1b'" style="padding:1rem;border-radius:12px;margin-bottom:1rem">
        {{ error() }}
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && !error() && offers().length === 0" [style.background]="isDarkMode() ? '#1e293b' : '#fff'" [style.box-shadow]="isDarkMode() ? '0 10px 30px rgba(0,0,0,.3)' : '0 1px 3px rgba(0,0,0,0.1)'" style="padding:3rem 2rem;text-align:center;border-radius:12px">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" [attr.stroke]="isDarkMode() ? '#64748b' : '#d1d5db'" stroke-width="1.5" style="margin:0 auto 1rem">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
        <h3 style="margin:0 0 .5rem" [style.color]="isDarkMode() ? '#e2e8f0' : '#374151'">{{ t().offersStatus.noOffersYet }}</h3>
        <p style="margin:0" [style.color]="isDarkMode() ? '#94a3b8' : '#6b7280'">{{ t().offersStatus.noOffersSubtitle }}</p>
      </div>

      <!-- Offers List -->
      <div *ngIf="!loading() && !error() && offers().length > 0" style="display:flex;flex-direction:column;gap:1rem">
        <div *ngFor="let offer of offers(); trackBy: trackOffer" [style.background]="isDarkMode() ? '#1e293b' : '#fff'" [style.box-shadow]="isDarkMode() ? '0 10px 30px rgba(0,0,0,.3)' : '0 1px 3px rgba(0,0,0,0.1)'" style="border-radius:12px;padding:1.5rem;border-left:4px solid" [style.border-left-color]="getStatusColor(offer.status)">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:1rem">
            <div>
              <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem">
                <h3 style="margin:0;font-size:1.1rem" [style.color]="isDarkMode() ? '#e2e8f0' : '#111827'">{{ offer.from_shop }}</h3>
                <span [style.background]="isDarkMode() ? getStatusBgColorDark(offer.status) : getStatusBgColor(offer.status)" [style.color]="isDarkMode() ? getStatusTextColorDark(offer.status) : getStatusTextColor(offer.status)" style="padding:.25rem .75rem;border-radius:999px;font-size:.85rem;font-weight:600">
                  {{ offer.status | uppercase }}
                </span>
              </div>
              <p style="margin:0;font-size:.9rem" [style.color]="isDarkMode() ? '#94a3b8' : '#6b7280'">
                {{ t().offersStatus.submitted }} {{ formatDate(offer.created_at) }}
              </p>
            </div>
          </div>

          <!-- Items -->
          <div style="margin-bottom:1rem">
            <h4 style="margin:0 0 .75rem;font-size:.95rem;font-weight:600" [style.color]="isDarkMode() ? '#94a3b8' : '#6b7280'">{{ t().offersStatus.items }}</h4>
            <div style="display:flex;flex-direction:column;gap:.5rem">
              <div *ngFor="let item of offer.items" [style.background]="isDarkMode() ? '#0f172a' : '#f9fafb'" style="display:flex;justify-content:space-between;padding:.5rem;border-radius:8px">
                <span [style.color]="isDarkMode() ? '#e2e8f0' : '#374151'">{{ item.qty }}x {{ item.name }}</span>
                <span [style.color]="isDarkMode() ? '#94a3b8' : '#6b7280'" style="font-weight:600">₾{{ (item.price * item.qty) | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <!-- Discount Details -->
          <div [style.background]="isDarkMode() ? '#0f172a' : '#f9fafb'" style="padding:1rem;border-radius:8px">
            <div style="display:flex;justify-content:space-between;margin-bottom:.5rem">
              <span [style.color]="isDarkMode() ? '#94a3b8' : '#6b7280'">{{ t().offersStatus.discountType }}</span>
              <span [style.color]="isDarkMode() ? '#e2e8f0' : '#111827'" style="font-weight:600">{{ offer.requested_discount.type === 'percentage' ? t().pos.percentage : t().offersStatus.fixedAmount }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:.5rem">
              <span [style.color]="isDarkMode() ? '#94a3b8' : '#6b7280'">{{ t().offersStatus.discountValue }}</span>
              <span [style.color]="isDarkMode() ? '#e2e8f0' : '#111827'" style="font-weight:600">{{ offer.requested_discount.type === 'percentage' ? offer.requested_discount.value + '%' : '₾' + offer.requested_discount.value }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:.5rem">
              <span [style.color]="isDarkMode() ? '#94a3b8' : '#6b7280'">{{ t().offersStatus.cartTotal }}</span>
              <span [style.color]="isDarkMode() ? '#e2e8f0' : '#111827'" style="font-weight:600">₾{{ offer.requested_discount.cart_total | number:'1.2-2' }}</span>
            </div>
            <div *ngIf="offer.payment_method" style="display:flex;justify-content:space-between">
              <span [style.color]="isDarkMode() ? '#94a3b8' : '#6b7280'">{{ t().offersStatus.paymentMethod }}</span>
              <span [style.color]="isDarkMode() ? '#e2e8f0' : '#111827'" style="font-weight:600">{{ formatPaymentMethod(offer.payment_method) }}</span>
            </div>
            <div *ngIf="offer.requested_discount.notes" [style.border-top]="isDarkMode() ? '1px solid #334155' : '1px solid #e5e7eb'" style="margin-top:.75rem;padding-top:.75rem">
              <span [style.color]="isDarkMode() ? '#94a3b8' : '#6b7280'" style="font-size:.9rem">{{ t().offersStatus.note }} </span>
              <span [style.color]="isDarkMode() ? '#e2e8f0' : '#374151'">{{ offer.requested_discount.notes }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OffersStatusComponent implements OnInit {
  private api = inject(ApiService);
  readonly translate = inject(TranslationService);
  readonly darkMode = inject(DarkModeService);
  readonly t = computed(() => this.translate.t());
  readonly isDarkMode = computed(() => this.darkMode.isDarkMode());

  readonly offers = signal<Offer[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    this.loadOffers();
  }

  loadOffers() {
    this.loading.set(true);
    this.error.set(null);
    this.api.listOffers().subscribe({
      next: (data) => {
        // Parse items and requested_discount if they're strings
        const parsedOffers = data.map(offer => ({
          ...offer,
          items: typeof offer.items === 'string' ? JSON.parse(offer.items) : offer.items,
          requested_discount: typeof offer.requested_discount === 'string'
            ? JSON.parse(offer.requested_discount)
            : offer.requested_discount,
          payment_method: offer.payment_method || undefined
        }));
        this.offers.set(parsedOffers);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Failed to load offers.');
      },
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
      case 'approved': return '#d1fae5';
      case 'rejected': return '#fee2e2';
      case 'pending': return '#fef3c7';
      default: return '#f3f4f6';
    }
  }

  getStatusTextColor(status: string): string {
    switch (status) {
      case 'approved': return '#065f46';
      case 'rejected': return '#991b1b';
      case 'pending': return '#92400e';
      default: return '#374151';
    }
  }

  getStatusBgColorDark(status: string): string {
    switch (status) {
      case 'approved': return '#065f46';
      case 'rejected': return '#7f1d1d';
      case 'pending': return '#78350f';
      default: return '#374151';
    }
  }

  getStatusTextColorDark(status: string): string {
    switch (status) {
      case 'approved': return '#6ee7b7';
      case 'rejected': return '#fca5a5';
      case 'pending': return '#fcd34d';
      default: return '#e5e7eb';
    }
  }

  formatDate(dateStr?: string): string {
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

  formatPaymentMethod(method: string): string {
    const t = this.translate.t();
    switch (method) {
      case 'cash': return t.pos.cash;
      case 'TBC': return t.offersStatus.cardTBC;
      case 'BOG': return t.offersStatus.cardBOG;
      default: return method;
    }
  }

  readonly trackOffer = (_: number, offer: Offer) => offer.id;
}
