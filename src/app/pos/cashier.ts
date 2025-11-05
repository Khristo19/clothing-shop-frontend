import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../core/api';
import { SettingsService } from '../core/settings.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Item } from '../core/models';

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  description?: string | null;
  imageUrl?: string | null;
};

type CartItem = Product & { qty: number };

type Banner = { text: string; tone: 'info' | 'error' };

@Component({
  selector: 'app-cashier',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cashier.html',
})
export class CashierComponent implements OnDestroy {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private bannerTimer: ReturnType<typeof setTimeout> | null = null;

  readonly products = signal<Product[]>([]);
  readonly loadingProducts = signal(false);
  readonly productError = signal<string | null>(null);
  readonly pickerOpen = signal(false);
  readonly search = signal('');

  readonly cart = signal<CartItem[]>([]);
  payment: 'cash' | 'card' = 'cash';
  readonly cardBank = signal<'TBC' | 'BOG' | null>(null);
  readonly cardModalOpen = signal(false);

  readonly banner = signal<Banner | null>(null);
  readonly offerModalOpen = signal(false);
  readonly offerSubmitting = signal(false);

  readonly offerForm = this.fb.nonNullable.group({
    from_shop: ['POS Front Desk', [Validators.required]],
    discount_type: ['percentage' as 'percentage' | 'amount', [Validators.required]],
    discount_value: [10, [Validators.required, Validators.min(0)]],
    notes: [''],
  });

  readonly filteredProducts = computed(() => {
    const term = this.search().toLowerCase().trim();
    return this.products()
      .filter((p) => {
        const haystack = `${p.name} ${(p.description || '')}`.toLowerCase();
        return !term || haystack.includes(term);
      })
      .sort((a, b) => b.stock - a.stock);
  });

  readonly subtotal = computed(() =>
    this.cart().reduce((sum, item) => sum + item.price * item.qty, 0)
  );
  readonly discount = computed(() => 0);
  readonly tax = computed(() => {
    const taxRate = this.settingsService.getTaxRate();
    return this.subtotal() * (taxRate / 100);
  });
  readonly total = computed(() => this.subtotal() - this.discount() + this.tax());
  readonly totalItems = computed(() => this.cart().reduce((sum, item) => sum + item.qty, 0));

  constructor() {
    this.loadProducts();
  }

  ngOnDestroy() {
    if (this.bannerTimer) {
      clearTimeout(this.bannerTimer);
    }
  }

  togglePicker() {
    const next = !this.pickerOpen();
    this.pickerOpen.set(next);
    if (!next) this.search.set('');
  }

  private loadProducts() {
    this.loadingProducts.set(true);
    this.productError.set(null);
    this.api.listItems().subscribe({
      next: (rows) => {
        const mapped: Product[] = rows.map((row) => ({
          id: row.id,
          name: row.name ?? 'Unnamed item',
          price: row.price,
          stock: row.quantity,
          description: row.description ?? '',
          imageUrl: row.image_url ?? null,
        }));
        this.products.set(mapped);
        this.loadingProducts.set(false);
      },
      error: (err) => {
        this.loadingProducts.set(false);
        this.productError.set(err?.error?.message || 'Unable to load inventory.');
      },
    });
  }

