import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { OrderSummaryDto, OrderStatus, CancelOrderDto } from '../../../core/models/order.model';
import { ITEMS_PER_PAGE } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, NgClass, FormsModule],
  templateUrl: './orders.component.html'
})
export class CustomerOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private toast = inject(ToastService);

  orders: OrderSummaryDto[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  total = 0;
  pageSize = ITEMS_PER_PAGE;

  cancelModal = { visible: false, orderId: 0, orderNumber: '', reason: '' };

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getMyOrders({ page: this.currentPage, pageSize: this.pageSize }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.orders = res.data.items;
          this.total = res.data.total;
          this.totalPages = res.data.totalPages;
        }
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load orders. Please try again.', 'Error');
        this.orders = [];
        this.total = 0; this.totalPages = 1;
      }
    });
  }

  onPageChange(page: number): void { this.currentPage = page; this.loadOrders(); }

  canCancel(order: OrderSummaryDto): boolean {
    return order.status === OrderStatus.Pending || order.status === OrderStatus.Confirmed;
  }

  openCancelModal(order: OrderSummaryDto): void {
    this.cancelModal = { visible: true, orderId: order.id, orderNumber: order.orderNumber, reason: '' };
  }

  closeCancelModal(): void {
    this.cancelModal = { visible: false, orderId: 0, orderNumber: '', reason: '' };
  }

  confirmCancel(): void {
    const dto: CancelOrderDto = { reason: this.cancelModal.reason || undefined };
    this.orderService.cancelOrder(this.cancelModal.orderId, dto).subscribe({
      next: (res) => {
        this.closeCancelModal();
        if (res.success) {
          this.toast.success(`Order ${this.cancelModal.orderNumber} cancelled.`, 'Cancelled');
          this.loadOrders();
        } else {
          this.toast.error(res.message, 'Error');
        }
      },
      error: () => {
        this.closeCancelModal();
        this.toast.error('Failed to cancel order. Please try again.', 'Error');
      }
    });
  }

  statusBadgeClass(statusName: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-warning text-dark',
      Confirmed: 'bg-info text-dark',
      Processing: 'bg-primary',
      Shipped: 'bg-indigo text-white',
      Delivered: 'bg-success',
      Cancelled: 'bg-secondary',
      Refunded: 'bg-danger'
    };
    return map[statusName] ?? 'bg-secondary';
  }

  paymentBadgeClass(statusName: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-warning text-dark',
      Paid: 'bg-success',
      Failed: 'bg-danger',
      Refunded: 'bg-secondary'
    };
    return map[statusName] ?? 'bg-secondary';
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  private getMockOrders(): OrderSummaryDto[] {
    return [
      { id: 1, orderNumber: 'ORD-2025-001', status: OrderStatus.Delivered, statusName: 'Delivered', paymentStatus: 1, paymentStatusName: 'Paid', totalAmount: 1127.97, itemCount: 3, placedAt: new Date(Date.now() - 7 * 864e5).toISOString() },
      { id: 2, orderNumber: 'ORD-2025-002', status: OrderStatus.Shipped, statusName: 'Shipped', paymentStatus: 1, paymentStatusName: 'Paid', totalAmount: 49.99, itemCount: 1, placedAt: new Date(Date.now() - 2 * 864e5).toISOString() },
      { id: 3, orderNumber: 'ORD-2025-003', status: OrderStatus.Pending, statusName: 'Pending', paymentStatus: 0, paymentStatusName: 'Pending', totalAmount: 249.00, itemCount: 2, placedAt: new Date(Date.now() - 1 * 864e5).toISOString() },
    ];
  }
}
