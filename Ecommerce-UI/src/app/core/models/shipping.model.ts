export enum ShipmentStatus {
  Pending = 0,
  Processing = 1,
  InTransit = 2,
  OutForDelivery = 3,
  Delivered = 4,
  Failed = 5
}

export interface ShipmentDto {
  id: number;
  orderId: number;
  carrier: string;
  trackingNumber?: string;
  trackingUrl?: string;
  status: ShipmentStatus;
  statusName: string;
  shippedAt?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  notes?: string;
}

export interface ShippingRateDto {
  method: string;
  carrier: string;
  serviceName: string;
  rate: number;
  minDays: number;
  maxDays: number;
  description: string;
}

export interface GetShippingRatesDto {
  postalCode: string;
  country: string;
  orderAmount: number;
}

export interface UpdateTrackingDto {
  carrier: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  notes?: string;
}

export interface UpdateShipmentStatusDto {
  status: ShipmentStatus;
  notes?: string;
}
