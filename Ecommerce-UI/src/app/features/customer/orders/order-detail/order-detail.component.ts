import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe, CurrencyPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { RefundService } from '../../../../core/services/refund.service';
import { ToastService } from '../../../../core/services/toast.service';
import { OrderDto, OrderStatus, PaymentStatus, CancelOrderDto, OrderItemDto } from '../../../../core/models/order.model';
import { RefundStatus, RequestRefundDto } from '../../../../core/models/refund.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, NgClass, FormsModule],
  templateUrl: './order-detail.component.html'
})
export class OrderDetailComponent implements OnInit {
  private orderService = inject(OrderService);
  private refundService = inject(RefundService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  order: OrderDto | null = null;
  loading = false;
  cancelModal = { visible: false, reason: '' };
  refundModal = { visible: false, amount: 0, reason: '' };
  submittingRefund = false;

  readonly orderStatusSteps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadOrder(id);
  }

  loadOrder(id: number): void {
    this.loading = true;
    this.orderService.getById(id).subscribe({
      next: (res) => {
        this.loading = false;
        this.order = res.success && res.data ? res.data : null;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load order details. Please try again.', 'Error');
      }
    });
  }

  get canCancel(): boolean {
    return this.order?.status === OrderStatus.Pending || this.order?.status === OrderStatus.Confirmed;
  }

  get isCancelled(): boolean {
    return this.order?.status === OrderStatus.Cancelled || this.order?.status === OrderStatus.Refunded;
  }

  get canRequestRefund(): boolean {
    if (!this.order) return false;
    const hasActiveRefund = this.order.refunds.some(
      r => r.status === RefundStatus.Pending || r.status === RefundStatus.Approved || r.status === RefundStatus.Processing
    );
    return this.order.status === OrderStatus.Delivered &&
      this.order.paymentStatus === PaymentStatus.Paid &&
      !hasActiveRefund;
  }

  get currentStep(): number {
    if (!this.order || this.isCancelled) return -1;
    return this.orderStatusSteps.indexOf(this.order.statusName);
  }

  openCancelModal(): void { this.cancelModal = { visible: true, reason: '' }; }
  closeCancelModal(): void { this.cancelModal = { visible: false, reason: '' }; }

  openRefundModal(): void { this.refundModal = { visible: true, amount: this.order?.totalAmount ?? 0, reason: '' }; }
  closeRefundModal(): void { this.refundModal = { visible: false, amount: 0, reason: '' }; }

  submitRefund(): void {
    if (!this.order || !this.refundModal.reason.trim()) return;
    if (this.refundModal.amount <= 0 || this.refundModal.amount > this.order.totalAmount) {
      this.toast.error(
        `Refund amount must be between 0.01 and ${this.order.totalAmount}.`,
        'Invalid Amount'
      );
      return;
    }
    this.submittingRefund = true;
    const dto: RequestRefundDto = {
      orderId: this.order.id,
      amount: this.refundModal.amount,
      reason: this.refundModal.reason
    };
    this.refundService.requestRefund(dto).subscribe({
      next: (res) => {
        this.submittingRefund = false;
        this.closeRefundModal();
        if (res.success) {
          this.toast.success('Refund request submitted.', 'Submitted');
          this.loadOrder(this.order!.id);
        } else {
          this.toast.error(res.message, 'Error');
        }
      },
      error: () => {
        this.submittingRefund = false;
        this.toast.error('Failed to submit refund request. Please try again.', 'Error');
      }
    });
  }

  confirmCancel(): void {
    if (!this.order) return;
    const dto: CancelOrderDto = { reason: this.cancelModal.reason || undefined };
    this.orderService.cancelOrder(this.order.id, dto).subscribe({
      next: (res) => {
        this.closeCancelModal();
        if (res.success) {
          this.toast.success('Order cancelled.', 'Cancelled');
          this.loadOrder(this.order!.id);
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

  refundBadgeClass(statusName: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-warning text-dark', Approved: 'bg-info text-dark',
      Processing: 'bg-primary', Completed: 'bg-success', Rejected: 'bg-danger'
    };
    return map[statusName] ?? 'bg-secondary';
  }

  statusBadgeClass(statusName: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-warning text-dark', Confirmed: 'bg-info text-dark',
      Processing: 'bg-primary', Shipped: 'bg-indigo text-white',
      Delivered: 'bg-success', Cancelled: 'bg-secondary', Refunded: 'bg-danger'
    };
    return map[statusName] ?? 'bg-secondary';
  }

  paymentBadgeClass(statusName: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-warning text-dark', Paid: 'bg-success', Failed: 'bg-danger', Refunded: 'bg-secondary'
    };
    return map[statusName] ?? 'bg-secondary';
  }

  get shippingAddress(): string {
    if (!this.order) return '';
    const o = this.order;
    const parts = [`${o.shippingFirstName} ${o.shippingLastName}`, o.shippingAddressLine1];
    if (o.shippingAddressLine2) parts.push(o.shippingAddressLine2);
    parts.push(`${o.shippingCity}, ${o.shippingState} ${o.shippingPostalCode}`);
    parts.push(o.shippingCountry);
    return parts.join('\n');
  }
}
