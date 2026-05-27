import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VendorService } from '../../../core/services/vendor.service';
import { ToastService } from '../../../core/services/toast.service';
import { KycSubmissionDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './kyc.component.html'
})
export class KycComponent {
  private fb = inject(FormBuilder);
  private vendorService = inject(VendorService);
  private toast = inject(ToastService);

  loading = false;

  form = this.fb.group({
    documentType: ['', Validators.required],
    documentNumber: ['', [Validators.required, Validators.maxLength(100)]],
    declarationAccepted: [false, Validators.requiredTrue]
  });

  get documentType() { return this.form.get('documentType')!; }
  get documentNumber() { return this.form.get('documentNumber')!; }

  readonly documentTypes = [
    { value: 'Aadhaar Card', label: 'Aadhaar Card' },
    { value: 'Passport', label: 'Passport' },
    { value: 'Driver License', label: 'Driver\'s License' },
    { value: 'GST Certificate', label: 'GST Certificate' },
    { value: 'Company Registration', label: 'Company Registration' },
    { value: 'PAN Card', label: 'PAN Card' }
  ];

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const dto: KycSubmissionDto = {
      documentType: this.documentType.value!,
      documentNumber: this.documentNumber.value!
    };

    this.loading = true;
    this.vendorService.submitKyc(dto).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.toast.success('KYC submitted successfully. We will review within 2–3 business days.', 'KYC Submitted');
          this.form.reset({ documentType: '', documentNumber: '', declarationAccepted: false });
        } else {
          this.toast.error(res.message, 'Submission Failed');
        }
      },
      error: () => { this.loading = false; }
    });
  }
}
