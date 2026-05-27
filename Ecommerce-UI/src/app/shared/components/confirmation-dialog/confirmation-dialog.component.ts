import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  template: `
    @if (visible) {
      <div class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-semibold">{{ title }}</h5>
              <button type="button" class="btn-close" (click)="cancel()"></button>
            </div>
            <div class="modal-body text-muted">{{ message }}</div>
            <div class="modal-footer border-0 pt-0">
              <button type="button" class="btn btn-outline-secondary btn-sm" (click)="cancel()">Cancel</button>
              <button type="button" class="btn btn-sm" [class]="confirmBtnClass" (click)="confirm()">
                {{ confirmLabel }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmationDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmLabel = 'Confirm';
  @Input() confirmBtnClass = 'btn-danger';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  confirm(): void { this.confirmed.emit(); }
  cancel(): void { this.cancelled.emit(); }
}
