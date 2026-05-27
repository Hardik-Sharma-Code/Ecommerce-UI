import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { ProductDto } from '../models/product.model';
import { ProductSearchRequestDto } from '../models/search.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);

  searchProducts(params: ProductSearchRequestDto): Observable<ApiResponse<PaginatedResponse<ProductDto>>> {
    let p = new HttpParams();
    if (params.query) p = p.set('query', params.query);
    if (params.categoryId != null) p = p.set('categoryId', params.categoryId);
    if (params.vendorId) p = p.set('vendorId', params.vendorId);
    if (params.minPrice != null) p = p.set('minPrice', params.minPrice);
    if (params.maxPrice != null) p = p.set('maxPrice', params.maxPrice);
    if (params.inStockOnly) p = p.set('inStockOnly', true);
    if (params.featuredOnly) p = p.set('featuredOnly', true);
    if (params.sortBy) p = p.set('sortBy', params.sortBy);
    if (params.page) p = p.set('page', params.page);
    if (params.pageSize) p = p.set('pageSize', params.pageSize);
    return this.http.get<ApiResponse<PaginatedResponse<ProductDto>>>(API_ENDPOINTS.search.products, { params: p });
  }

  getSuggestions(query: string, limit = 10): Observable<ApiResponse<string[]>> {
    const p = new HttpParams().set('query', query).set('limit', limit);
    return this.http.get<ApiResponse<string[]>>(API_ENDPOINTS.search.suggestions, { params: p });
  }
}
