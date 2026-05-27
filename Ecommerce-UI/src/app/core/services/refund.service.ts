import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { RefundDto, RequestRefundDto, ProcessRefundDto, RefundListParams } from '../models/refund.model';

@Injectable({ providedIn: 'root' })
export class RefundService {
  private http = inject(HttpClient);

  requestRefund(dto: RequestRefundDto): Observable<ApiResponse<RefundDto>> {
    return this.http.post<ApiResponse<RefundDto>>(API_ENDPOINTS.refund.request, dto);
  }

  getMyRefunds(): Observable<ApiResponse<RefundDto[]>> {
    return this.http.get<ApiResponse<RefundDto[]>>(API_ENDPOINTS.refund.mine);
  }

  getAllRefunds(params: RefundListParams = {}): Observable<ApiResponse<PaginatedResponse<RefundDto>>> {
    let p = new HttpParams();
    if (params.page != null) p = p.set('page', params.page);
    if (params.pageSize != null) p = p.set('pageSize', params.pageSize);
    if (params.status != null) p = p.set('status', params.status);
    return this.http.get<ApiResponse<PaginatedResponse<RefundDto>>>(API_ENDPOINTS.refund.all, { params: p });
  }

  getById(id: number): Observable<ApiResponse<RefundDto>> {
    return this.http.get<ApiResponse<RefundDto>>(API_ENDPOINTS.refund.byId(id));
  }

  processRefund(id: number, dto: ProcessRefundDto): Observable<ApiResponse<RefundDto>> {
    return this.http.patch<ApiResponse<RefundDto>>(API_ENDPOINTS.refund.process(id), dto);
  }
}