  private notify(text: string, tone: Banner['tone'] = 'info', duration = 2500) {
    this.banner.set({ text, tone });
    if (this.bannerTimer) clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => this.banner.set(null), duration);
  }

  addProduct(product: Product) {
    if (product.stock <= 0) {
      this.notify(`${product.name} is out of stock.`, 'error');
      return;
    }
    const cart = this.cart();
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.qty >= product.stock) {
        this.notify(`All available stock of ${product.name} is already in the cart.`, 'error');
        return;
      }
      existing.qty += 1;
      this.cart.set([...cart]);
    } else {
      this.cart.set([...cart, { ...product, qty: 1 }]);
    }
    this.notify(`${product.name} added to cart.`);
    this.pickerOpen.set(false);
    this.search.set('');
  }

  inc(item: CartItem) {
    if (item.qty >= item.stock) {
      this.notify(`Cannot exceed available stock for ${item.name}.`, 'error');
      return;
    }
    item.qty += 1;
    this.cart.set([...this.cart()]);
  }

  dec(item: CartItem) {
    item.qty = Math.max(1, item.qty - 1);
    this.cart.set([...this.cart()]);
  }

  remove(item: CartItem) {
    this.cart.set(this.cart().filter((c) => c.id !== item.id));
  }

  clearCart() {
    this.cart.set([]);
    this.payment = 'cash';
    this.cardBank.set(null);
  }

  setPayment(method: 'cash' | 'card') {
    if (method === 'card') {
      this.cardModalOpen.set(true);
    } else {
      this.payment = 'cash';
      this.cardBank.set(null);
    }
  }

  confirmCardBank(bank: 'TBC' | 'BOG') {
    this.cardBank.set(bank);
    this.payment = 'card';
    this.cardModalOpen.set(false);
  }

  cancelCardSelection() {
    this.cardModalOpen.set(false);
    this.payment = 'cash';
    this.cardBank.set(null);
  }

  openOfferModal() {
    if (this.cart().length === 0) {
      this.notify('Add items to the cart before requesting a discount.', 'error');
      return;
    }
    this.offerForm.reset({
      from_shop: 'POS Front Desk',
      discount_type: 'percentage' as 'percentage' | 'amount',
      discount_value: 10,
      notes: ''
    });
    this.offerModalOpen.set(true);
  }

  closeOfferModal() {
    this.offerModalOpen.set(false);
  }

  submitOffer() {
    if (this.cart().length === 0) {
      this.notify('Add items before requesting approval.', 'error');
      return;
    }
    if (this.offerForm.invalid) {
      this.offerForm.markAllAsTouched();
      return;
    }
    const formValue = this.offerForm.getRawValue();
    const payload = {
      from_shop: formValue.from_shop,
      items: this.cart().map((item) => ({ id: item.id, qty: item.qty, name: item.name, price: item.price })),
      requested_discount: {
        type: formValue.discount_type,
        value: formValue.discount_value,
        notes: formValue.notes,
        cart_total: this.total(),
      },
    };
    this.offerSubmitting.set(true);
    this.api.createOffer(payload).subscribe({
      next: () => {
        this.offerSubmitting.set(false);
        this.offerModalOpen.set(false);
        this.notify('Offer sent to admin for approval.');
      },
      error: (err) => {
        this.offerSubmitting.set(false);
        this.notify(err?.error?.message || 'Could not submit offer.', 'error', 4000);
      },
    });
  }

  cardChipStyles() {
    const bank = this.cardBank();
    if (this.payment !== 'card' || !bank) {
      return {
        background: '#f9fafb',
        color: '#111827',
        border: '1px solid #d1d5db',
      };
    }
    return bank === 'TBC'
      ? { background: '#dbeafe', color: '#1d4ed8', border: '1px solid #2563eb' }
      : { background: '#ffedd5', color: '#c2410c', border: '1px solid #f97316' };
  }

  cardBankLabel() {
    const bank = this.cardBank();
    if (!bank) return '';
    return bank === 'TBC' ? '(TBC Bank)' : '(Bank of Georgia)';
  }

  cardButtonStyles(bank: 'TBC' | 'BOG') {
    const selected = this.cardBank() === bank;
    if (bank === 'TBC') {
      return selected
        ? { background: '#1d4ed8', color: '#fff', border: '1px solid #1d4ed8' }
        : { background: '#e0f2fe', color: '#1d4ed8', border: '1px solid #60a5fa' };
    }
    return selected
      ? { background: '#f97316', color: '#fff', border: '1px solid #ea580c' }
      : { background: '#ffedd5', color: '#c2410c', border: '1px solid #fbbf24' };
  }

  readonly trackProduct = (_: number, product: Product) => product.id;
  readonly trackCart = (_: number, item: CartItem) => item.id;

  submit() {
    if (this.cart().length === 0) {
      this.notify('Add at least one item before saving the order.', 'error');
      return;
    }
    if (this.payment === 'card' && !this.cardBank()) {
      this.notify('Select a bank to process the card payment.', 'error');
      this.cardModalOpen.set(true);
      return;
    }

    const bank = this.cardBank();
    const paymentMethod: 'cash' | 'card-TBC' | 'card-BOG' =
      this.payment === 'card' && bank ? (bank === 'TBC' ? 'card-TBC' : 'card-BOG') : 'cash';

    const payload = {
      items: this.cart().map((item) => ({
        id: item.id,
        qty: item.qty,
        price: item.price,
        name: item.name,
      })),
      total: this.total(),
      payment_method: paymentMethod,
    };

    this.api.submitCart(payload).subscribe({
      next: () => {
        this.notify('Sale completed. Ready for the next customer!');
        this.cart.set([]);
        this.payment = 'cash';
        this.cardBank.set(null);
        this.loadProducts();
      },
      error: (err) => {
        this.notify(err?.error?.message || 'Could not save the sale.', 'error', 4000);
      },
    });
  }
}
