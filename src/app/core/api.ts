import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Item, Offer, Sale, CreateOfferRequest, UpdateOfferStatusRequest, SubmitCartRequest } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = environment.apiUrl;

  // Items
  listItems() {
    return this.http.get<Item[]>(`${this.BASE}/items/list.js`);
  }
  addItem(payload: Omit<Item, 'id'>) {
    return this.http.post<Item>(`${this.BASE}/items/add.js`, payload);
  }

  // Offers
  listOffers() {
    return this.http.get<Offer[]>(`${this.BASE}/offers/list.js`);
  }
  createOffer(payload: CreateOfferRequest) {
    return this.http.post<Offer>(`${this.BASE}/offers/create.js`, payload);
  }
  updateOfferStatus(payload: UpdateOfferStatusRequest) {
    return this.http.put<Offer>(`${this.BASE}/offers/approve.js`, payload);
  }

  // Sales / Orders
  submitCart(payload: SubmitCartRequest) {
    return this.http.post<Sale>(`${this.BASE}/sales/cart.js`, payload);
  }
  salesHistory() {
    return this.http.get<Sale[]>(`${this.BASE}/sales/history.js`);
  }
}
