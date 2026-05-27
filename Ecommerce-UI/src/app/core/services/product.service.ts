import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { ProductDto, CreateProductDto, UpdateProductDto, UpdateStockDto, ProductListParams } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  getAll(params: ProductListParams = {}): Observable<ApiResponse<PaginatedResponse<ProductDto>>> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params.vendorId) httpParams = httpParams.set('vendorId', params.vendorId);
    if (params.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive);
    if (params.isFeatured !== undefined) httpParams = httpParams.set('isFeatured', params.isFeatured);
    if (params.minPrice !== undefined) httpParams = httpParams.set('minPrice', params.minPrice);
    if (params.maxPrice !== undefined) httpParams = httpParams.set('maxPrice', params.maxPrice);
    if (params.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<ApiResponse<PaginatedResponse<ProductDto>>>(API_ENDPOINTS.products.list, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<ProductDto>> {
    return this.http.get<ApiResponse<ProductDto>>(API_ENDPOINTS.products.byId(id));
  }

  getBySlug(slug: string): Observable<ApiResponse<ProductDto>> {
    return this.http.get<ApiResponse<ProductDto>>(API_ENDPOINTS.products.bySlug(slug));
  }

  getByCategory(categoryId: string): Observable<ApiResponse<PaginatedResponse<ProductDto>>> {
    return this.http.get<ApiResponse<PaginatedResponse<ProductDto>>>(API_ENDPOINTS.products.byCategory(categoryId));
  }

  getByVendor(vendorId: string, params: ProductListParams = {}): Observable<ApiResponse<PaginatedResponse<ProductDto>>> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
    return this.http.get<ApiResponse<PaginatedResponse<ProductDto>>>(API_ENDPOINTS.products.byVendor(vendorId), { params: httpParams });
  }

  create(dto: CreateProductDto): Observable<ApiResponse<ProductDto>> {
    return this.http.post<ApiResponse<ProductDto>>(API_ENDPOINTS.products.list, dto);
  }

  update(id: string, dto: UpdateProductDto): Observable<ApiResponse<ProductDto>> {
    return this.http.put<ApiResponse<ProductDto>>(API_ENDPOINTS.products.byId(id), dto);
  }

  delete(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(API_ENDPOINTS.products.byId(id));
  }

  updateStock(id: string, dto: UpdateStockDto): Observable<ApiResponse<ProductDto>> {
    return this.http.patch<ApiResponse<ProductDto>>(API_ENDPOINTS.products.stock(id), dto);
  }

  toggleActive(id: string): Observable<ApiResponse<ProductDto>> {
    return this.http.patch<ApiResponse<ProductDto>>(API_ENDPOINTS.products.toggleActive(id), {});
  }
}
