import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductsService } from './products.service';
import { ApiService } from '../core/api';
import { TranslationService } from '../core/translation.service';
import { DarkModeService } from '../core/dark-mode.service';
import { SettingsService } from '../core/settings.service';
import { Location } from '../core/models';

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
  size?: string | null;
  image_url?: string | null;
  location_id?: number | null;
  location_name?: string | null;
  created_at?: string | null;
};

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListComponent {
  private api = inject(ProductsService);
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);
  private translate = inject(TranslationService);
  readonly darkMode = inject(DarkModeService);
  private settingsService = inject(SettingsService);

  readonly items = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showCreate = signal(false);
  readonly search = signal('');
  readonly useFileUpload = signal(false);
  readonly selectedFile = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(null);
  readonly editingProduct = signal<Product | null>(null);
  readonly showLowStockOnly = signal(false);
  readonly locations = signal<Location[]>([]);
  readonly t = computed(() => this.translate.t());
  readonly isDarkMode = computed(() => this.darkMode.isDarkMode());

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    size: ['', [Validators.maxLength(50)]],
    image_url: [''],
    description: [''],
    location_id: [null as number | null],
  });

  constructor() {
    this.loadLocations();
    this.reload();

    // Watch for URL changes to update preview
    this.form.get('image_url')?.valueChanges.subscribe((url) => {
      if (url && !this.useFileUpload() && this.isValidUrl(url)) {
        this.imagePreview.set(url);
      } else if (!this.useFileUpload() && !url) {
        this.imagePreview.set(null);
      }
    });
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  readonly filtered = computed(() => {
    const term = (this.search() || '').toLowerCase().trim();
    return this.items().filter((p) => {
      const name = (p.name || '').toLowerCase();
      const description = (p.description || '').toLowerCase();
      const size = (p.size || '').toLowerCase();
      return !term || name.includes(term) || description.includes(term) || size.includes(term);
    });
  });

  readonly totalCount = computed(() => this.items().length);
  readonly lowStockThreshold = computed(() => this.settingsService.getLowStockThreshold());
  readonly lowStockCount = computed(() =>
    this.items().filter((p) => p.quantity < this.lowStockThreshold() && p.quantity > 0).length
  );

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

  reload() {
    this.loading.set(true);
    this.error.set(null);
    const lowStockFilter = this.showLowStockOnly();
    this.api.list(lowStockFilter).subscribe({
      next: (rows) => {
        const normalized: Product[] = (rows ?? []).map((row: any) => ({
          id: Number(row.id ?? 0),
          name: row.name ?? '',
          description: row.description ?? '',
          price: Number(row.price ?? 0),
          quantity: Number(row.quantity ?? 0),
          size: row.size ?? null,
          image_url: row.image_url ?? null,
          location_id: row.location_id ?? null,
          location_name: row.location_name ?? null,
          created_at: row.created_at ?? null,
        }));
        this.items.set(normalized);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Could not load products');
      },
    });
  }

  toggleLowStockFilter() {
    this.showLowStockOnly.set(!this.showLowStockOnly());
    this.reload();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.error.set('File size must be less than 5MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        this.error.set('Invalid file type. Please use JPG, PNG, GIF, or WebP');
        return;
      }

      this.selectedFile.set(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      this.error.set(null);
    }
  }

  toggleImageInputMode() {
    this.useFileUpload.set(!this.useFileUpload());
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    this.form.patchValue({ image_url: '' });
  }

  clearImage() {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    this.form.patchValue({ image_url: '' });
  }

  openEditDialog(product: Product) {
    this.editingProduct.set(product);
    this.form.patchValue({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      size: product.size || '',
      description: product.description || '',
      image_url: product.image_url || '',
      location_id: product.location_id || null,
    });
    if (product.image_url) {
      this.imagePreview.set(product.image_url);
    }
    this.showCreate.set(true);
  }

  closeDialog() {
    this.showCreate.set(false);
    this.editingProduct.set(null);
    this.useFileUpload.set(false);
    this.clearImage();
    this.form.reset({ name: '', price: 0, quantity: 0, size: '', image_url: '', description: '' });
  }

  create() {
    if (this.form.invalid) return;
    this.loading.set(true);
    const formValues = this.form.getRawValue();

    const payload: any = {
      name: formValues.name,
      description: formValues.description,
      price: formValues.price,
      quantity: formValues.quantity,
      size: formValues.size || null,
      image_url: formValues.image_url,
      image: this.selectedFile() || undefined,
    };

    // Add location_id if selected
    if (formValues.location_id) {
      payload.location_id = formValues.location_id;
    }

    const editing = this.editingProduct();
    const request = editing
      ? this.api.update(editing.id, payload)
      : this.api.add(payload);

    request.subscribe({
      next: () => {
        this.closeDialog();
        this.reload();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || `Could not ${editing ? 'update' : 'create'} product`);
      },
    });
  }

  deleteProduct(product: Product) {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    this.loading.set(true);
    this.api.delete(product.id).subscribe({
      next: () => {
        this.reload();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Could not delete product');
      },
    });
  }

  readonly trackById = (_: number, p: Product) => p.id;
}
