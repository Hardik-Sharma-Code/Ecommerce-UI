import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe, CurrencyPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { ShippingService } from '../../../../core/services/shipping.service';
import { ToastService } from '../../../../core/services/toast.service';
import { OrderDto, OrderStatus, UpdateOrderStatusDto } from '../../../../core/models/order.model';
import { ShipmentStatus, UpdateTrackingDto, UpdateShipmentStatusDto } from '../../../../core/models/shipping.model';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, NgClass, FormsModule],
  templateUrl: './order-detail.component.html'
})
export class AdminOrderDetailComponent implements OnInit {
  private orderService = inject(OrderService);
  private shippingService = inject(ShippingService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  order: OrderDto | null = null;
  loading = false;

  statusModal = { visible: false, newStatus: '' as string, notes: '' };

  trackingModal = {
    visible: false,
    carrier: '',
    trackingNumber: '',
    trackingUrl: '',
    estimatedDelivery: '',
    notes: ''
  };
  savingTracking = false;

  shipmentStatusModal = {
    visible: false,
    status: ShipmentStatus.InTransit,
    notes: ''
  };
  savingShipmentStatus = false;

  readonly ShipmentStatus = ShipmentStatus;
  readonly shipmentStatusOptions = [
    { value: ShipmentStatus.Pending, label: 'Pending' },
    { value: ShipmentStatus.Processing, label: 'Processing' },
    { value: ShipmentStatus.InTransit, label: 'In Transit' },
    { value: ShipmentStatus.OutForDelivery, label: 'Out for Delivery' },
    { value: ShipmentStatus.Delivered, label: 'Delivered' },
    { value: ShipmentStatus.Failed, label: 'Failed' },
  ];

  readonly statusOptions: { value: OrderStatus; label: string }[] = [
    { value: OrderStatus.Pending, label: 'Pending' },
    { value: OrderStatus.Confirmed, label: 'Confirmed' },
    { value: OrderStatus.Processing, label: 'Processing' },
    { value: OrderStatus.Shipped, label: 'Shipped' },
    { value: OrderStatus.Delivered, label: 'Delivered' },
    { value: OrderStatus.Cancelled, label: 'Cancelled' },
    { value: OrderStatus.Refunded, label: 'Refunded' },
  ];

  readonly orderStatusSteps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadOrder(id);
  }

  loadOrder(id: number): void {
    this.loading = true;
    this.orderService.getById(id).subscribe({
      next: (res) => { this.loading = false; this.order = res.success && res.data ? res.data : null; },
      error: () => { this.loading = false; }
    });
  }

  get isCancelled(): boolean {
    return this.order?.status === OrderStatus.Cancelled || this.order?.status === OrderStatus.Refunded;
  }

  get currentStep(): number {
    if (!this.order || this.isCancelled) return -1;
    return this.orderStatusSteps.indexOf(this.order.statusName);
  }

  openStatusModal(): void {
    this.statusModal = { visible: true, newStatus: String(this.order?.status ?? 0), notes: '' };
  }
  closeStatusModal(): void { this.statusModal = { visible: false, newStatus: '', notes: '' }; }

  saveStatus(): void {
    if (!this.order) return;
    const dto: UpdateOrderStatusDto = {
      status: Number(this.statusModal.newStatus) as OrderStatus,
      notes: this.statusModal.notes || undefined
    };
    this.orderService.updateStatus(this.order.id, dto).subscribe({
      next: (res) => {
        this.closeStatusModal();
        if (res.success) { this.toast.success('Status updated.', 'Updated'); this.loadOrder(this.order!.id); }
        else this.toast.error(res.message, 'Error');
      },
      error: () => { this.closeStatusModal(); }
    });
  }

  openTrackingModal(): void {
    const s = this.order?.shipment;
    this.trackingModal = {
      visible: true,
      carrier: s?.carrier ?? '',
      trackingNumber: s?.trackingNumber ?? '',
      trackingUrl: s?.trackingUrl ?? '',
      estimatedDelivery: s?.estimatedDelivery ? s.estimatedDelivery.substring(0, 10) : '',
      notes: s?.notes ?? ''
    };
  }
  closeTrackingModal(): void { this.trackingModal = { ...this.trackingModal, visible: false }; }

  saveTracking(): void {
    if (!this.order || !this.trackingModal.carrier.trim()) return;
    this.savingTracking = true;
    const dto: UpdateTrackingDto = {
      carrier: this.trackingModal.carrier.trim(),
      trackingNumber: this.trackingModal.trackingNumber || undefined,
      trackingUrl: this.trackingModal.trackingUrl || undefined,
      estimatedDelivery: this.trackingModal.estimatedDelivery || undefined,
      notes: this.trackingModal.notes || undefined
    };
    this.shippingService.updateTracking(this.order.id, dto).subscribe({
      next: (res) => {
        this.savingTracking = false;
        this.closeTrackingModal();
        if (res.success) { this.toast.success('Tracking updated.', 'Saved'); this.loadOrder(this.order!.id); }
        else this.toast.error(res.message, 'Error');
      },
      error: () => { this.savingTracking = false; }
    });
  }

  openShipmentStatusModal(): void {
    this.shipmentStatusModal = {
      visible: true,
      status: (this.order?.shipment?.status as ShipmentStatus) ?? ShipmentStatus.InTransit,
      notes: ''
    };
  }
  closeShipmentStatusModal(): void { this.shipmentStatusModal = { ...this.shipmentStatusModal, visible: false }; }

  saveShipmentStatus(): void {
    if (!this.order) return;
    this.savingShipmentStatus = true;
    const dto: UpdateShipmentStatusDto = {
      status: this.shipmentStatusModal.status,
      notes: this.shipmentStatusModal.notes || undefined
    };
    this.shippingService.updateStatus(this.order.id, dto).subscribe({
      next: (res) => {
        this.savingShipmentStatus = false;
        this.closeShipmentStatusModal();
        if (res.success) { this.toast.success('Shipment status updated.', 'Saved'); this.loadOrder(this.order!.id); }
        else this.toast.error(res.message, 'Error');
      },
      error: () => { this.savingShipmentStatus = false; }
    });
  }

  shipmentBadgeClass(statusName: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-secondary', Processing: 'bg-warning text-dark',
      InTransit: 'bg-primary', OutForDelivery: 'bg-info text-dark',
      Delivered: 'bg-success', Failed: 'bg-danger'
    };
    return map[statusName] ?? 'bg-secondary';
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
}
