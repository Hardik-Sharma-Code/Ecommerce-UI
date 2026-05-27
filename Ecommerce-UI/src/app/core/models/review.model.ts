export interface ReviewDto {
  id: number;
  productId: number;
  productName: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewDto {
  productId: number;
  rating: number;
  title: string;
  body: string;
}

export interface UpdateReviewDto {
  rating: number;
  title: string;
  body: string;
}

export interface ProductRatingSummaryDto {
  productId: number;
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: Record<number, number>;
}

export interface ReviewListParams {
  page?: number;
  pageSize?: number;
  isApproved?: boolean;
}
