import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DarkModeService {
  private readonly STORAGE_KEY = 'dark-mode';

  // Signal to track dark mode state
  readonly isDarkMode = signal<boolean>(this.loadDarkModePreference());

  constructor() {
    // Apply dark mode on initialization
    this.applyDarkMode(this.isDarkMode());

    // Watch for changes and apply them
    effect(() => {
      this.applyDarkMode(this.isDarkMode());
    });
  }

  private loadDarkModePreference(): boolean {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved !== null) {
        return saved === 'true';
      }
      // Default to system preference
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (error) {
      console.error('Failed to load dark mode preference:', error);
      return false;
    }
  }

  private saveDarkModePreference(isDark: boolean): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, isDark.toString());
    } catch (error) {
      console.error('Failed to save dark mode preference:', error);
    }
  }

  private applyDarkMode(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggle(): void {
    const newValue = !this.isDarkMode();
    this.isDarkMode.set(newValue);
    this.saveDarkModePreference(newValue);
  }

  enable(): void {
    this.isDarkMode.set(true);
    this.saveDarkModePreference(true);
  }

  disable(): void {
    this.isDarkMode.set(false);
    this.saveDarkModePreference(false);
  }
}
