import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

function passwordMatch(control: AbstractControl) {
  const np = control.get('newPassword')?.value;
  const cp = control.get('confirmPassword')?.value;
  return np === cp ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  loading = false;
  showPassword = false;
  showConfirm = false;
  token = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatch });

  get email() { return this.form.get('email')!; }
  get newPassword() { return this.form.get('newPassword')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    const emailParam = this.route.snapshot.queryParamMap.get('email') ?? '';
    if (emailParam) this.form.patchValue({ email: emailParam });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.token) {
      this.toast.error('Invalid or missing reset link. Please request a new password reset.', 'Error');
      return;
    }

    this.loading = true;
    this.auth.resetPassword({
      email: this.email.value!,
      token: this.token,
      newPassword: this.newPassword.value!
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.toast.success('Password reset successfully. Please login.', 'Success');
          this.router.navigate(['/auth/login']);
        } else {
          this.toast.error(res.message, 'Error');
        }
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to reset password. Please try again.', 'Error');
      }
    });
  }
}
