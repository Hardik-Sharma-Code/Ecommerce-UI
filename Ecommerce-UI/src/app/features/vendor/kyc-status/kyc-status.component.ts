import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, NgStyle, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VendorService } from '../../../core/services/vendor.service';
import { KycStatusDto } from '../../../core/models/user.model';
import { KycStatus } from '../../../core/enums/kyc-status.enum';

@Component({
  selector: 'app-kyc-status',
  standalone: true,
  imports: [DatePipe, NgStyle, TitleCasePipe, RouterLink],
  templateUrl: './kyc-status.component.html'
})
export class KycStatusComponent implements OnInit {
  private vendorService = inject(VendorService);

  kycStatus: KycStatusDto | null = null;
  loading = true;
  KycStatus = KycStatus;

  ngOnInit(): void {
    this.vendorService.getKycStatus().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) this.kycStatus = res.data;
      },
      error: () => {
        this.loading = false;
        this.kycStatus = { status: KycStatus.NotSubmitted };
      }
    });
  }

  get statusBannerStyle(): Record<string, string> {
    const s = this.kycStatus?.status;
    if (s === KycStatus.Approved) return { background: '#dcfce7' };
    if (s === KycStatus.Rejected) return { background: '#fee2e2' };
    return { background: '#fef3c7' };
  }

  get statusIcon(): string {
    const s = this.kycStatus?.status;
    if (s === KycStatus.Approved) return 'bi-check-circle-fill text-success';
    if (s === KycStatus.Rejected) return 'bi-x-circle-fill text-danger';
    return 'bi-clock-history text-warning';
  }
}
