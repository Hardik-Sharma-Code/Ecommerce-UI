import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserRole } from '../../../core/enums/user-role.enum';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  @Input() set role(value: UserRole) {
    this._role = value;
    this.navItems = this.getNavItems(value);
  }

  _role!: UserRole;
  navItems: NavItem[] = [];

  private getNavItems(role: UserRole): NavItem[] {
    switch (role) {
      case UserRole.Admin:
        return [
          { label: 'Dashboard', icon: 'bi-speedometer2', route: '/admin/dashboard' },
          { label: 'Users', icon: 'bi-people', route: '/admin/users' },
          { label: 'Customers', icon: 'bi-person-check', route: '/admin/customers' },
          { label: 'Vendors', icon: 'bi-shop', route: '/admin/vendors' },
          { label: 'Categories', icon: 'bi-tags', route: '/admin/categories' },
          { label: 'Products', icon: 'bi-box-seam', route: '/admin/products' },
          { label: 'Orders', icon: 'bi-receipt', route: '/admin/orders' },
          { label: 'Coupons', icon: 'bi-tag', route: '/admin/coupons' },
          { label: 'Refunds', icon: 'bi-arrow-return-left', route: '/admin/refunds' },
          { label: 'Reports', icon: 'bi-bar-chart-line', route: '/admin/reports' },
          { label: 'Reviews', icon: 'bi-star', route: '/admin/reviews' },
        ];
      case UserRole.Vendor:
        return [
          { label: 'Dashboard', icon: 'bi-speedometer2', route: '/vendor/dashboard' },
          { label: 'Profile', icon: 'bi-person', route: '/vendor/profile' },
          { label: 'KYC', icon: 'bi-shield-check', route: '/vendor/kyc' },
          { label: 'Products', icon: 'bi-box-seam', route: '/vendor/products' },
          { label: 'Orders', icon: 'bi-cart', route: '/vendor/orders' },
          { label: 'Reports', icon: 'bi-bar-chart-line', route: '/vendor/reports' },
        ];
      case UserRole.Customer:
        return [
          { label: 'Dashboard', icon: 'bi-speedometer2', route: '/customer/dashboard' },
          { label: 'Browse', icon: 'bi-search', route: '/customer/browse' },
          { label: 'Profile', icon: 'bi-person', route: '/customer/profile' },
          { label: 'Addresses', icon: 'bi-geo-alt', route: '/customer/addresses' },
          { label: 'Cart', icon: 'bi-cart3', route: '/customer/cart' },
          { label: 'Orders', icon: 'bi-bag', route: '/customer/orders' },
          { label: 'Refunds', icon: 'bi-arrow-return-left', route: '/customer/refunds' },
          { label: 'Reviews', icon: 'bi-star', route: '/customer/reviews' },
          { label: 'Wishlist', icon: 'bi-heart', route: '/customer/wishlist' },
        ];
      default:
        return [];
    }
  }

  get roleLabel(): string {
    switch (this._role) {
      case UserRole.Admin: return 'Admin Portal';
      case UserRole.Vendor: return 'Vendor Portal';
      case UserRole.Customer: return 'My Account';
      default: return 'ShopEase';
    }
  }
}
