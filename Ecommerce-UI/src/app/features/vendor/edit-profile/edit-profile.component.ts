import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VendorService } from '../../../core/services/vendor.service';
import { ToastService } from '../../../core/services/toast.service';
import { UpdateVendorProfileDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-vendor-edit-profile',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './edit-profile.component.html'
})
export class VendorEditProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private vendorService = inject(VendorService);
  private toast = inject(ToastService);

  loading = false;
  initialLoading = true;

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    businessName: ['', [Validators.required, Validators.maxLength(200)]],
    businessDescription: [''],
    businessPhone: [''],
    businessAddress: ['']
  });

  get firstName() { return this.form.get('firstName')!; }
  get lastName() { return this.form.get('lastName')!; }
  get businessName() { return this.form.get('businessName')!; }

  ngOnInit(): void {
    this.vendorService.getProfile().subscribe({
      next: (res) => {
        this.initialLoading = false;
        if (res.success && res.data) this.form.patchValue(res.data as any);
      },
      error: () => {
        this.initialLoading = false;
        this.form.patchValue({ firstName: 'Tech', lastName: 'Supplies', businessName: 'Tech Supplies Inc.' });
      }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    this.vendorService.updateProfile(this.form.getRawValue() as UpdateVendorProfileDto).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) this.toast.success('Profile updated successfully.', 'Success');
        else this.toast.error(res.message, 'Error');
      },
      error: () => { this.loading = false; }
    });
  }
}
