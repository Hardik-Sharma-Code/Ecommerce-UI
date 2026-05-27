import { Component, ElementRef, inject, OnInit, ViewChild, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../core/services/payment.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  PaymentGatewayType, PaymentInitiatedDto, PaymentDto
} from '../../../core/models/payment.model';
import { OrderDto } from '../../../core/models/order.model';

type PaymentState = 'selecting' | 'initiating' | 'stripe-form' | 'verifying' | 'success' | 'failed';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, FormsModule],
  templateUrl: './payment.component.html'
})
export class PaymentComponent implements OnInit {
  @ViewChild('stripeCard') stripeCardRef!: ElementRef;

  private paymentService = inject(PaymentService);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  readonly PaymentGatewayType = PaymentGatewayType;

  orderId = 0;
  order: OrderDto | null = null;
  orderLoading = false;

  state: PaymentState = 'selecting';
  selectedGateway = PaymentGatewayType.Razorpay;
  currency = 'INR';

  initiatedData: PaymentInitiatedDto | null = null;
  payment: PaymentDto | null = null;
  failureReason = '';
  cardError = '';

  private stripe: unknown = null;
  private cardElement: unknown = null;

  readonly currencyOptions = ['INR', 'USD', 'EUR', 'GBP', 'SGD', 'AED'];

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    this.loadOrder();
  }

  loadOrder(): void {
    this.orderLoading = true;
    this.orderService.getById(this.orderId).subscribe({
      next: (res) => {
        this.orderLoading = false;
        this.order = res.success && res.data ? res.data : null;
        if (this.order?.payment) {
          // Already paid — show success state
          this.state = 'success';
        }
      },
      error: () => { this.orderLoading = false; }
    });
  }

  get displayAmount(): number { return this.order?.totalAmount ?? 0; }

  pay(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.state = 'initiating';
    this.failureReason = '';

    this.paymentService.initiate({
      orderId: this.orderId,
      gateway: this.selectedGateway,
      currency: this.currency
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.initiatedData = res.data;
          if (this.selectedGateway === PaymentGatewayType.Razorpay) {
            this.openRazorpay(res.data);
          } else {
            this.state = 'stripe-form';
            setTimeout(() => this.mountStripeCard(res.data!), 100);
          }
        } else {
          this.state = 'failed';
          this.failureReason = res.message ?? 'Payment initiation failed.';
        }
      },
      error: () => {
        this.state = 'failed';
        this.failureReason = 'Unable to initiate payment. Please try again.';
      }
    });
  }

  private async openRazorpay(data: PaymentInitiatedDto): Promise<void> {
    try {
      await this.loadScript('https://checkout.razorpay.com/v1/checkout.js');
      this.state = 'selecting'; // Reset — Razorpay shows its own overlay

      const options = {
        key: data.publicKey,
        amount: Math.round(data.amount * 100),
        currency: data.currency,
        order_id: data.gatewayOrderId,
        name: 'ShopEase',
        description: `Order ${this.order?.orderNumber ?? this.orderId}`,
        prefill: {},
        theme: { color: '#0d6efd' },
        handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          this.state = 'verifying';
          this.paymentService.verifyRazorpay({
            orderId: this.orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          }).subscribe({
            next: (res) => {
              if (res.success && res.data) { this.payment = res.data; this.state = 'success'; }
              else { this.state = 'failed'; this.failureReason = res.message ?? 'Verification failed.'; }
            },
            error: () => { this.state = 'failed'; this.failureReason = 'Verification request failed.'; }
          });
        },
        modal: {
          ondismiss: () => {
            if (this.state === 'selecting') return;
            this.state = 'selecting';
          }
        }
      };

      const rzp = new (window as { Razorpay: new (opts: unknown) => { open(): void } }).Razorpay(options);
      rzp.open();
    } catch {
      this.state = 'failed';
      this.failureReason = 'Failed to load Razorpay. Check your internet connection.';
    }
  }

  private async mountStripeCard(data: PaymentInitiatedDto): Promise<void> {
    try {
      await this.loadScript('https://js.stripe.com/v3/');
      const StripeConstructor = (window as { Stripe: (key: string) => unknown }).Stripe;
      this.stripe = StripeConstructor(data.publicKey);
      const elements = (this.stripe as { elements(): { create(type: string, opts?: unknown): unknown } }).elements();
      this.cardElement = elements.create('card', {
        style: { base: { fontSize: '16px', color: '#212529', fontFamily: 'system-ui, sans-serif', '::placeholder': { color: '#6c757d' } } }
      });
      if (this.stripeCardRef?.nativeElement) {
        (this.cardElement as { mount(el: HTMLElement): void }).mount(this.stripeCardRef.nativeElement);
        (this.cardElement as { on(event: string, fn: (e: { error?: { message: string } }) => void): void })
          .on('change', (event) => { this.cardError = event.error?.message ?? ''; });
      }
    } catch {
      this.state = 'failed';
      this.failureReason = 'Failed to load Stripe. Check your internet connection.';
    }
  }

  async confirmStripe(): Promise<void> {
    if (!this.stripe || !this.cardElement || !this.initiatedData?.clientSecret) return;
    this.state = 'verifying';
    this.cardError = '';

    type StripeResult = { error?: { message: string }; paymentIntent?: { status: string; id: string } };
    const stripeInstance = this.stripe as {
      confirmCardPayment(secret: string, opts: unknown): Promise<StripeResult>
    };

    const { error, paymentIntent } = await stripeInstance.confirmCardPayment(
      this.initiatedData.clientSecret,
      { payment_method: { card: this.cardElement } }
    );

    if (error) {
      this.state = 'stripe-form';
      this.cardError = error.message;
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      this.paymentService.confirmStripe({
        orderId: this.orderId,
        paymentIntentId: paymentIntent.id
      }).subscribe({
        next: (res) => {
          if (res.success && res.data) { this.payment = res.data; this.state = 'success'; }
          else { this.state = 'failed'; this.failureReason = res.message ?? 'Confirmation failed.'; }
        },
        error: () => { this.state = 'failed'; this.failureReason = 'Stripe confirmation request failed.'; }
      });
    } else {
      this.state = 'stripe-form';
      this.cardError = 'Payment was not completed. Please try again.';
    }
  }

  retry(): void {
    this.state = 'selecting';
    this.failureReason = '';
    this.cardError = '';
    this.initiatedData = null;
    this.cardElement = null;
    this.stripe = null;
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });
  }
}
