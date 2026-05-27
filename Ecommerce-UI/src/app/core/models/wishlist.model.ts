export interface WishlistItemDto {
  itemId: number;
  productId: number;
  productName: string;
  productSlug: string;
  primaryImageUrl?: string;
  price: number;
  compareAtPrice?: number;
  isInStock: boolean;
  addedAt: string;
}

export interface AddToWishlistDto {
  productId: number;
}
