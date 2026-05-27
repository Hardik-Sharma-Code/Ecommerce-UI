import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { ToastService } from '../../../core/services/toast.service';

function passwordMatch(control: AbstractControl) {
  const pw = control.get('password')?.value;
  const cpw = control.get('confirmPassword')?.value;
  return pw === cpw ? null : { mismatch: true };
}

@Component({
  selector: 'app-register-customer',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-customer.component.html'
})
export class RegisterCustomerComponent {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = false;
  showPassword = false;
  showConfirm = false;

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatch });

  get firstName() { return this.form.get('firstName')!; }
  get lastName() { return this.form.get('lastName')!; }
  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const { confirmPassword, ...dto } = this.form.getRawValue() as any;

    this.loading = true;
    this.customerService.register(dto).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.toast.success('Account created! Please login.', 'Registered');
          this.router.navigate(['/auth/login']);
        } else {
          this.toast.error(res.message, 'Registration Failed');
        }
      },
      error: () => { this.loading = false; }
    });
  }
}
