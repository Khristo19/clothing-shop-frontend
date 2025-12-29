import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth';
import { DarkModeService } from '../core/dark-mode.service';
import { TranslationService } from '../core/translation.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.html',
})
export class AdminComponent {
  private auth = inject(AuthService);
  readonly darkMode = inject(DarkModeService);
  readonly translate = inject(TranslationService);
  readonly user = computed(() => this.auth.user());
  readonly isDarkMode = computed(() => this.darkMode.isDarkMode());
  readonly t = computed(() => this.translate.t());
  readonly currentLang = computed(() => this.translate.currentLanguage());
  readonly adminEmail = computed(() => this.user()?.email || 'Admin');
  readonly adminName = computed(() => {
    const user = this.user();
    if (user?.name && user?.surname) {
      return `${user.name} ${user.surname}`;
    }
    if (user?.name) {
      return user.name;
    }
    return this.adminEmail();
  });
  readonly adminInitials = computed(() => {
    const user = this.user();
    // If name and surname exist, use first letters
    if (user?.name && user?.surname) {
      return `${user.name.charAt(0)}${user.surname.charAt(0)}`.toUpperCase();
    }
    // If only name exists, use first two letters of name
    if (user?.name) {
      return user.name.substring(0, 2).toUpperCase();
    }
    // Fallback to email
    const email = this.adminEmail();
    return email.substring(0, 2).toUpperCase();
  });

  constructor() {
    // User data is already loaded from login, no need to fetch again
  }

  logout() {
    this.auth.logout();
  }

  toggleDarkMode() {
    this.darkMode.toggle();
  }

  toggleLanguage() {
    this.translate.toggleLanguage();
  }
}
