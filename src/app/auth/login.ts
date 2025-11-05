// src/app/auth/login.ts
import { Component, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth';
import { switchMap, finalize, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  private destroyRef = inject(DestroyRef);
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor() {
    // If already logged in, redirect!
    const role = this.auth.role();
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'cashier') {
      this.router.navigate(['/cashier']);
    }
  }

  onLogin() {
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password)
      .pipe(
        switchMap((res: { token: string }) => {
          this.auth.saveToken(res.token);
          return this.auth.fetchAndSetMe();
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
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
