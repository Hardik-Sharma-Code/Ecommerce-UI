import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, CurrencyPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RefundService } from '../../../core/services/refund.service';
import { ToastService } from '../../../core/services/toast.service';
import { RefundDto, RefundStatus, ProcessRefundDto } from '../../../core/models/refund.model';
import { PaginatedResponse } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-admin-refunds',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, NgClass, FormsModule],
  templateUrl: './refunds.component.html'
})
export class AdminRefundsComponent implements OnInit {
  private refundService = inject(RefundService);
  private toast = inject(ToastService);

  readonly RefundStatus = RefundStatus;

  refunds: RefundDto[] = [];
  total = 0;
  page = 1;
  pageSize = 20;
  statusFilter: RefundStatus | '' = '';
  loading = false;

  processModal = { visible: false, refund: null as RefundDto | null, status: RefundStatus.Approved, notes: '' };
  processing = false;

  readonly processableStatuses = [
    { value: RefundStatus.Approved, label: 'Approved' },
    { value: RefundStatus.Processing, label: 'Processing' },
    { value: RefundStatus.Completed, label: 'Completed' },
    { value: RefundStatus.Rejected, label: 'Rejected' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    const params = {
      page: this.page,
      pageSize: this.pageSize,
      ...(this.statusFilter !== '' ? { status: this.statusFilter as RefundStatus } : {})
    };
    this.refundService.getAllRefunds(params).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.refunds = res.data.items;
          this.total = res.data.total;
        }
      },
      error: () => { this.loading = false; }
    });
  }

  get totalPages(): number { return Math.ceil(this.total / this.pageSize); }

  goToPage(p: number): void {
    this.page = p;
    this.load();
  }

  applyFilter(): void {
    this.page = 1;
    this.load();
  }

  openProcessModal(refund: RefundDto): void {
    this.processModal = { visible: true, refund, status: RefundStatus.Approved, notes: '' };
  }

  closeProcessModal(): void {
    this.processModal = { visible: false, refund: null, status: RefundStatus.Approved, notes: '' };
  }

  confirmProcess(): void {
    if (!this.processModal.refund) return;
    this.processing = true;
    const dto: ProcessRefundDto = {
      status: this.processModal.status,
      notes: this.processModal.notes || undefined
    };
    this.refundService.processRefund(this.processModal.refund.id, dto).subscribe({
      next: (res) => {
        this.processing = false;
        this.closeProcessModal();
        if (res.success) {
          this.toast.success('Refund updated.', 'Updated');
          this.load();
        } else {
          this.toast.error(res.message, 'Error');
        }
      },
      error: () => { this.processing = false; }
    });
  }

  badgeClass(statusName: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-warning text-dark',
      Approved: 'bg-info text-dark',
      Processing: 'bg-primary',
      Completed: 'bg-success',
      Rejected: 'bg-danger'
    };
    return map[statusName] ?? 'bg-secondary';
  }

  canProcess(status: RefundStatus): boolean {
    return status === RefundStatus.Pending || status === RefundStatus.Approved || status === RefundStatus.Processing;
  }
}
