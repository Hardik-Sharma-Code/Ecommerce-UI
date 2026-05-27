import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="border-top py-3 px-4 bg-white mt-auto">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <span class="text-muted small">&copy; {{ year }} ShopEase. All rights reserved.</span>
        <span class="text-muted small">Version 1.0.0</span>
      </div>
    </footer>
  `
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
