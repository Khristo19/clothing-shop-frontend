import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Item } from '../core/models';

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  size?: string | null;
  image_url?: string;
  image?: File;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/items`;

  list(lowStock?: boolean) {
    if (lowStock) {
      return this.http.get<Item[]>(this.BASE, { params: { lowStock: 'true' } });
    }
    return this.http.get<Item[]>(this.BASE);
  }

  add(payload: ProductFormData) {
    // If we have a file, use FormData; otherwise use JSON
    if (payload.image) {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('price', payload.price.toString());
      formData.append('quantity', payload.quantity.toString());
      if (payload.description) {
        formData.append('description', payload.description);
      }
      if (payload.size) {
        formData.append('size', payload.size);
      }
      formData.append('image', payload.image);

      // IMPORTANT: Do NOT set Content-Type header!
      // The browser must set it automatically with the correct multipart boundary
      // The authInterceptor will add Authorization header, but NOT Content-Type
      return this.http.post<Item>(`${this.BASE}/add`, formData);
    } else {
      // Use JSON for URL-based images
      const jsonPayload: Omit<Item, 'id'> = {
        name: payload.name,
        price: payload.price,
        quantity: payload.quantity,
        size: payload.size || null,
        description: payload.description,
        image_url: payload.image_url
      };
      // Angular HttpClient automatically sets Content-Type: application/json for objects
      return this.http.post<Item>(`${this.BASE}/add`, jsonPayload);
    }
  }

  update(id: number, payload: ProductFormData) {
    // If we have a file, use FormData; otherwise use JSON
    if (payload.image) {
      const formData = new FormData();
      if (payload.name) formData.append('name', payload.name);
      if (payload.price !== undefined) formData.append('price', payload.price.toString());
      if (payload.quantity !== undefined) formData.append('quantity', payload.quantity.toString());
      if (payload.description) formData.append('description', payload.description);
      if (payload.size) formData.append('size', payload.size);
      formData.append('image', payload.image);

      // IMPORTANT: Do NOT set Content-Type header!
      // The browser must set it automatically with the correct multipart boundary
      // The authInterceptor will add Authorization header, but NOT Content-Type
      return this.http.put<Item>(`${this.BASE}/${id}`, formData);
    } else {
      // Use JSON for URL-based images or no image changes
      const jsonPayload: Partial<Omit<Item, 'id'>> = {
        name: payload.name,
        price: payload.price,
        quantity: payload.quantity,
        size: payload.size || null,
        description: payload.description,
        image_url: payload.image_url
      };
      // Angular HttpClient automatically sets Content-Type: application/json for objects
      return this.http.put<Item>(`${this.BASE}/${id}`, jsonPayload);
    }
  }

  delete(id: number) {
    return this.http.delete<{ message: string; item: Item }>(`${this.BASE}/${id}`);
  }
}
