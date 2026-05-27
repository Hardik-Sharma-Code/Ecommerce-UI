import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../core/services/review.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReviewDto, CreateReviewDto, UpdateReviewDto } from '../../../core/models/review.model';

type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-customer-reviews',
  standalone: true,
  imports: [DatePipe, NgClass, FormsModule],
  templateUrl: './reviews.component.html'
})
export class CustomerReviewsComponent implements OnInit {
  private reviewService = inject(ReviewService);
  private toast = inject(ToastService);

  reviews: ReviewDto[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  loading = false;

  readonly stars = [1, 2, 3, 4, 5];

  modal: {
    visible: boolean;
    mode: ModalMode;
    editId: number | null;
    productId: number | null;
    productName: string;
    rating: number;
    title: string;
    body: string;
  } = { visible: false, mode: 'create', editId: null, productId: null, productName: '', rating: 5, title: '', body: '' };

  submitting = false;
  deleteConfirmId: number | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.reviewService.getMyReviews(this.page, this.pageSize).subscribe({
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

  goToPage(p: number): void {
    this.page = p;
    this.load();
  }

  openCreate(): void {
    this.modal = { visible: true, mode: 'create', editId: null, productId: null, productName: '', rating: 5, title: '', body: '' };
  }

  openEdit(review: ReviewDto): void {
    this.modal = { visible: true, mode: 'edit', editId: review.id, productId: review.productId, productName: review.productName, rating: review.rating, title: review.title, body: review.body };
  }

  closeModal(): void {
    this.modal = { ...this.modal, visible: false };
  }

  submit(): void {
    if (this.modal.mode === 'create') {
      if (!this.modal.productId || !this.modal.title.trim() || !this.modal.body.trim()) return;
      this.submitting = true;
      const dto: CreateReviewDto = {
        productId: this.modal.productId,
        rating: this.modal.rating,
        title: this.modal.title.trim(),
        body: this.modal.body.trim()
      };
      this.reviewService.create(dto).subscribe({
        next: (res) => {
          this.submitting = false;
          this.closeModal();
          if (res.success) { this.toast.success('Review submitted.', 'Review'); this.load(); }
          else this.toast.error(res.message, 'Error');
        },
        error: () => { this.submitting = false; }
      });
    } else {
      if (!this.modal.editId || !this.modal.title.trim() || !this.modal.body.trim()) return;
      this.submitting = true;
      const dto: UpdateReviewDto = {
        rating: this.modal.rating,
        title: this.modal.title.trim(),
        body: this.modal.body.trim()
      };
      this.reviewService.update(this.modal.editId, dto).subscribe({
        next: (res) => {
          this.submitting = false;
          this.closeModal();
          if (res.success) { this.toast.success('Review updated.', 'Updated'); this.load(); }
          else this.toast.error(res.message, 'Error');
        },
        error: () => { this.submitting = false; }
      });
    }
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

  get canSubmit(): boolean {
    if (!this.modal.title.trim() || !this.modal.body.trim() || this.modal.rating < 1) return false;
    if (this.modal.mode === 'create' && !this.modal.productId) return false;
    return true;
  }
}
