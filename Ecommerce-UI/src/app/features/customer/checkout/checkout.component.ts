import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { AddressService } from '../../../core/services/address.service';
import { CartService } from '../../../core/services/cart.service';
import { ShippingService } from '../../../core/services/shipping.service';
import { CouponService } from '../../../core/services/coupon.service';
import { ToastService } from '../../../core/services/toast.service';
import { AddressDto } from '../../../core/models/address.model';
import { CartDto } from '../../../core/models/cart.model';
import { PlaceOrderDto } from '../../../core/models/order.model';
import { CouponValidationResultDto } from '../../../core/models/coupon.model';

interface ShippingOption {
  id: 'Standard' | 'Express' | 'Overnight';
  label: string;
  description: string;
  price: number;
  days: string;
  carrier?: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  private orderService = inject(OrderService);
  private addressService = inject(AddressService);
  private cartService = inject(CartService);
  private shippingService = inject(ShippingService);
  private couponService = inject(CouponService);
  private toast = inject(ToastService);
  private router = inject(Router);

  addresses: AddressDto[] = [];
  cart: CartDto | null = null;
  loadingAddresses = false;
  loadingCart = false;
  loadingRates = false;
  placing = false;

  selectedAddressId: number | null = null;
  selectedShipping: 'Standard' | 'Express' | 'Overnight' = 'Standard';
  couponCode = '';
  notes = '';
  couponLoading = false;
  couponError = '';
  appliedCoupon: CouponValidationResultDto | null = null;

  shippingOptions: ShippingOption[] = [
    { id: 'Standard', label: 'Standard Shipping', description: 'Regular delivery', price: 0, days: '5–7 business days' },
    { id: 'Express', label: 'Express Shipping', description: 'Faster delivery', price: 9.99, days: '2–3 business days' },
    { id: 'Overnight', label: 'Overnight', description: 'Next business day', price: 24.99, days: '1 business day' },
  ];

  ngOnInit(): void {
    this.loadAddresses();
    this.loadCart();
  }

  loadAddresses(): void {
    this.loadingAddresses = true;
    this.addressService.getAll().subscribe({
      next: (res) => {
        this.loadingAddresses = false;
        if (res.success && res.data) {
          this.addresses = res.data;
          const def = this.addresses.find(a => a.isDefault);
          this.selectedAddressId = def?.id ?? this.addresses[0]?.id ?? null;
          if (this.selectedAddressId && this.cart) this.loadShippingRates();
        }
      },
      error: () => { this.loadingAddresses = false; }
    });
  }

  loadCart(): void {
    this.loadingCart = true;
    if (this.cartService.cartSnapshot) {
      this.cart = this.cartService.cartSnapshot;
      this.loadingCart = false;
      if (this.selectedAddressId) this.loadShippingRates();
      return;
    }
    this.cartService.getCart().subscribe({
      next: (res) => {
        this.loadingCart = false;
        this.cart = res.success && res.data ? res.data : null;
        if (this.selectedAddressId) this.loadShippingRates();
      },
      error: () => { this.loadingCart = false; }
    });
  }

  onAddressChange(): void {
    if (this.cart) this.loadShippingRates();
    if (this.appliedCoupon) this.removeCoupon();
  }

  loadShippingRates(): void {
    const addr = this.addresses.find(a => a.id === this.selectedAddressId);
    if (!addr) return;
    this.loadingRates = true;
    this.shippingService.getRates({
      postalCode: addr.postalCode,
      country: addr.country,
      orderAmount: this.cartSubtotal
    }).subscribe({
      next: (res) => {
        this.loadingRates = false;
        if (res.success && res.data && res.data.length > 0) {
          this.shippingOptions = res.data.map(r => ({
            id: r.method as 'Standard' | 'Express' | 'Overnight',
            label: r.serviceName,
            description: r.description,
            price: r.rate,
            days: `${r.minDays}–${r.maxDays} business days`,
            carrier: r.carrier
          }));
          if (!this.shippingOptions.find(o => o.id === this.selectedShipping)) {
            this.selectedShipping = this.shippingOptions[0]?.id ?? 'Standard';
          }
        }
      },
      error: () => { this.loadingRates = false; }
    });
  }

  get selectedShippingOption(): ShippingOption {
    return this.shippingOptions.find(o => o.id === this.selectedShipping) ?? this.shippingOptions[0];
  }

  get cartSubtotal(): number { return this.cart?.subtotal ?? 0; }
  get shippingCost(): number { return this.selectedShippingOption?.price ?? 0; }
  get discount(): number { return this.appliedCoupon?.discountAmount ?? 0; }
  get orderTotal(): number { return Math.max(0, this.cartSubtotal + this.shippingCost - this.discount); }
  get canPlace(): boolean { return !!this.selectedAddressId && !!this.cart && this.cart.items.length > 0; }

  applyCoupon(): void {
    const code = this.couponCode.trim().toUpperCase();
    if (!code) return;
    this.couponLoading = true;
    this.couponError = '';
    this.couponService.validate({ code, orderAmount: this.cartSubtotal + this.shippingCost }).subscribe({
      next: (res) => {
        this.couponLoading = false;
        if (res.success && res.data) {
          if (res.data.isValid) {
            this.appliedCoupon = res.data;
            this.couponCode = code;
            this.couponError = '';
          } else {
            this.appliedCoupon = null;
            this.couponError = res.data.message;
          }
        } else {
          this.couponError = res.message;
        }
      },
      error: () => { this.couponLoading = false; this.couponError = 'Failed to validate coupon.'; }
    });
  }

  removeCoupon(): void {
    this.appliedCoupon = null;
    this.couponCode = '';
    this.couponError = '';
  }

  placeOrder(): void {
    if (!this.canPlace) return;
    this.placing = true;

    const dto: PlaceOrderDto = {
      addressId: this.selectedAddressId!,
      shippingMethod: this.selectedShipping,
      couponCode: this.couponCode || undefined,
      notes: this.notes || undefined
    };

    this.orderService.placeOrder(dto).subscribe({
      next: (res) => {
        this.placing = false;
        if (res.success && res.data) {
          this.toast.success('Order placed! Complete your payment.', 'Order Placed');
          this.router.navigate(['/customer/payment', res.data.id]);
        } else {
          this.toast.error(res.message, 'Error');
        }
      },
      error: () => { this.placing = false; }
    });
  }
}
