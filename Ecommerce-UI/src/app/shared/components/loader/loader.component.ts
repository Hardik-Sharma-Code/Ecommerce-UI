import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    @if (loader.isLoading$ | async) {
      <div class="loader-overlay">
        <div class="text-center">
          <div class="spinner-border text-primary" style="width:3rem;height:3rem;" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted small">Please wait...</p>
        </div>
      </div>
    }
  `
})
export class LoaderComponent {
  loader = inject(LoaderService);
}
