import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { ToastService } from '../../../core/services/toast.service';
import { UpdateCustomerProfileDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-customer-edit-profile',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './edit-profile.component.html'
})
export class CustomerEditProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private toast = inject(ToastService);

  loading = false;
  initialLoading = true;

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    phoneNumber: [''],
    address: [''],
    city: [''],
    state: [''],
    postalCode: [''],
    country: ['']
  });

  get firstName() { return this.form.get('firstName')!; }
  get lastName() { return this.form.get('lastName')!; }

  ngOnInit(): void {
    this.customerService.getProfile().subscribe({
      next: (res) => {
        this.initialLoading = false;
        if (res.success && res.data) this.form.patchValue(res.data as any);
      },
      error: () => {
        this.initialLoading = false;
        this.form.patchValue({ firstName: 'John', lastName: 'Doe', phoneNumber: '+1 234 567 8900', city: 'New York', country: 'USA' });
      }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    this.customerService.updateProfile(this.form.getRawValue() as UpdateCustomerProfileDto).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.toast.success('Profile updated successfully.', 'Success');
        } else {
          this.toast.error(res.message, 'Error');
        }
      },
      error: () => { this.loading = false; }
    });
  }
}
