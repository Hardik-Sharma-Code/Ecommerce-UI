import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface CustomerDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalWishlist: number;
  totalSpent: number;
  recentOrders: { id: number; orderNumber: string; status: string; total: number; createdAt: string; itemCount: number }[];
}

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './dashboard.component.html'
})
export class CustomerDashboardComponent implements OnInit {
  private auth = inject(AuthService);

  stats: CustomerDashboardStats | null = null;
  loading = false;

  get userName(): string {
    const user = this.auth.currentUserValue;
    return user ? `${user.firstName} ${user.lastName}`.trim() : 'Customer';
  }

  ngOnInit(): void {
    this.stats = {
      totalOrders: 24, pendingOrders: 3, completedOrders: 20, totalWishlist: 12, totalSpent: 4850.75,
      recentOrders: [
        { id: 1, orderNumber: 'ORD-001', status: 'Delivered', total: 299.99, createdAt: new Date().toISOString(), itemCount: 3 },
        { id: 2, orderNumber: 'ORD-002', status: 'Processing', total: 149.50, createdAt: new Date().toISOString(), itemCount: 2 },
        { id: 3, orderNumber: 'ORD-003', status: 'Shipped', total: 89.00, createdAt: new Date().toISOString(), itemCount: 1 }
      ]
    };
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = { 'Delivered': 'bg-success', 'Processing': 'bg-warning text-dark', 'Shipped': 'bg-info', 'Cancelled': 'bg-danger', 'Pending': 'bg-secondary' };
    return map[status] ?? 'bg-secondary';
  }
}
