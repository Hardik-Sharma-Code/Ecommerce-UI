import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { SearchService } from '../../../core/services/search.service';
import { CategoryService } from '../../../core/services/category.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProductDto } from '../../../core/models/product.model';
import { CategoryDto } from '../../../core/models/category.model';

@Component({
  selector: 'app-customer-browse',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './browse.component.html'
})
export class CustomerBrowseComponent implements OnInit, OnDestroy {
  private searchService = inject(SearchService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private toast = inject(ToastService);

  private destroy$ = new Subject<void>();
  private searchInput$ = new Subject<string>();

  products: ProductDto[] = [];
  categories: CategoryDto[] = [];
  suggestions: string[] = [];
  loading = false;
  showSuggestions = false;
  currentPage = 1;
  totalPages = 1;
  total = 0;
  pageSize = 12;
  addingToCartId: string | null = null;
  togglingWishlistId: string | null = null;

  filters = {
    query: '',
    categoryId: null as number | null,
    minPrice: null as number | null,
    maxPrice: null as number | null,
    inStockOnly: false,
    featuredOnly: false,
    sortBy: 'newest'
  };

  viewMode: 'grid' | 'list' = 'grid';

  readonly sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name A–Z' },
    { value: 'name-desc', label: 'Name Z–A' },
    { value: 'featured', label: 'Featured First' },
  ];

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.wishlistService.loadWishlist().subscribe();

    this.searchInput$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(q => {
      if (q.length >= 2) this.fetchSuggestions(q);
      else { this.suggestions = []; this.showSuggestions = false; }
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => { if (res.success && res.data) this.categories = res.data; }
    });
  }

  onQueryInput(q: string): void {
    this.searchInput$.next(q);
    if (q.length >= 2) this.showSuggestions = true;
  }

  selectSuggestion(text: string): void {
    this.filters.query = text;
    this.showSuggestions = false;
    this.suggestions = [];
    this.currentPage = 1;
    this.loadProducts();
  }

  fetchSuggestions(q: string): void {
    this.searchService.getSuggestions(q).subscribe({
      next: (res) => {
        this.suggestions = res.success && res.data ? res.data : [];
        this.showSuggestions = this.suggestions.length > 0;
      },
      error: () => { this.suggestions = []; }
    });
  }

  search(): void {
    this.showSuggestions = false;
    this.currentPage = 1;
    this.loadProducts();
  }

  clearSearch(): void {
    this.filters.query = '';
    this.suggestions = [];
    this.showSuggestions = false;
    this.search();
  }

  applyFilters(): void { this.currentPage = 1; this.loadProducts(); }

  resetFilters(): void {
    this.filters = { query: '', categoryId: null, minPrice: null, maxPrice: null, inStockOnly: false, featuredOnly: false, sortBy: 'newest' };
    this.currentPage = 1;
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.searchService.searchProducts({
      query: this.filters.query || undefined,
      categoryId: this.filters.categoryId ?? undefined,
      minPrice: this.filters.minPrice ?? undefined,
      maxPrice: this.filters.maxPrice ?? undefined,
      inStockOnly: this.filters.inStockOnly || undefined,
      featuredOnly: this.filters.featuredOnly || undefined,
      sortBy: this.filters.sortBy,
      page: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.products = res.data.items;
          this.total = res.data.total;
          this.totalPages = res.data.totalPages;
        }
      },
      error: () => { this.loading = false; }
    });
  }

  addToCart(product: ProductDto): void {
    if (product.stockQuantity === 0) return;
    this.addingToCartId = product.id;
    this.cartService.addItem({ productId: +product.id, quantity: 1 }).subscribe({
      next: (res) => {
        this.addingToCartId = null;
        if (res.success) this.toast.success(`${product.name} added to cart.`, 'Cart');
        else this.toast.error(res.message, 'Error');
      },
      error: () => { this.addingToCartId = null; }
    });
  }

  onPageChange(page: number): void { this.currentPage = page; this.loadProducts(); }

  getDiscountPercent(product: ProductDto): number {
    if (!product.discountedPrice) return 0;
    return Math.round((1 - product.discountedPrice / product.price) * 100);
  }

  isWishlisted(productId: string): boolean {
    return this.wishlistService.isWishlisted(+productId);
  }

  toggleWishlist(product: ProductDto): void {
    const productIdNum = +product.id;
    this.togglingWishlistId = product.id;
    if (this.wishlistService.isWishlisted(productIdNum)) {
      const item = this.wishlistService.snapshot.find(i => i.productId === productIdNum);
      if (!item) { this.togglingWishlistId = null; return; }
      this.wishlistService.removeItem(item.itemId).subscribe({
        next: (res) => {
          this.togglingWishlistId = null;
          if (!res.success) this.toast.error(res.message, 'Error');
        },
        error: () => { this.togglingWishlistId = null; }
      });
    } else {
      this.wishlistService.addToWishlist({ productId: productIdNum }).subscribe({
        next: (res) => {
          this.togglingWishlistId = null;
          if (res.success) this.toast.success(`${product.name} added to wishlist.`, 'Wishlist');
          else this.toast.error(res.message, 'Error');
        },
        error: () => { this.togglingWishlistId = null; }
      });
    }
  }

  get pages(): number[] {
    const range = 5;
    const start = Math.max(1, this.currentPage - Math.floor(range / 2));
    const end = Math.min(this.totalPages, start + range - 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
