// Type definitions for the application

export interface Item {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
  image_url?: string | null;
}

export interface Offer {
  id: number;
  from_shop: string;
  items: OfferItem[];
  requested_discount: DiscountRequest;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

export interface OfferItem {
  id: number;
  qty: number;
  name: string;
  price: number;
}

export interface DiscountRequest {
  type: 'percentage' | 'amount';
  value: number;
  notes?: string;
  cart_total: number;
}

export interface Sale {
  id: number;
  items: SaleItem[];
  total: number;
  payment_method: 'cash' | 'card-TBC' | 'card-BOG';
  created_at?: string;
}

export interface SaleItem {
  id: number;
  qty: number;
  price: number;
  name: string;
}

export interface CreateOfferRequest {
  from_shop: string;
  items: OfferItem[];
  requested_discount: DiscountRequest;
}

export interface UpdateOfferStatusRequest {
  offer_id: number;
  status: 'approved' | 'rejected';
}

export interface SubmitCartRequest {
  items: SaleItem[];
  total: number;
  payment_method: 'cash' | 'card-TBC' | 'card-BOG';
}
