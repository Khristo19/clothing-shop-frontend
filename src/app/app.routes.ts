// src/app/app.routes.ts
import { Routes } from '@angular/router';
import {LoginComponent} from './auth/login';
import { authGuard, roleGuard, multiRoleGuard } from './core/auth';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'admin', canActivate: [authGuard, roleGuard('admin')], loadComponent: () => import('./dashboard/admin').then(m => m.AdminComponent), children: [
      { path: 'products', loadComponent: () => import('./products/list').then(m => m.ProductsListComponent) },
      { path: 'offers', loadComponent: () => import('./offers/list').then(m => m.OffersListComponent) },
      { path: 'orders', loadComponent: () => import('./orders/list').then(m => m.OrdersListComponent) },
      { path: 'users', loadComponent: () => import('./users/list').then(m => m.UsersListComponent) },
      { path: 'cashier-performance', loadComponent: () => import('./reports/cashier-performance').then(m => m.CashierPerformanceComponent) },
      { path: 'settings', loadComponent: () => import('./settings/settings').then(m => m.SettingsComponent) },
      { path: '', redirectTo: 'products', pathMatch: 'full' },
    ] },
  { path: 'cashier', canActivate: [authGuard, multiRoleGuard(['admin', 'cashier'])], loadComponent: () => import('./pos/cashier-layout').then(m => m.CashierLayoutComponent), children: [
      { path: 'pos', loadComponent: () => import('./pos/cashier').then(m => m.CashierComponent) },
      { path: 'offers', loadComponent: () => import('./pos/offers-status').then(m => m.OffersStatusComponent) },
      { path: '', redirectTo: 'pos', pathMatch: 'full' },
    ] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
