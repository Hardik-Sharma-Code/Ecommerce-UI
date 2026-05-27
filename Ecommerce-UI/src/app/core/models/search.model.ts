export interface ProductSearchRequestDto {
  query?: string;
  categoryId?: number;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  featuredOnly?: boolean;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}
