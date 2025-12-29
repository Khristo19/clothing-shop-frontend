import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'cashier';
  name?: string | null;
  surname?: string | null;
  created_at?: string | null;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  role: 'admin' | 'cashier';
  name?: string;
  surname?: string;
}

export interface UpdateUserPayload {
  email: string;
  role: 'admin' | 'cashier';
  name?: string;
  surname?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private API_URL = `${environment.apiUrl}/users`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL);
  }

  createUser(payload: CreateUserPayload): Observable<User> {
    return this.http.post<User>(this.API_URL, payload);
  }

  updateUser(id: number, payload: UpdateUserPayload): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, payload);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
