import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts | async; track toast.id) {
        <div class="toast-notification toast-{{ toast.type }}">
          <i class="bi toast-icon {{ iconMap[toast.type] }}"></i>
          <div class="toast-body">
            <div class="toast-title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          <button class="toast-close" (click)="toastService.remove(toast.id)">
            <i class="bi bi-x"></i>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
  iconMap: Record<string, string> = {
    success: 'bi-check-circle-fill text-success',
    error: 'bi-x-circle-fill text-danger',
    warning: 'bi-exclamation-triangle-fill text-warning',
    info: 'bi-info-circle-fill text-info'
  };
}
