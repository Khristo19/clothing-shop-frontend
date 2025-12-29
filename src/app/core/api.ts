import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import {
  Item,
  Offer,
  Sale,
  CreateOfferRequest,
  UpdateOfferStatusRequest,
  SubmitCartRequest,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  DashboardStats,
  SalesReport,
  CashierPerformance,
  Settings,
  UpdateSettingsRequest,
  Location
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = environment.apiUrl;

  // Items
  listItems(lowStock?: boolean) {
    if (lowStock) {
      return this.http.get<Item[]>(`${this.BASE}/items`, { params: { lowStock: 'true' } });
    }
    return this.http.get<Item[]>(`${this.BASE}/items`);
  }
  addItem(payload: Omit<Item, 'id'> | FormData) {
    return this.http.post<Item>(`${this.BASE}/items/add`, payload);
  }
  updateItem(id: number, payload: Partial<Omit<Item, 'id'>> | FormData) {
    return this.http.put<Item>(`${this.BASE}/items/${id}`, payload);
  }
  deleteItem(id: number) {
    return this.http.delete<{ message: string; item: Item }>(`${this.BASE}/items/${id}`);
  }

  // Offers
  listOffers() {
    return this.http.get<Offer[]>(`${this.BASE}/offers`);
  }
  createOffer(payload: CreateOfferRequest) {
    return this.http.post<Offer>(`${this.BASE}/offers`, payload);
  }
  updateOfferStatus(payload: UpdateOfferStatusRequest) {
    return this.http.put<Offer>(`${this.BASE}/offers/status`, payload);
  }

  // Sales / Orders
  submitCart(payload: SubmitCartRequest) {
    return this.http.post<Sale>(`${this.BASE}/sales`, payload);
  }
  salesHistory(filters?: {
    from?: string;
    to?: string;
    location_id?: number;
    served_by_cashier_id?: number;
    partner_cashier_id?: number | 'null';
  }) {
    let params: any = {};
    if (filters) {
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.location_id) params.location_id = filters.location_id.toString();
      if (filters.served_by_cashier_id) params.served_by_cashier_id = filters.served_by_cashier_id.toString();
      if (filters.partner_cashier_id !== undefined) {
        params.partner_cashier_id = filters.partner_cashier_id === 'null' ? 'null' : filters.partner_cashier_id.toString();
      }
    }
    return this.http.get<Sale[]>(`${this.BASE}/sales`, { params });
  }
  getSaleById(id: number) {
    return this.http.get<Sale>(`${this.BASE}/sales/${id}`);
  }

  // Users Management
  listUsers() {
    return this.http.get<User[]>(`${this.BASE}/users`);
  }
  listCashiers() {
    return this.http.get<User[]>(`${this.BASE}/users/cashiers`);
  }
  createUser(payload: CreateUserRequest) {
    return this.http.post<User>(`${this.BASE}/users`, payload);
  }
  updateUser(userId: number, payload: UpdateUserRequest) {
    return this.http.put<User>(`${this.BASE}/users/${userId}`, payload);
  }
  deleteUser(userId: number) {
    return this.http.delete<{ message: string; user: User }>(`${this.BASE}/users/${userId}`);
  }

  // Reports & Analytics
  getDashboardStats() {
    return this.http.get<DashboardStats>(`${this.BASE}/reports/dashboard`);
  }
  getSalesReport(from: string, to: string) {
    return this.http.get<SalesReport>(`${this.BASE}/reports/sales`, {
      params: { from, to }
    });
  }
  getCashierPerformance(from: string, to: string) {
    return this.http.get<CashierPerformance[]>(`${this.BASE}/reports/cashier-performance`, {
      params: { from, to }
    });
  }
  exportSalesCSV(from: string, to: string) {
    return this.http.get(`${this.BASE}/reports/export-csv`, {
      params: { from, to },
      responseType: 'blob'
    });
  }
  getTopProducts(limit: number = 10) {
    return this.http.get<any[]>(`${this.BASE}/reports/top-products`, {
      params: { limit: limit.toString() }
    });
  }

  // Settings
  getSettings() {
    return this.http.get<Settings>(`${this.BASE}/settings`);
  }
  updateSettings(settings: UpdateSettingsRequest) {
    return this.http.put<Settings>(`${this.BASE}/settings`, settings);
  }

  // Locations (New REST API)
  listLocations() {
    return this.http.get<Location[]>(`${this.BASE}/locations`);
  }
  getLocation(id: number) {
    return this.http.get<Location>(`${this.BASE}/locations/${id}`);
  }
  createLocation(name: string) {
    return this.http.post<Location>(`${this.BASE}/locations`, { name });
  }
  updateLocation(id: number, name: string) {
    return this.http.put<Location>(`${this.BASE}/locations/${id}`, { name });
  }
  deleteLocation(id: number) {
    return this.http.delete<{ message: string; location: Location }>(`${this.BASE}/locations/${id}`);
  }
}
