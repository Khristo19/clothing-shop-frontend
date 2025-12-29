import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API_URL = `${environment.apiUrl}/auth`;

  // --- SIGNALS ---
  private _token = signal<string | null>(this.getTokenFromStorage());
  readonly token = computed(() => this._token());

  private _role = computed(() => this.decodeRole(this._token()));
  readonly role = computed(() => this._role());

  private _user = signal<{ id: number; email?: string; name?: string | null; surname?: string | null; role: 'admin' | 'cashier' } | null>(null);
  readonly user = computed(() => this._user());

  constructor(private http: HttpClient, private router: Router) {
    // Initialize user from localStorage if available
    const storedUser = this.getUserFromStorage();
    if (storedUser) {
      this._user.set(storedUser);
    }
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: { id: number; email: string; name?: string | null; surname?: string | null; role: 'admin' | 'cashier' } }>(`${this.API_URL}/login`, { email, password });
  }

  me() {
    return this.http.get<{ id: number; email?: string; name?: string | null; surname?: string | null; role: 'admin' | 'cashier' }>(`${this.API_URL}/me`);
  }

  setUser(user: { id: number; email?: string; name?: string | null; surname?: string | null; role: 'admin' | 'cashier' }) {
    this._user.set(user);
    this.saveUserToStorage(user);
  }

  fetchAndSetMe() {
    return this.me().pipe(
      tap((u) => {
        this._user.set(u);
        this.saveUserToStorage(u);
      }),
      catchError(() => {
        this._user.set(null);
        this.removeUserFromStorage();
        return of(null);
      })
    );
  }

  saveUserToStorage(user: { id: number; email?: string; name?: string | null; surname?: string | null; role: 'admin' | 'cashier' }) {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user to localStorage:', error);
    }
  }

  getUserFromStorage(): { id: number; email?: string; name?: string | null; surname?: string | null; role: 'admin' | 'cashier' } | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Failed to read user from localStorage:', error);
      return null;
    }
  }

  removeUserFromStorage() {
    try {
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Failed to remove user from localStorage:', error);
    }
  }

  saveToken(token: string) {
    try {
      localStorage.setItem('token', token);
      this._token.set(token);
    } catch (error) {
      console.error('Failed to save token to localStorage:', error);
      this._token.set(token);
    }
  }

  getTokenFromStorage(): string | null {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.error('Failed to read token from localStorage:', error);
      return null;
    }
  }

  getToken(): string | null {
    return this._token();
  }

  decodeRole(token: string | null): 'admin' | 'cashier' | null {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload.role;
    } catch {
      return null;
    }
  }

  logout() {
    try {
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Failed to remove token from localStorage:', error);
    }
    this.removeUserFromStorage();
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  let token: string | null = null;
  try {
    token = localStorage.getItem('token');
  } catch (error) {
    console.error('Failed to read token from localStorage:', error);
  }
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(authReq).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        try {
          localStorage.removeItem('token');
        } catch (error) {
          console.error('Failed to remove token from localStorage:', error);
        }
        router.navigate(['/login']);
      }
      throw err;
    })
  );
};

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  let token: string | null = null;
  try {
    token = localStorage.getItem('token');
  } catch (error) {
    console.error('Failed to read token from localStorage:', error);
  }
  if (!token) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

export function roleGuard(requiredRole: 'admin' | 'cashier'): CanActivateFn {
  return () => {
    const router = inject(Router);
    let token: string | null = null;
    try {
      token = localStorage.getItem('token');
    } catch (error) {
      console.error('Failed to read token from localStorage:', error);
    }
    if (!token) {
      router.navigate(['/login']);
      return false;
    }
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        router.navigate(['/login']);
        return false;
      }
      const payload = JSON.parse(atob(parts[1]));
      const ok = payload.role === requiredRole;
      if (!ok) router.navigate(['/login']);
      return ok;
    } catch {
      router.navigate(['/login']);
      return false;
    }
  };
}

export function multiRoleGuard(allowedRoles: ('admin' | 'cashier')[]): CanActivateFn {
  return () => {
    const router = inject(Router);
    let token: string | null = null;
    try {
      token = localStorage.getItem('token');
    } catch (error) {
      console.error('Failed to read token from localStorage:', error);
    }
    if (!token) {
      router.navigate(['/login']);
      return false;
    }
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        router.navigate(['/login']);
        return false;
      }
      const payload = JSON.parse(atob(parts[1]));
      const ok = allowedRoles.includes(payload.role);
      if (!ok) router.navigate(['/login']);
      return ok;
    } catch {
      router.navigate(['/login']);
      return false;
    }
  };
}
