import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, AsyncPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { CartDto, CartItemDto } from '../../../core/models/cart.model';

@Component({
  selector: 'app-customer-cart',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe],
  templateUrl: './cart.component.html'
})
export class CustomerCartComponent implements OnInit {
  private cartService = inject(CartService);
  private toast = inject(ToastService);

  cart: CartDto | null = null;
  loading = false;
  updatingItemId: number | null = null;
  showClearConfirm = false;

  ngOnInit(): void { this.loadCart(); }

  loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (res) => {
        this.loading = false;
        this.cart = res.success && res.data ? res.data : { items: [], itemCount: 0, subtotal: 0 };
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load cart. Please try again.', 'Error');
        this.cart = { items: [], itemCount: 0, subtotal: 0 };
      }
    });
  }

  decrease(item: CartItemDto): void {
    if (item.quantity <= 1) { this.remove(item); return; }
    this.updateQty(item, item.quantity - 1);
  }

  increase(item: CartItemDto): void {
    if (item.quantity >= item.stockQuantity) return;
    this.updateQty(item, item.quantity + 1);
  }

  onQtyInput(item: CartItemDto, value: string): void {
    const qty = parseInt(value, 10);
    if (isNaN(qty) || qty < 0) return;
    if (qty === 0) { this.remove(item); return; }
    const clamped = Math.min(qty, item.stockQuantity);
    if (clamped !== item.quantity) this.updateQty(item, clamped);
  }

  private updateQty(item: CartItemDto, qty: number): void {
    this.updatingItemId = item.itemId;
    this.cartService.updateItem(item.itemId, { quantity: qty }).subscribe({
      next: (res) => {
        this.updatingItemId = null;
        if (res.success && res.data) this.cart = res.data;
        else this.toast.error(res.message ?? 'Could not update quantity.', 'Error');
      },
      error: () => {
        this.updatingItemId = null;
        this.toast.error('Failed to update item quantity. Please try again.', 'Error');
      }
    });
  }

  remove(item: CartItemDto): void {
    this.updatingItemId = item.itemId;
    this.cartService.removeItem(item.itemId).subscribe({
      next: (res) => {
        this.updatingItemId = null;
        if (res.success && res.data) {
          this.cart = res.data;
          this.toast.success(`"${item.productName}" removed from cart.`, 'Removed');
        } else {
          this.toast.error(res.message ?? 'Could not remove item.', 'Error');
        }
      },
      error: () => {
        this.updatingItemId = null;
        this.toast.error('Failed to remove item. Please try again.', 'Error');
      }
    });
  }

  clearCart(): void {
    this.showClearConfirm = false;
    this.cartService.clearCart().subscribe({
      next: () => {
        this.cart = { items: [], itemCount: 0, subtotal: 0 };
        this.toast.success('Cart cleared.', 'Cleared');
      },
      error: () => { this.toast.error('Failed to clear cart. Please try again.', 'Error'); }
    });
  }

  getDiscountPercent(item: CartItemDto): number {
    if (!item.compareAtPrice) return 0;
    return Math.round((1 - item.price / item.compareAtPrice) * 100);
  }

  private getMockCart(): CartDto {
    return {
      itemCount: 3,
      subtotal: 1127.97,
      items: [
        { itemId: 1, productId: 1, productName: 'iPhone 15 Pro', productSlug: 'iphone-15-pro', price: 949, compareAtPrice: 999, quantity: 1, subtotal: 949, isInStock: true, stockQuantity: 50 },
        { itemId: 2, productId: 3, productName: 'MacBook Pro 14"', productSlug: 'macbook-pro-14', price: 1999, quantity: 1, subtotal: 1999, isInStock: true, stockQuantity: 5 },
        { itemId: 3, productId: 5, productName: 'Wireless Headphones', productSlug: 'wireless-headphones', price: 79.99, quantity: 2, subtotal: 159.98, isInStock: true, stockQuantity: 45 },
      ]
    };
  }
}
