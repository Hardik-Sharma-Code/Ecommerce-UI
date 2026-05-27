import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { KycStatus } from '../../../core/enums/kyc-status.enum';

interface VendorDashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  kycStatus: string;
  recentOrders: { id: number; orderNumber: string; customerName: string; status: string; total: number; createdAt: string }[];
}

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, TitleCasePipe, RouterLink],
  templateUrl: './dashboard.component.html'
})
export class VendorDashboardComponent implements OnInit {
  private auth = inject(AuthService);

  stats: VendorDashboardStats | null = null;
  loading = false;

  get userName(): string {
    const user = this.auth.currentUserValue;
    return user ? `${user.firstName} ${user.lastName}`.trim() : 'Vendor';
  }

  ngOnInit(): void {
    this.stats = {
      totalProducts: 45, activeProducts: 38, totalOrders: 128, pendingOrders: 12,
      totalRevenue: 24580.50, monthlyRevenue: 5820.00, kycStatus: KycStatus.Approved,
      recentOrders: [
        { id: 1, orderNumber: 'ORD-001', customerName: 'Alice Smith', status: 'Processing', total: 299.99, createdAt: new Date().toISOString() },
        { id: 2, orderNumber: 'ORD-002', customerName: 'Bob Jones', status: 'Delivered', total: 149.50, createdAt: new Date().toISOString() },
        { id: 3, orderNumber: 'ORD-003', customerName: 'Carol White', status: 'Shipped', total: 89.00, createdAt: new Date().toISOString() }
      ]
    };
  }

  getKycBadgeClass(): string {
    const map: Record<string, string> = {
      [KycStatus.Approved]: 'badge bg-success',
      [KycStatus.Pending]: 'badge bg-warning text-dark',
      [KycStatus.Rejected]: 'badge bg-danger',
      [KycStatus.Submitted]: 'badge bg-info',
      [KycStatus.NotSubmitted]: 'badge bg-secondary'
    };
    return map[this.stats?.kycStatus ?? ''] ?? 'badge bg-secondary';
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = { 'Delivered': 'bg-success', 'Processing': 'bg-warning text-dark', 'Shipped': 'bg-info', 'Cancelled': 'bg-danger' };
    return map[status] ?? 'bg-secondary';
  }
}
