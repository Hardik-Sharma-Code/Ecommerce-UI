import { Routes } from '@angular/router';
import { CustomerLayoutComponent } from '../../layouts/customer-layout/customer-layout.component';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/enums/user-role.enum';

export const customerRoutes: Routes = [
  {
    path: '',
    component: CustomerLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.Customer] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.CustomerDashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then(m => m.CustomerProfileComponent)
      },
      {
        path: 'edit-profile',
        loadComponent: () => import('./edit-profile/edit-profile.component').then(m => m.CustomerEditProfileComponent)
      },
      {
        path: 'browse',
        loadComponent: () => import('./browse/browse.component').then(m => m.CustomerBrowseComponent)
      },
      {
        path: 'addresses',
        loadComponent: () => import('./addresses/addresses.component').then(m => m.CustomerAddressesComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./cart/cart.component').then(m => m.CustomerCartComponent)
      },
      {
        path: 'checkout',
        loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent)
      },
      {
        path: 'payment/:orderId',
        loadComponent: () => import('./payment/payment.component').then(m => m.PaymentComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./orders/orders.component').then(m => m.CustomerOrdersComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
      },
      {
        path: 'refunds',
        loadComponent: () => import('./refunds/refunds.component').then(m => m.CustomerRefundsComponent)
      },
      {
        path: 'reviews',
        loadComponent: () => import('./reviews/reviews.component').then(m => m.CustomerReviewsComponent)
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./wishlist/wishlist.component').then(m => m.CustomerWishlistComponent)
      },
      {
        path: 'change-password',
        loadComponent: () => import('../auth/change-password/change-password.component').then(m => m.ChangePasswordComponent)
      }
    ]
  }
];
