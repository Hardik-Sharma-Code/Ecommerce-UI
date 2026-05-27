import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

function passwordMatch(control: AbstractControl) {
  const np = control.get('newPassword')?.value;
  const cp = control.get('confirmPassword')?.value;
  return np === cp ? null : { mismatch: true };
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  loading = false;
  show = { current: false, new: false, confirm: false };

  form = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatch });

  get currentPassword() { return this.form.get('currentPassword')!; }
  get newPassword() { return this.form.get('newPassword')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    this.auth.changePassword({
      currentPassword: this.currentPassword.value!,
      newPassword: this.newPassword.value!
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.toast.success('Password updated successfully.', 'Success');
          this.form.reset();
        } else {
          this.toast.error(res.message, 'Error');
        }
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to change password. Please try again.', 'Error');
      }
    });
  }
}
