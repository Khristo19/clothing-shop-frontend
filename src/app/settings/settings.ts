import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SettingsService } from '../core/settings.service';
import { ApiService } from '../core/api';
import { TranslationService } from '../core/translation.service';
import { Location } from '../core/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private api = inject(ApiService);
  readonly translate = inject(TranslationService);
  readonly t = computed(() => this.translate.t());

  readonly saveMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);
  readonly locations = signal<Location[]>([]);
  readonly editingLocation = signal<Location | null>(null);
  readonly showLocationForm = signal(false);

  constructor() {
    this.loadLocations();
  }

  private loadLocations() {
    this.api.listLocations().subscribe({
      next: (locations) => {
        this.locations.set(locations);
      },
      error: (err) => {
        console.error('Failed to load locations:', err);
        this.saveMessage.set({ text: 'Failed to load locations', type: 'error' });
        setTimeout(() => this.saveMessage.set(null), 3000);
      }
    });
  }

  form = this.fb.nonNullable.group({
    tax: [this.settingsService.getTaxRate(), [Validators.min(0), Validators.max(100)]],
    currency: [this.settingsService.getCurrency()],
    low_stock_threshold: [this.settingsService.getLowStockThreshold(), [Validators.required, Validators.min(1)]]
  });

  locationForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]]
  });

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    this.settingsService.saveSettings({
      taxRate: formValue.tax,
      currency: formValue.currency,
      low_stock_threshold: formValue.low_stock_threshold
    }).subscribe({
      next: () => {
        this.saveMessage.set({ text: this.t().settings.successMessage, type: 'success' });
        setTimeout(() => this.saveMessage.set(null), 3000);
      },
      error: () => {
        this.saveMessage.set({ text: this.t().settings.errorMessage, type: 'error' });
        setTimeout(() => this.saveMessage.set(null), 3000);
      }
    });
  }

  // Location Management
  openLocationForm(location?: Location) {
    if (location) {
      this.editingLocation.set(location);
      this.locationForm.patchValue({ name: location.name });
    } else {
      this.editingLocation.set(null);
      this.locationForm.reset();
    }
    this.showLocationForm.set(true);
  }

  closeLocationForm() {
    this.showLocationForm.set(false);
    this.editingLocation.set(null);
    this.locationForm.reset();
  }

  saveLocation() {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }

    const locationName = this.locationForm.getRawValue().name;
    const editing = this.editingLocation();

    if (editing) {
      // Update existing location via API
      this.api.updateLocation(editing.id, locationName).subscribe({
        next: () => {
          this.loadLocations();
          this.closeLocationForm();
          this.saveMessage.set({ text: this.t().settings.successMessage, type: 'success' });
          setTimeout(() => this.saveMessage.set(null), 3000);
        },
        error: (err) => {
          const errorMsg = err?.error?.message || this.t().settings.errorMessage;
          this.saveMessage.set({ text: errorMsg, type: 'error' });
          setTimeout(() => this.saveMessage.set(null), 3000);
        }
      });
    } else {
      // Create new location via API
      this.api.createLocation(locationName).subscribe({
        next: () => {
          this.loadLocations();
          this.closeLocationForm();
          this.saveMessage.set({ text: this.t().settings.successMessage, type: 'success' });
          setTimeout(() => this.saveMessage.set(null), 3000);
        },
        error: (err) => {
          const errorMsg = err?.error?.message || this.t().settings.errorMessage;
          this.saveMessage.set({ text: errorMsg, type: 'error' });
          setTimeout(() => this.saveMessage.set(null), 3000);
        }
      });
    }
  }

  deleteLocation(location: Location) {
    if (!confirm(`Delete location "${location.name}"?`)) return;

    this.api.deleteLocation(location.id).subscribe({
      next: () => {
        this.loadLocations();
        this.saveMessage.set({ text: this.t().settings.successMessage, type: 'success' });
        setTimeout(() => this.saveMessage.set(null), 3000);
      },
      error: (err) => {
        const errorData = err?.error;
        let errorMsg = this.t().settings.errorMessage;

        if (errorData?.message) {
          if (errorData.message.includes('referenced in sales')) {
            errorMsg = `Cannot delete. This location has ${errorData.sales_count || 0} sales records.`;
          } else if (errorData.message.includes('assigned to items')) {
            errorMsg = `Cannot delete. ${errorData.items_count || 0} items are assigned to this location.`;
          } else {
            errorMsg = errorData.message;
          }
        }

        this.saveMessage.set({ text: errorMsg, type: 'error' });
        setTimeout(() => this.saveMessage.set(null), 5000);
      }
    });
  }
}
