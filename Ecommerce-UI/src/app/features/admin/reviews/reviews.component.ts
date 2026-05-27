import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../core/services/review.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReviewDto } from '../../../core/models/review.model';

type StatusFilter = 'all' | 'pending' | 'approved';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [DatePipe, NgClass, FormsModule],
  templateUrl: './reviews.component.html'
})
export class AdminReviewsComponent implements OnInit {
  private reviewService = inject(ReviewService);
  private toast = inject(ToastService);

  reviews: ReviewDto[] = [];
  total = 0;
  page = 1;
  pageSize = 20;
  statusFilter: StatusFilter = 'all';
  loading = false;

  expandedId: number | null = null;
  deleteConfirmId: number | null = null;

  readonly stars = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    const isApproved = this.statusFilter === 'approved' ? true
      : this.statusFilter === 'pending' ? false
      : undefined;

    this.reviewService.getAll({ page: this.page, pageSize: this.pageSize, isApproved }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.reviews = res.data.items;
          this.total = res.data.total;
        }
      },
      error: () => { this.loading = false; }
    });
  }

  get totalPages(): number { return Math.ceil(this.total / this.pageSize); }

  setFilter(f: StatusFilter): void {
    this.statusFilter = f;
    this.page = 1;
    this.load();
  }

  goToPage(p: number): void {
    this.page = p;
    this.load();
  }

  toggleExpand(id: number): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  approve(review: ReviewDto): void {
    this.reviewService.approve(review.id).subscribe({
      next: (res) => {
        if (res.success) { this.toast.success('Review approved.', 'Approved'); this.load(); }
        else this.toast.error(res.message, 'Error');
      }
    });
  }

  confirmDelete(id: number): void { this.deleteConfirmId = id; }
  cancelDelete(): void { this.deleteConfirmId = null; }

  deleteReview(id: number): void {
    this.reviewService.delete(id).subscribe({
      next: (res) => {
        this.deleteConfirmId = null;
        if (res.success) { this.toast.success('Review deleted.', 'Deleted'); this.load(); }
        else this.toast.error(res.message, 'Error');
      },
      error: () => { this.deleteConfirmId = null; }
    });
  }
}
