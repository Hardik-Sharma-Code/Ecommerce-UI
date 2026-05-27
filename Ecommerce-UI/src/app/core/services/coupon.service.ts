import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { CouponDto, ApplyCouponDto, CouponValidationResultDto, CreateCouponDto, UpdateCouponDto } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private http = inject(HttpClient);

  validate(dto: ApplyCouponDto): Observable<ApiResponse<CouponValidationResultDto>> {
    return this.http.post<ApiResponse<CouponValidationResultDto>>(API_ENDPOINTS.coupon.validate, dto);
  }

  getByCode(code: string): Observable<ApiResponse<CouponDto>> {
    return this.http.get<ApiResponse<CouponDto>>(API_ENDPOINTS.coupon.byCode(code));
  }

  getAll(page = 1, pageSize = 20): Observable<ApiResponse<PaginatedResponse<CouponDto>>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<ApiResponse<PaginatedResponse<CouponDto>>>(API_ENDPOINTS.coupon.base, { params });
  }

  create(dto: CreateCouponDto): Observable<ApiResponse<CouponDto>> {
    return this.http.post<ApiResponse<CouponDto>>(API_ENDPOINTS.coupon.base, dto);
  }

  update(id: number, dto: UpdateCouponDto): Observable<ApiResponse<CouponDto>> {
    return this.http.put<ApiResponse<CouponDto>>(API_ENDPOINTS.coupon.byId(id), dto);
  }

  delete(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(API_ENDPOINTS.coupon.byId(id));
  }
}
