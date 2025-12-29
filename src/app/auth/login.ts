// src/app/auth/login.ts
import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../core/auth';
import { TranslationService } from '../core/translation.service';
import { DarkModeService } from '../core/dark-mode.service';
import { finalize } from 'rxjs';

// Custom validator to check for whitespace-only values
function noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value && typeof value === 'string') {
    const isWhitespace = value.trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }
  return null;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  readonly translate = inject(TranslationService);
  readonly darkMode = inject(DarkModeService);
  readonly t = computed(() => this.translate.t());
  readonly currentLang = computed(() => this.translate.currentLanguage());
  readonly isDarkMode = computed(() => this.darkMode.isDarkMode());

  loading = signal(false);
  error = signal('');

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, noWhitespaceValidator]],
    password: ['', [Validators.required, noWhitespaceValidator]]
  });

  constructor() {
    // If already logged in, redirect!
    const role = this.auth.role();
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'cashier') {
      this.router.navigate(['/cashier']);
    }
  }

  toggleLanguage() {
    this.translate.toggleLanguage();
  }

  toggleDarkMode() {
    this.darkMode.toggle();
  }

  // Prevent space input
  preventSpace(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.loginForm.getRawValue();

    this.auth.login(email.trim(), password.trim())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.auth.saveToken(res.token);
          // Save user data from login response
          this.auth.setUser(res.user);

          const role = this.auth.role();
          if (role === 'admin') {
            this.router.navigate(['/admin']);
          } else if (role === 'cashier') {
            this.router.navigate(['/cashier']);
          } else {
            this.error.set('Unknown user role');
          }
        },
        error: (err) => {
          this.error.set(
            err?.error?.message || 'Login failed. Check credentials.'
          );
        },
      });
  }
}
