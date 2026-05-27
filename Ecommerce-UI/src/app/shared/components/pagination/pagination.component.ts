import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (totalPages > 1) {
      <nav aria-label="Table pagination">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" [class.disabled]="currentPage === 1">
            <button class="page-link" (click)="changePage(currentPage - 1)">
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>

          @for (page of pages; track page) {
            <li class="page-item" [class.active]="page === currentPage">
              <button class="page-link" (click)="changePage(page)">{{ page }}</button>
            </li>
          }

          <li class="page-item" [class.disabled]="currentPage === totalPages">
            <button class="page-link" (click)="changePage(currentPage + 1)">
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    }
  `
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() maxVisible = 5;
  @Output() pageChange = new EventEmitter<number>();

  pages: number[] = [];

  ngOnChanges(): void {
    this.buildPages();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  private buildPages(): void {
    const half = Math.floor(this.maxVisible / 2);
    let start = Math.max(1, this.currentPage - half);
    const end = Math.min(this.totalPages, start + this.maxVisible - 1);
    start = Math.max(1, end - this.maxVisible + 1);
    this.pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
