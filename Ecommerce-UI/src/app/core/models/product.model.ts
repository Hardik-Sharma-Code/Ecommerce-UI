export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
  stockQuantity: number;
  sku?: string;
  categoryId: string;
  categoryName?: string;
  vendorId: string;
  vendorName?: string;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
  stockQuantity: number;
  sku?: string;
  categoryId: string;
  imageUrl?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface UpdateStockDto {
  quantity: number;
  operation: 'set' | 'add' | 'subtract';
}

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  vendorId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}
