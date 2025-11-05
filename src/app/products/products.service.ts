import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Item } from '../core/models';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/items`;

  list() { return this.http.get<Item[]>(`${this.BASE}/list.js`); }
  add(payload: Omit<Item, 'id'>) {
    return this.http.post<Item>(`${this.BASE}/add.js`, payload);
  }
}
