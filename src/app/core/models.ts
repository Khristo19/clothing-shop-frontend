// Type definitions for the application

export interface Item {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
  size?: string | null;
  image_url?: string | null;
  location_id?: number | null;
  location_name?: string | null;
}

export interface Offer {
  id: number;
  from_shop: string;
  items: OfferItem[];
  requested_discount: DiscountRequest;
  payment_method?: 'cash' | 'BOG' | 'TBC';
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface OfferItem {
  id: number;
  qty: number;
  name: string;
  price: number;
}

export interface DiscountRequest {
  type: 'percentage' | 'manual';
  value: number;
  notes?: string;
  cart_total: number;
}

export interface Sale {
  id: number;
  items: SaleItem[];
  total: number;
  payment_method: 'cash' | 'TBC' | 'BOG';
  payment_bank?: string | null;
  created_at?: string;
  location_id?: number;
  location_name?: string | null;
  cashier_id?: number;
  cashier_email?: string;
  cashier_name?: string | null;
  cashier_surname?: string | null;
  served_by_cashier_id?: number;
  served_by_email?: string;
  served_by_name?: string | null;
  served_by_surname?: string | null;
  partner_cashier_id?: number | null;
  partner_email?: string | null;
  partner_name?: string | null;
  partner_surname?: string | null;
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
  payment_method?: 'cash' | 'BOG' | 'TBC';
}

export interface UpdateOfferStatusRequest {
  offer_id: number;
  status: 'approved' | 'rejected';
}

export interface SubmitCartRequest {
  items: SaleItem[];
  total: number;
  payment_method: 'cash' | 'TBC' | 'BOG';
  payment_bank?: string;
  location_id?: number;
  served_by_cashier_id?: number;
  partner_cashier_id?: number | null;
}

// User Management
export interface User {
  id: number;
  email: string;
  name?: string | null;
  surname?: string | null;
  role: 'admin' | 'cashier';
  created_at?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role: 'admin' | 'cashier';
}

export interface UpdateUserRequest {
  email?: string;
  role?: 'admin' | 'cashier';
}

// Dashboard Stats
export interface DashboardStats {
  today: {
    transactions: number;
    revenue: number;
  };
  week: {
    transactions: number;
    revenue: number;
  };
  month: {
    transactions: number;
    revenue: number;
  };
  inventory: {
    totalValue: number;
    lowStock: Item[];
    outOfStock: Item[];
  };
  paymentMethods: PaymentMethodBreakdown[];
  topProducts: TopProduct[];
}

export interface PaymentMethodBreakdown {
  payment_method: string;
  payment_bank: string | null;
  count: number;
  total: number;
}

export interface TopProduct {
  product_name: string;
  product_id: string;
  total_sold: number;
  revenue: number;
}

// Reports
export interface SalesReport {
  summary: {
    total_transactions: string;
    total_revenue: string;
    avg_order_value: string;
  };
  dailySales: DailySales[];
  paymentBreakdown: PaymentMethodBreakdown[];
}

export interface DailySales {
  date: string;
  transaction_count: string;
  revenue: string;
}

export interface CashierPerformance {
  id: number;
  email: string;
  role: string;
  name?: string | null;
  surname?: string | null;
  total_transactions: string;
  total_revenue: string;
  avg_transaction_value: string;
  first_sale: string | null;
  last_sale: string | null;
}

// Location
export interface Location {
  id: number;
  name: string;
  created_at?: string;
}

// Settings
export interface Settings {
  id: number;
  shop_name: string;
  tax_rate: number;
  currency: string;
  receipt_header: string;
  receipt_footer: string;
  low_stock_threshold: number;
  locations: Location[];
  updated_at: string;
}

export interface UpdateSettingsRequest {
  shop_name?: string;
  tax_rate?: number;
  currency?: string;
  receipt_header?: string;
  receipt_footer?: string;
  low_stock_threshold?: number;
  locations?: Location[];
}
