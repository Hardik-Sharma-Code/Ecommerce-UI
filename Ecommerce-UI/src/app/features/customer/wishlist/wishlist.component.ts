import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ToastService } from '../../../core/services/toast.service';
import { WishlistItemDto } from '../../../core/models/wishlist.model';

@Component({
  selector: 'app-customer-wishlist',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './wishlist.component.html'
})
export class CustomerWishlistComponent implements OnInit {
  private wishlistService = inject(WishlistService);
  private toast = inject(ToastService);

  items: WishlistItemDto[] = [];
  loading = false;
  movingToCartId: number | null = null;
  removingId: number | null = null;
  showClearConfirm = false;
  clearing = false;

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.loading = true;
    this.wishlistService.loadWishlist().subscribe({
      next: (res) => {
        this.loading = false;
        this.items = res.success && res.data ? res.data : [];
      },
      error: () => { this.loading = false; }
    });
  }

  moveToCart(item: WishlistItemDto): void {
    if (!item.isInStock) return;
    this.movingToCartId = item.itemId;
    this.wishlistService.moveToCart(item.itemId).subscribe({
      next: (res) => {
        this.movingToCartId = null;
        if (res.success) {
          this.items = this.items.filter(i => i.itemId !== item.itemId);
          this.toast.success(`${item.productName} moved to cart.`, 'Cart');
        } else {
          this.toast.error(res.message, 'Error');
        }
      },
      error: () => { this.movingToCartId = null; }
    });
  }

  removeItem(item: WishlistItemDto): void {
    this.removingId = item.itemId;
    this.wishlistService.removeItem(item.itemId).subscribe({
      next: (res) => {
        this.removingId = null;
        if (res.success) {
          this.items = this.items.filter(i => i.itemId !== item.itemId);
          this.toast.success('Removed from wishlist.', 'Wishlist');
        } else {
          this.toast.error(res.message, 'Error');
        }
      },
      error: () => { this.removingId = null; }
    });
  }

  clearAll(): void {
    this.clearing = true;
    this.wishlistService.clearWishlist().subscribe({
      next: (res) => {
        this.clearing = false;
        this.showClearConfirm = false;
        if (res.success) {
          this.items = [];
          this.toast.success('Wishlist cleared.', 'Wishlist');
        } else {
          this.toast.error(res.message, 'Error');
        }
      },
      error: () => { this.clearing = false; this.showClearConfirm = false; }
    });
  }
}
