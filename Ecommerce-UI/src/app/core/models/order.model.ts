export enum OrderStatus {
  Pending = 0,
  Confirmed = 1,
  Processing = 2,
  Shipped = 3,
  Delivered = 4,
  Cancelled = 5,
  Refunded = 6
}

export enum PaymentStatus {
  Pending = 0,
  Paid = 1,
  Failed = 2,
  Refunded = 3
}

export interface OrderPaymentDto {
  id: number;
  provider: string;
  transactionId?: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
}

export { ShipmentDto } from './shipping.model';

export { RefundDto } from './refund.model';

export interface OrderItemDto {
  id: number;
  productId?: number;
  productName: string;
  sku: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderDto {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  statusName: string;
  paymentStatus: PaymentStatus;
  paymentStatusName: string;
  shippingFirstName: string;
  shippingLastName: string;
  shippingPhone?: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  couponCode?: string;
  cancellationReason?: string;
  notes?: string;
  placedAt: string;
  items: OrderItemDto[];
  payment?: OrderPaymentDto;
  shipment?: ShipmentDto;
  refunds: RefundDto[];
}

export interface OrderSummaryDto {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  statusName: string;
  paymentStatus: PaymentStatus;
  paymentStatusName: string;
  totalAmount: number;
  itemCount: number;
  placedAt: string;
}

export interface PlaceOrderDto {
  addressId: number;
  shippingMethod: 'Standard' | 'Express' | 'Overnight';
  couponCode?: string;
  notes?: string;
}

export interface CancelOrderDto {
  reason?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  notes?: string;
}

export interface OrderListParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
}
