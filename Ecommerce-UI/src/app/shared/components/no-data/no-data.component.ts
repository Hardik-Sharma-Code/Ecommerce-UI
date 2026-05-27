import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-no-data',
  standalone: true,
  template: `
    <div class="text-center py-5">
      <i class="bi {{ icon }} no-data-icon d-block mb-3"></i>
      <h6 class="fw-semibold text-muted">{{ title }}</h6>
      <p class="text-muted small mb-0">{{ message }}</p>
    </div>
  `
})
export class NoDataComponent {
  @Input() title = 'No Data Found';
  @Input() message = 'There are no records to display at the moment.';
  @Input() icon = 'bi-inbox';
}
