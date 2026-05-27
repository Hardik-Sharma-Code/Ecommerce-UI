import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProductDto } from '../../../core/models/product.model';
import { CategoryDto } from '../../../core/models/category.model';
import { ITEMS_PER_PAGE } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './products.component.html'
})
export class AdminProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);

  products: ProductDto[] = [];
  categories: CategoryDto[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  total = 0;
  pageSize = ITEMS_PER_PAGE;

  filterCategory = '';
  filterSearch = '';

  deleteTarget: ProductDto | null = null;
  showDeleteConfirm = false;

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => { if (res.success && res.data) this.categories = res.data; },
      error: () => {}
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll({
      page: this.currentPage,
      pageSize: this.pageSize,
      categoryId: this.filterCategory || undefined,
      search: this.filterSearch || undefined
    }).subscribe({
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
        this.total = 4; this.totalPages = 1;
      }
    });
  }

  applyFilter(): void { this.currentPage = 1; this.loadProducts(); }

  onPageChange(page: number): void { this.currentPage = page; this.loadProducts(); }

  toggleActive(product: ProductDto): void {
    this.productService.toggleActive(product.id).subscribe({
      next: () => { this.toast.success('Product status updated.', 'Updated'); this.loadProducts(); },
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
      { id: '1', name: 'iPhone 15 Pro', slug: 'iphone-15-pro', price: 999, stockQuantity: 50, categoryId: '1', categoryName: 'Smartphones', vendorId: 'v1', vendorName: 'TechStore', isActive: true, isFeatured: true, createdAt: new Date().toISOString() },
      { id: '2', name: 'Samsung Galaxy S24', slug: 'samsung-s24', price: 849, stockQuantity: 30, categoryId: '1', categoryName: 'Smartphones', vendorId: 'v1', vendorName: 'TechStore', isActive: true, isFeatured: false, createdAt: new Date().toISOString() },
      { id: '3', name: 'MacBook Pro 14"', slug: 'macbook-pro-14', price: 1999, stockQuantity: 20, categoryId: '1', categoryName: 'Laptops', vendorId: 'v2', vendorName: 'AppleReseller', isActive: true, isFeatured: true, createdAt: new Date().toISOString() },
      { id: '4', name: 'Men\'s Casual Shirt', slug: 'mens-casual-shirt', price: 49, stockQuantity: 200, categoryId: '2', categoryName: 'Men\'s Wear', vendorId: 'v3', vendorName: 'FashionHub', isActive: false, isFeatured: false, createdAt: new Date().toISOString() },
    ];
  }
}
