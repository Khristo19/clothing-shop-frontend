// src/app/auth/login.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth';
import { switchMap, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {
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
        takeUntilDestroyed()
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
