import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { CustomerProfileDto } from '../../../core/models/user.model';
import { KycStatus } from '../../../core/enums/kyc-status.enum';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile.component.html'
})
export class CustomerProfileComponent implements OnInit {
  private customerService = inject(CustomerService);

  profile: CustomerProfileDto | null = null;
  loading = true;

  get initials(): string {
    const first = this.profile?.firstName?.[0] ?? '';
    const last = this.profile?.lastName?.[0] ?? '';
    return (first + last).toUpperCase();
  }

  get fullName(): string {
    return `${this.profile?.firstName ?? ''} ${this.profile?.lastName ?? ''}`.trim();
  }

  ngOnInit(): void {
    this.customerService.getProfile().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) this.profile = res.data;
      },
      error: () => {
        this.loading = false;
        this.profile = {
          userId: '1', firstName: 'John', lastName: 'Doe',
          email: 'john@example.com', phoneNumber: '+1 234 567 8900',
          address: '123 Main St', city: 'New York', state: 'NY',
          postalCode: '10001', country: 'USA'
        };
      }
    });
  }
}
