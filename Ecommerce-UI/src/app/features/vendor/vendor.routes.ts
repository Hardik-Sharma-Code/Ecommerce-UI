import { Routes } from '@angular/router';
import { VendorLayoutComponent } from '../../layouts/vendor-layout/vendor-layout.component';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/enums/user-role.enum';

export const vendorRoutes: Routes = [
  {
    path: '',
    component: VendorLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.Vendor] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.VendorDashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then(m => m.VendorProfileComponent)
      },
      {
        path: 'edit-profile',
        loadComponent: () => import('./edit-profile/edit-profile.component').then(m => m.VendorEditProfileComponent)
      },
      {
        path: 'kyc',
        loadComponent: () => import('./kyc/kyc.component').then(m => m.KycComponent)
      },
      {
        path: 'kyc-status',
        loadComponent: () => import('./kyc-status/kyc-status.component').then(m => m.KycStatusComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./products/products.component').then(m => m.VendorProductsComponent)
      },
      {
        path: 'products/create',
        loadComponent: () => import('./products/create-product/create-product.component').then(m => m.CreateProductComponent)
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./products/edit-product/edit-product.component').then(m => m.EditProductComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/reports.component').then(m => m.VendorReportsComponent)
      },
      {
        path: 'change-password',
        loadComponent: () => import('../auth/change-password/change-password.component').then(m => m.ChangePasswordComponent)
      }
    ]
  }
];
