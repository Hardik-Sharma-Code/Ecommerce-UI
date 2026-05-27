import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductDto } from '../../../core/models/product.model';
import { ITEMS_PER_PAGE } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-vendor-products',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './products.component.html'
})
export class VendorProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  products: ProductDto[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  total = 0;
  pageSize = ITEMS_PER_PAGE;

  stockModal = { visible: false, product: null as ProductDto | null, quantity: 0, operation: 'set' as 'set' | 'add' | 'subtract' };
  deleteTarget: ProductDto | null = null;
  showDeleteConfirm = false;

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.loading = true;
    const vendorId = this.auth.currentUserValue?.id ?? '';
    this.productService.getByVendor(vendorId, { page: this.currentPage, pageSize: this.pageSize }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.products = res.data.items;
          this.total = res.data.total;
          this.totalPages = res.data.totalPages;
        }
      },
      error: () => {
        this.loading = false;
        this.products = this.getMockProducts();
        this.total = 3; this.totalPages = 1;
      }
    });
  }

  onPageChange(page: number): void { this.currentPage = page; this.loadProducts(); }

  toggleActive(product: ProductDto): void {
    this.productService.toggleActive(product.id).subscribe({
      next: () => { this.toast.success('Product status updated.', 'Updated'); this.loadProducts(); },
      error: () => {}
    });
  }

  openStockModal(product: ProductDto): void {
    this.stockModal = { visible: true, product, quantity: product.stockQuantity, operation: 'set' };
  }

  closeStockModal(): void {
    this.stockModal = { visible: false, product: null, quantity: 0, operation: 'set' };
  }

  saveStock(): void {
    if (!this.stockModal.product) return;
    this.productService.updateStock(this.stockModal.product.id, {
      quantity: this.stockModal.quantity,
      operation: this.stockModal.operation
    }).subscribe({
      next: () => { this.toast.success('Stock updated.', 'Updated'); this.closeStockModal(); this.loadProducts(); },
      error: () => {}
    });
  }

  confirmDelete(product: ProductDto): void { this.deleteTarget = product; this.showDeleteConfirm = true; }
  cancelDelete(): void { this.deleteTarget = null; this.showDeleteConfirm = false; }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.productService.delete(this.deleteTarget.id).subscribe({
      next: () => { this.toast.success('Product deleted.', 'Deleted'); this.cancelDelete(); this.loadProducts(); },
      error: () => { this.cancelDelete(); }
    });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  private getMockProducts(): ProductDto[] {
    return [
      { id: '1', name: 'Wireless Headphones', slug: 'wireless-headphones', price: 79.99, stockQuantity: 45, categoryId: '1', categoryName: 'Electronics', vendorId: 'v1', isActive: true, isFeatured: true, createdAt: new Date().toISOString() },
      { id: '2', name: 'USB-C Hub', slug: 'usb-c-hub', price: 34.99, stockQuantity: 3, categoryId: '1', categoryName: 'Electronics', vendorId: 'v1', isActive: true, isFeatured: false, createdAt: new Date().toISOString() },
      { id: '3', name: 'Laptop Stand', slug: 'laptop-stand', price: 29.99, stockQuantity: 0, categoryId: '1', categoryName: 'Electronics', vendorId: 'v1', isActive: false, isFeatured: false, createdAt: new Date().toISOString() },
    ];
  }
}
