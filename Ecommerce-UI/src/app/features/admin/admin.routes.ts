import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layouts/admin-layout/admin-layout.component';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/enums/user-role.enum';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.Admin] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'vendors',
        loadComponent: () => import('./vendors/vendors.component').then(m => m.AdminVendorsComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./customers/customers.component').then(m => m.AdminCustomersComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./categories/categories.component').then(m => m.AdminCategoriesComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./products/products.component').then(m => m.AdminProductsComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./orders/orders.component').then(m => m.AdminOrdersComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./orders/order-detail/order-detail.component').then(m => m.AdminOrderDetailComponent)
      },
      {
        path: 'coupons',
        loadComponent: () => import('./coupons/coupons.component').then(m => m.AdminCouponsComponent)
      },
      {
        path: 'refunds',
        loadComponent: () => import('./refunds/refunds.component').then(m => m.AdminRefundsComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/reports.component').then(m => m.AdminReportsComponent)
      },
      {
        path: 'reviews',
        loadComponent: () => import('./reviews/reviews.component').then(m => m.AdminReviewsComponent)
      },
      {
        path: 'change-password',
        loadComponent: () => import('../auth/change-password/change-password.component').then(m => m.ChangePasswordComponent)
      }
    ]
  }
];
