import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Sale } from '../core/models';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/sales`;

  history() { return this.http.get<Sale[]>(this.BASE); }
  getById(id: number) { return this.http.get<Sale>(`${this.BASE}/${id}`); }
}
