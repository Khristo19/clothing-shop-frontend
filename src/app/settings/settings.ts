import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SettingsService } from '../core/settings.service';

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

  readonly saveMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  form = this.fb.nonNullable.group({
    tax: [this.settingsService.getTaxRate(), [Validators.min(0), Validators.max(100)]],
    currency: [this.settingsService.getCurrency()]
  });

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    try {
      this.settingsService.saveSettings({
        taxRate: formValue.tax,
        currency: formValue.currency
      });
      this.saveMessage.set({ text: 'Settings saved successfully!', type: 'success' });
      setTimeout(() => this.saveMessage.set(null), 3000);
    } catch (error) {
      this.saveMessage.set({ text: 'Failed to save settings. Please try again.', type: 'error' });
      setTimeout(() => this.saveMessage.set(null), 3000);
    }
  }
}
