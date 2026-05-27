import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { VendorService } from '../../../core/services/vendor.service';
import { VendorProfileDto } from '../../../core/models/user.model';
import { KycStatus } from '../../../core/enums/kyc-status.enum';

@Component({
  selector: 'app-vendor-profile',
  standalone: true,
  imports: [RouterLink, TitleCasePipe],
  templateUrl: './profile.component.html'
})
export class VendorProfileComponent implements OnInit {
  private vendorService = inject(VendorService);

  profile: VendorProfileDto | null = null;
  loading = true;
  KycStatus = KycStatus;

  get initials(): string {
    const first = this.profile?.firstName?.[0] ?? '';
    const last = this.profile?.lastName?.[0] ?? '';
    return (first + last).toUpperCase();
  }

  get fullName(): string {
    return `${this.profile?.firstName ?? ''} ${this.profile?.lastName ?? ''}`.trim();
  }

  get kycBadgeClass(): string {
    const map: Record<string, string> = {
      [KycStatus.Approved]: 'approved',
      [KycStatus.Pending]: 'pending',
      [KycStatus.Rejected]: 'rejected',
      [KycStatus.Submitted]: 'submitted',
    };
    return map[this.profile?.kycStatus ?? ''] ?? 'pending';
  }

  ngOnInit(): void {
    this.vendorService.getProfile().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) this.profile = res.data;
      },
      error: () => {
        this.loading = false;
        this.profile = {
          userId: '2', firstName: 'Tech', lastName: 'Supplies',
          email: 'vendor@techsupplies.com', businessName: 'Tech Supplies Inc.',
          businessDescription: 'Electronics and gadgets', businessPhone: '+1 555 000 1234',
          businessAddress: '456 Commerce Ave, New York', kycStatus: KycStatus.Approved
        };
      }
    });
  }
}
