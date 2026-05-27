export interface CartItemDto {
  itemId: number;
  productId: number;
  productName: string;
  productSlug: string;
  primaryImageUrl?: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  subtotal: number;
  isInStock: boolean;
  stockQuantity: number;
}

export interface CartDto {
  items: CartItemDto[];
  itemCount: number;
  subtotal: number;
}

export interface AddToCartDto {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}
