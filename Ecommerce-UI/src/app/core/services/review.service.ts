import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import {
  ReviewDto, CreateReviewDto, UpdateReviewDto,
  ProductRatingSummaryDto, ReviewListParams
} from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);

  getByProduct(productId: number, page = 1, pageSize = 10): Observable<ApiResponse<PaginatedResponse<ReviewDto>>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<ApiResponse<PaginatedResponse<ReviewDto>>>(
      API_ENDPOINTS.reviews.byProduct(productId), { params });
  }

  getSummary(productId: number): Observable<ApiResponse<ProductRatingSummaryDto>> {
    return this.http.get<ApiResponse<ProductRatingSummaryDto>>(API_ENDPOINTS.reviews.summaryByProduct(productId));
  }

  getById(id: number): Observable<ApiResponse<ReviewDto>> {
    return this.http.get<ApiResponse<ReviewDto>>(API_ENDPOINTS.reviews.byId(id));
  }

  getMyReviews(page = 1, pageSize = 10): Observable<ApiResponse<PaginatedResponse<ReviewDto>>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<ApiResponse<PaginatedResponse<ReviewDto>>>(API_ENDPOINTS.reviews.my, { params });
  }

  create(dto: CreateReviewDto): Observable<ApiResponse<ReviewDto>> {
    return this.http.post<ApiResponse<ReviewDto>>(API_ENDPOINTS.reviews.create, dto);
  }

  update(id: number, dto: UpdateReviewDto): Observable<ApiResponse<ReviewDto>> {
    return this.http.put<ApiResponse<ReviewDto>>(API_ENDPOINTS.reviews.update(id), dto);
  }

  delete(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(API_ENDPOINTS.reviews.delete(id));
  }

  getAll(params: ReviewListParams = {}): Observable<ApiResponse<PaginatedResponse<ReviewDto>>> {
    let p = new HttpParams();
    if (params.page != null) p = p.set('page', params.page);
    if (params.pageSize != null) p = p.set('pageSize', params.pageSize);
    if (params.isApproved != null) p = p.set('isApproved', params.isApproved);
    return this.http.get<ApiResponse<PaginatedResponse<ReviewDto>>>(API_ENDPOINTS.reviews.all, { params: p });
  }

  approve(id: number): Observable<ApiResponse<ReviewDto>> {
    return this.http.patch<ApiResponse<ReviewDto>>(API_ENDPOINTS.reviews.approve(id), {});
  }
}
