import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe, NgClass } from '@angular/common';
import { RefundService } from '../../../core/services/refund.service';
import { RefundDto, RefundStatus } from '../../../core/models/refund.model';

@Component({
  selector: 'app-customer-refunds',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, NgClass],
  templateUrl: './refunds.component.html'
})
export class CustomerRefundsComponent implements OnInit {
  private refundService = inject(RefundService);

  refunds: RefundDto[] = [];
  loading = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.refundService.getMyRefunds().subscribe({
      next: (res) => {
        this.loading = false;
        this.refunds = res.success && res.data ? res.data : [];
      },
      error: () => { this.loading = false; }
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
}
