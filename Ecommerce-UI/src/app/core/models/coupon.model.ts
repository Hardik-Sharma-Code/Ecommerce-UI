export enum DiscountType {
  Percentage = 0,
  Fixed = 1
}

export interface CouponDto {
  id: number;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export interface ApplyCouponDto {
  code: string;
  orderAmount: number;
}

export interface CouponValidationResultDto {
  isValid: boolean;
  message: string;
  discountAmount: number;
  finalAmount: number;
}

export interface CreateCouponDto {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export interface UpdateCouponDto {
  description?: string;
  discountType?: DiscountType;
  discountValue?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  validFrom?: string;
  validTo?: string;
  isActive?: boolean;
}
