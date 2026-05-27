export enum RefundStatus {
  Pending = 0,
  Approved = 1,
  Processing = 2,
  Completed = 3,
  Rejected = 4
}

export interface RefundDto {
  id: number;
  orderId: number;
  orderNumber: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  statusName: string;
  gatewayRefundId?: string;
  notes?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface RequestRefundDto {
  orderId: number;
  amount: number;
  reason: string;
}

export interface ProcessRefundDto {
  status: RefundStatus;
  notes?: string;
}

export interface RefundListParams {
  page?: number;
  pageSize?: number;
  status?: RefundStatus;
}
