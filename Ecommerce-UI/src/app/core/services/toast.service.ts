import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  readonly toasts = this.toasts$.asObservable();

  success(message: string, title = 'Success'): void {
    this.add({ type: 'success', title, message });
  }

  error(message: string, title = 'Error'): void {
    this.add({ type: 'error', title, message });
  }

  warning(message: string, title = 'Warning'): void {
    this.add({ type: 'warning', title, message });
  }

  info(message: string, title = 'Info'): void {
    this.add({ type: 'info', title, message });
  }

  remove(id: number): void {
    this.toasts$.next(this.toasts$.value.filter(t => t.id !== id));
  }

  private add(toast: Omit<Toast, 'id'>): void {
    const id = ++this.counter;
    this.toasts$.next([...this.toasts$.value, { id, ...toast }]);
    setTimeout(() => this.remove(id), 4000);
  }
}
