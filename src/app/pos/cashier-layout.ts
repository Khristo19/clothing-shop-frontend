import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth';
import { TranslationService } from '../core/translation.service';
import { DarkModeService } from '../core/dark-mode.service';

@Component({
  selector: 'app-cashier-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div style="display:flex;flex-direction:column;min-height:100vh;background:#f9fafb">
      <!-- Header with tabs -->
      <header style="background:#111827;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem 1.75rem">
          <!-- Left side - Avatar and User Info -->
          <div style="display:flex;align-items:center;gap:1rem">
            <div style="width:48px;height:48px;border-radius:50%;background:#3b82f6;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:1.1rem">
              {{ userInitials() }}
            </div>
            <div>
              <h2 style="margin:0;font-size:1.1rem;font-weight:600">{{ userName() }}</h2>
              <p style="margin:.125rem 0 0;font-size:.875rem;color:#94a3b8">{{ userRole() === 'admin' ? t().dashboard.adminPortal : t().cashier.title }}</p>
            </div>
          </div>
          <!-- Right side - Controls -->
          <div style="display:flex;align-items:center;gap:.75rem">
            <!-- Back to Admin Button (only for admin users) -->
            <a *ngIf="isAdmin()" routerLink="/admin" style="padding:.5rem 1rem;background:#8b5cf6;color:white;font-weight:600;display:flex;align-items:center;gap:.5rem;font-size:.875rem;border-radius:8px;text-decoration:none;cursor:pointer">
              <span style="font-size:1.1rem">👨‍💼</span>
              <span>{{ t().nav.backToAdmin }}</span>
            </a>
            <!-- Language Switcher -->
            <button
              (click)="toggleLanguage()"
              type="button"
              style="padding:.5rem 1rem;background:#059669;color:white;font-weight:600;display:flex;align-items:center;gap:.5rem;font-size:.875rem;border-radius:8px;border:none;cursor:pointer"
              title="Switch language">
              <span style="font-size:1.1rem">🌐</span>
              <span>{{ currentLang() === 'ge' ? 'GE' : 'EN' }}</span>
            </button>
            <!-- Dark Mode Toggle -->
            <button
              (click)="toggleDarkMode()"
              type="button"
              style="padding:.5rem 1rem;background:#6b7280;color:white;font-weight:600;display:flex;align-items:center;gap:.5rem;font-size:.875rem;border-radius:8px;border:none;cursor:pointer"
              title="Toggle dark mode">
              <span style="font-size:1.25rem">{{ isDarkMode() ? '☀️' : '🌙' }}</span>
              <span>{{ t().theme[isDarkMode() ? 'light' : 'dark'] }}</span>
            </button>
            <!-- Logout Button -->
            <button (click)="logout()" style="padding:.5rem 1rem;border-radius:8px;background:#ef4444;color:#fff;cursor:pointer;font-weight:600;border:none">
              {{ t().common.logout }}
            </button>
          </div>
        </div>

        <!-- Tab Navigation -->
        <nav style="display:flex;gap:0;border-top:1px solid rgba(255,255,255,0.1)">
          <a routerLink="/cashier/pos" routerLinkActive="active" style="padding:.875rem 1.5rem;color:rgba(255,255,255,0.7);text-decoration:none;border-bottom:3px solid transparent;transition:all 0.2s;font-weight:500;display:flex;align-items:center;gap:.5rem">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 3h-8v4h8V3z"></path>
            </svg>
            {{ t().cashier.pointOfSale }}
          </a>
          <a routerLink="/cashier/offers" routerLinkActive="active" style="padding:.875rem 1.5rem;color:rgba(255,255,255,0.7);text-decoration:none;border-bottom:3px solid transparent;transition:all 0.2s;font-weight:500;display:flex;align-items:center;gap:.5rem">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            {{ t().cashier.myOffers }}
          </a>
        </nav>
      </header>

      <!-- Main content -->
      <main style="flex:1;overflow:auto">
        <router-outlet></router-outlet>
      </main>
    </div>

    <style>
      nav a:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.05);
      }
      nav a.active {
        color: #fff;
        border-bottom-color: #60a5fa;
        background: rgba(255, 255, 255, 0.05);
      }
    </style>
  `,
})
export class CashierLayoutComponent {
  private auth = inject(AuthService);
  readonly darkMode = inject(DarkModeService);
  readonly translate = inject(TranslationService);
  readonly t = computed(() => this.translate.t());
  readonly currentLang = computed(() => this.translate.currentLanguage());
  readonly isDarkMode = computed(() => this.darkMode.isDarkMode());
  readonly currentUser = computed(() => this.auth.user());
  readonly userEmail = computed(() => this.currentUser()?.email || 'User');
  readonly userRole = computed(() => this.currentUser()?.role || 'cashier');
  readonly userName = computed(() => {
    const user = this.currentUser();
    if (user?.name && user?.surname) {
      return `${user.name} ${user.surname}`;
    }
    if (user?.name) {
      return user.name;
    }
    return this.userEmail();
  });
  readonly userInitials = computed(() => {
    const user = this.currentUser();
    // If name and surname exist, use first letters
    if (user?.name && user?.surname) {
      return `${user.name.charAt(0)}${user.surname.charAt(0)}`.toUpperCase();
    }
    // If only name exists, use first two letters of name
    if (user?.name) {
      return user.name.substring(0, 2).toUpperCase();
    }
    // Fallback to email
    const email = this.userEmail();
    return email.substring(0, 2).toUpperCase();
  });
  readonly isAdmin = computed(() => this.userRole() === 'admin');

  constructor() {
    // User data is already loaded from login, no need to fetch again
  }

  logout() {
    this.auth.logout();
  }

  toggleLanguage() {
    this.translate.toggleLanguage();
  }

  toggleDarkMode() {
    this.darkMode.toggle();
  }
}
