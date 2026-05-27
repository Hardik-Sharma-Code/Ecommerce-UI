import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

interface AdminDashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  activeUsers: number;
  pendingKyc: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminDashboardStats | null = null;
  loading = false;
  today = new Date();

  ngOnInit(): void {
    this.stats = {
      totalUsers: 1248,
      totalVendors: 86,
      totalCustomers: 1142,
      activeUsers: 1180,
      pendingKyc: 14,
      totalRevenue: 284530.75,
      monthlyGrowth: 12.4
    };
  }
}
