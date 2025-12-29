import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Offer, CreateOfferRequest, UpdateOfferStatusRequest } from '../core/models';

@Injectable({ providedIn: 'root' })
export class OffersService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/offers`;

  list() {
    return this.http.get<Offer[]>(this.BASE);
  }
  create(payload: CreateOfferRequest) {
    return this.http.post<Offer>(this.BASE, payload);
  }
  updateStatus(payload: UpdateOfferStatusRequest) {
    return this.http.put<Offer>(`${this.BASE}/status`, payload);
  }
}
