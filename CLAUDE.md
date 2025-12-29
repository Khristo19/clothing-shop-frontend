# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 20 clothing shop frontend application that supports two user roles: Admin and Cashier. The app uses standalone components, signals for state management, and connects to a backend API at `https://clothing-shop-backend.vercel.app/api`.

## Development Commands

```bash
# Start development server (default: http://localhost:4200)
npm start
# or
ng serve

# Build for production
npm run build
# or
ng build

# Build and watch for changes (development mode)
npm run watch

# Run tests with Karma
npm test
# or
ng test

# Generate new components
ng generate component component-name
```

## Architecture & Structure

### Routing & Role-Based Access

The application uses route guards (`authGuard`, `roleGuard`) to enforce role-based access control (src/app/app.routes.ts:1).

- `/login` - Public login page
- `/admin/*` - Admin-only routes (products, offers, orders, settings)
- `/cashier/*` - Cashier-only routes (pos, offers)

Routes are lazy-loaded using `loadComponent()` for better performance.

### Authentication System

**Key files**: `src/app/core/auth.ts`, `src/app/core/api.ts`

- **AuthService** uses Angular signals for reactive state management
- JWT tokens stored in localStorage and decoded client-side for role extraction
- **authInterceptor** automatically adds `Authorization: Bearer <token>` headers to all HTTP requests
- Automatic redirect to `/login` on 401 responses
- Token validity checked via `authGuard` and role enforcement via `roleGuard(role)`

### API Service Layer

**Key file**: `src/app/core/api.ts`

Centralized `ApiService` handles all backend communication:
- Items: `listItems()`, `addItem()`
- Offers: `listOffers()`, `createOffer()`, `updateOfferStatus()`
- Sales: `submitCart()`, `salesHistory()`
- Users: `listUsers()`, `createUser()`, `updateUser()`, `deleteUser()`
- Reports: `getDashboardStats()`, `getSalesReport()`, `getCashierPerformance()`, `exportSalesCSV()`

### Type Definitions

**Key file**: `src/app/core/models.ts`

All API models and request/response types are defined here:
- Core entities: `Item`, `Offer`, `Sale`, `User`
- Request types: `CreateOfferRequest`, `SubmitCartRequest`, `CreateUserRequest`, etc.
- Analytics: `DashboardStats`, `SalesReport`, `CashierPerformance`

### Feature Modules

The app is organized by feature areas:

- **auth/** - Login component
- **dashboard/** - Admin dashboard and home
- **products/** - Product list and management
- **offers/** - Offer list and management
- **orders/** - Order history
- **pos/** - Point-of-sale cashier interface (`cashier.ts`, `cashier-layout.ts`, `offers-status.ts`)
- **settings/** - Application settings
- **users/** - User management
- **reports/** - Sales reports and analytics

Each feature typically has its own service file (e.g., `products.service.ts`, `orders.service.ts`) that wraps or extends the centralized `ApiService`.

### Styling

- Uses SCSS for styling (configured in angular.json:10)
- Global styles in `src/styles.scss`
- Component-specific styles use `.scss` files
- Prettier configured with Angular HTML parser (package.json:16)

## Environment Configuration

**Files**: `src/environments/environment.development.ts`, `src/environments/environment.ts`

- Development API URL: `https://clothing-shop-backend.vercel.app/api`
- Production build replaces `environment.development.ts` with `environment.ts` (configured in angular.json:51-56)
- Access via `import { environment } from '../../environments/environment.development'`

## TypeScript Configuration

Strict mode enabled with:
- `strict: true`
- `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- Angular strict templates enabled
- Experimental decorators enabled for Angular features

## Key Implementation Patterns

1. **Standalone Components**: All components use Angular standalone API (no NgModule)
2. **Signals**: Use Angular signals for reactive state (see AuthService)
3. **HttpClient Injection**: Use `private readonly http = inject(HttpClient)` pattern
4. **Functional Guards**: Route guards are implemented as `CanActivateFn` functions
5. **HTTP Interceptors**: `authInterceptor` as a functional interceptor (not class-based)

## Important Notes

- Application providers configured in `src/app/app.config.ts` using `provideRouter`, `provideHttpClient`, `provideZoneChangeDetection`
- Bundle size limits: initial max 1MB, component styles max 8kB (angular.json:38-48)
- Default configuration is `production` for builds
