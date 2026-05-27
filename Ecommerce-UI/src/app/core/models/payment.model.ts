import { PaymentStatus } from './order.model';

export { PaymentStatus };

export enum PaymentGatewayType {
  Razorpay = 0,
  Stripe = 1
}

export interface InitiatePaymentDto {
  orderId: number;
  gateway: PaymentGatewayType;
  currency: string;
}

export interface PaymentInitiatedDto {
  orderId: number;
  gatewayOrderId: string;
  clientSecret?: string;
  publicKey: string;
  amount: number;
  currency: string;
  gateway: PaymentGatewayType;
  gatewayName: string;
}

export interface PaymentDto {
  id: number;
  orderId: number;
  gateway: PaymentGatewayType;
  gatewayName: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  statusName: string;
  failureReason?: string;
  createdAt: string;
}

export interface VerifyRazorpayDto {
  orderId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface StripeConfirmDto {
  orderId: number;
  paymentIntentId: string;
}
