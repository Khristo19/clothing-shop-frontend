import { Injectable, signal } from '@angular/core';

export interface AppSettings {
  taxRate: number;
  currency: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly STORAGE_KEY = 'app_settings';

  private readonly defaultSettings: AppSettings = {
    taxRate: 0,
    currency: 'USD'
  };

  private _settings = signal<AppSettings>(this.loadSettings());

  readonly settings = this._settings.asReadonly();

  private loadSettings(): AppSettings {
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

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      this._settings.set(settings);
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
      throw error;
    }
  }

  getTaxRate(): number {
    return this._settings().taxRate;
  }

  getCurrency(): string {
    return this._settings().currency;
  }
}
