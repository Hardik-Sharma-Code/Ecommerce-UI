import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { UserRole } from '../../../core/enums/user-role.enum';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  @Input() role!: UserRole;

  auth = inject(AuthService);
  cartService = inject(CartService);
  readonly UserRole = UserRole;

  get userInitials(): string {
    const user = this.auth.currentUserValue;
    const first = user?.firstName?.[0] ?? '';
    const last = user?.lastName?.[0] ?? '';
    return (first + last).toUpperCase();
  }

  get userName(): string {
    const user = this.auth.currentUserValue;
    return user ? `${user.firstName} ${user.lastName}`.trim() : '';
  }

  get userEmail(): string {
    return this.auth.currentUserValue?.email ?? '';
  }

  get changePasswordRoute(): string {
    switch (this.role) {
      case UserRole.Admin: return '/admin/change-password';
      case UserRole.Vendor: return '/vendor/change-password';
      default: return '/customer/change-password';
    }
  }

  logout(): void {
    this.auth.logout();
  }
}
