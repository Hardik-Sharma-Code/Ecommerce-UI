import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, CurrencyPipe, NgClass } from '@angular/common';
import { CouponService } from '../../../core/services/coupon.service';
import { ToastService } from '../../../core/services/toast.service';
import { CouponDto, CreateCouponDto, UpdateCouponDto, DiscountType } from '../../../core/models/coupon.model';

interface CouponForm {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number | null;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [FormsModule, DatePipe, CurrencyPipe, NgClass],
  templateUrl: './coupons.component.html'
})
export class AdminCouponsComponent implements OnInit {
  private couponService = inject(CouponService);
  private toast = inject(ToastService);

  coupons: CouponDto[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 20;
  total = 0;
  totalPages = 1;

  modal: { visible: boolean; mode: 'create' | 'edit'; editId: number | null } = {
    visible: false, mode: 'create', editId: null
  };
  form: CouponForm = this.emptyForm();
  saving = false;

  deleteConfirmId: number | null = null;
  deleting = false;

  readonly DiscountType = DiscountType;
  readonly discountTypeOptions = [
    { value: DiscountType.Percentage, label: 'Percentage (%)' },
    { value: DiscountType.Fixed, label: 'Fixed Amount ($)' },
  ];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.couponService.getAll(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.coupons = res.data.items;
          this.total = res.data.total;
          this.totalPages = res.data.totalPages;
        }
      },
      error: () => { this.loading = false; }
    });
  }

  onPageChange(page: number): void { this.currentPage = page; this.load(); }

  private emptyForm(): CouponForm {
    const today = new Date().toISOString().substring(0, 10);
    const nextYear = new Date(Date.now() + 365 * 864e5).toISOString().substring(0, 10);
    return {
      code: '', description: '', discountType: DiscountType.Percentage,
      discountValue: null, minOrderAmount: null, maxDiscountAmount: null,
      usageLimit: null, validFrom: today, validTo: nextYear, isActive: true
    };
  }

  openCreate(): void {
    this.form = this.emptyForm();
    this.modal = { visible: true, mode: 'create', editId: null };
  }

  openEdit(coupon: CouponDto): void {
    this.form = {
      code: coupon.code,
      description: coupon.description ?? '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount ?? null,
      maxDiscountAmount: coupon.maxDiscountAmount ?? null,
      usageLimit: coupon.usageLimit ?? null,
      validFrom: coupon.validFrom.substring(0, 10),
      validTo: coupon.validTo.substring(0, 10),
      isActive: coupon.isActive
    };
    this.modal = { visible: true, mode: 'edit', editId: coupon.id };
  }

  closeModal(): void { this.modal = { ...this.modal, visible: false }; }

  save(): void {
    if (!this.form.discountValue || !this.form.validFrom || !this.form.validTo) return;
    this.saving = true;

    if (this.modal.mode === 'create') {
      const dto: CreateCouponDto = {
        code: this.form.code.trim().toUpperCase(),
        description: this.form.description || undefined,
        discountType: this.form.discountType,
        discountValue: this.form.discountValue,
        minOrderAmount: this.form.minOrderAmount ?? undefined,
        maxDiscountAmount: this.form.discountType === DiscountType.Percentage ? (this.form.maxDiscountAmount ?? undefined) : undefined,
        usageLimit: this.form.usageLimit ?? undefined,
        validFrom: this.form.validFrom,
        validTo: this.form.validTo,
        isActive: this.form.isActive
      };
      this.couponService.create(dto).subscribe({
        next: (res) => {
          this.saving = false;
          if (res.success) { this.closeModal(); this.toast.success('Coupon created.', 'Created'); this.load(); }
          else this.toast.error(res.message, 'Error');
        },
        error: () => { this.saving = false; }
      });
    } else {
      const dto: UpdateCouponDto = {
        description: this.form.description || undefined,
        discountType: this.form.discountType,
        discountValue: this.form.discountValue,
        minOrderAmount: this.form.minOrderAmount ?? undefined,
        maxDiscountAmount: this.form.discountType === DiscountType.Percentage ? (this.form.maxDiscountAmount ?? undefined) : undefined,
        usageLimit: this.form.usageLimit ?? undefined,
        validFrom: this.form.validFrom,
        validTo: this.form.validTo,
        isActive: this.form.isActive
      };
      this.couponService.update(this.modal.editId!, dto).subscribe({
        next: (res) => {
          this.saving = false;
          if (res.success) { this.closeModal(); this.toast.success('Coupon updated.', 'Saved'); this.load(); }
          else this.toast.error(res.message, 'Error');
        },
        error: () => { this.saving = false; }
      });
    }
  }

  confirmDelete(id: number): void { this.deleteConfirmId = id; }

  cancelDelete(): void { this.deleteConfirmId = null; }

  doDelete(id: number): void {
    this.deleting = true;
    this.couponService.delete(id).subscribe({
      next: (res) => {
        this.deleting = false;
        this.deleteConfirmId = null;
        if (res.success) { this.toast.success('Coupon deleted.', 'Deleted'); this.load(); }
        else this.toast.error(res.message, 'Error');
      },
      error: () => { this.deleting = false; this.deleteConfirmId = null; }
    });
  }

  formatDiscount(coupon: CouponDto): string {
    return coupon.discountType === DiscountType.Percentage
      ? `${coupon.discountValue}%`
      : `$${coupon.discountValue.toFixed(2)}`;
  }

  isExpired(coupon: CouponDto): boolean {
    return new Date(coupon.validTo) < new Date();
  }

  statusBadge(coupon: CouponDto): string {
    if (!coupon.isActive) return 'bg-secondary';
    if (this.isExpired(coupon)) return 'bg-warning text-dark';
    return 'bg-success';
  }

  statusLabel(coupon: CouponDto): string {
    if (!coupon.isActive) return 'Inactive';
    if (this.isExpired(coupon)) return 'Expired';
    return 'Active';
  }

  get pages(): number[] {
    const range = 5;
    const start = Math.max(1, this.currentPage - Math.floor(range / 2));
    const end = Math.min(this.totalPages, start + range - 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
