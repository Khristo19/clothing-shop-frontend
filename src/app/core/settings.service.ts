import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api';
import { tap, catchError, of } from 'rxjs';
import { Settings, Location } from './models';

export interface AppSettings {
  taxRate: number;
  currency: string;
  low_stock_threshold: number;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly api = inject(ApiService);
  private readonly STORAGE_KEY = 'app_settings';

  private readonly defaultSettings: AppSettings = {
    taxRate: 0.18,
    currency: 'GEL',
    low_stock_threshold: 5
  };

  private _settings = signal<AppSettings>(this.loadFromLocalStorage());

  readonly settings = this._settings.asReadonly();

  private loadFromLocalStorage(): AppSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...this.defaultSettings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
    return this.defaultSettings;
  }

  // Fetch settings from backend API
  fetchSettings() {
    return this.api.getSettings().pipe(
      tap((backendSettings: Settings) => {
        // Map backend Settings to AppSettings
        const appSettings: AppSettings = {
          taxRate: backendSettings.tax_rate,
          currency: backendSettings.currency,
          low_stock_threshold: backendSettings.low_stock_threshold
        };
        this._settings.set(appSettings);
        try {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(appSettings));
        } catch (error) {
          console.error('Failed to cache settings to localStorage:', error);
        }
      }),
      catchError((error) => {
        console.error('Failed to fetch settings from API:', error);
        return of(this._settings());
      })
    );
  }

  // Save settings to backend API
  saveSettings(settings: Partial<AppSettings>) {
    // Map AppSettings to UpdateSettingsRequest
    const updatePayload: any = {};
    if (settings.taxRate !== undefined) updatePayload.tax_rate = settings.taxRate;
    if (settings.currency !== undefined) updatePayload.currency = settings.currency;
    if (settings.low_stock_threshold !== undefined) updatePayload.low_stock_threshold = settings.low_stock_threshold;

    return this.api.updateSettings(updatePayload).pipe(
      tap((backendSettings: Settings) => {
        // Map backend Settings back to AppSettings
        const appSettings: AppSettings = {
          taxRate: backendSettings.tax_rate,
          currency: backendSettings.currency,
          low_stock_threshold: backendSettings.low_stock_threshold
        };
        this._settings.set(appSettings);
        try {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(appSettings));
        } catch (error) {
          console.error('Failed to cache settings to localStorage:', error);
        }
      }),
      catchError((error) => {
        console.error('Failed to save settings to API:', error);
        throw error;
      })
    );
  }

  getTaxRate(): number {
    return this._settings().taxRate;
  }

  getCurrency(): string {
    return this._settings().currency;
  }

  getLowStockThreshold(): number {
    return this._settings().low_stock_threshold ?? 5;
  }
}
