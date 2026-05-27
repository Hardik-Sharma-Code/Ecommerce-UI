import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import {
  OrderDto, OrderSummaryDto, PlaceOrderDto, CancelOrderDto,
  UpdateOrderStatusDto, OrderListParams, OrderStatus
} from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);

  getMyOrders(params: OrderListParams = {}): Observable<ApiResponse<PaginatedResponse<OrderSummaryDto>>> {
    let p = new HttpParams();
    if (params.page) p = p.set('page', params.page);
    if (params.pageSize) p = p.set('pageSize', params.pageSize);
    return this.http.get<ApiResponse<PaginatedResponse<OrderSummaryDto>>>(API_ENDPOINTS.order.my, { params: p });
  }

  getById(id: number): Observable<ApiResponse<OrderDto>> {
    return this.http.get<ApiResponse<OrderDto>>(API_ENDPOINTS.order.byId(id));
  }

  placeOrder(dto: PlaceOrderDto): Observable<ApiResponse<OrderDto>> {
    return this.http.post<ApiResponse<OrderDto>>(API_ENDPOINTS.order.my, dto);
  }

  cancelOrder(id: number, dto: CancelOrderDto): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(API_ENDPOINTS.order.cancel(id), dto);
  }

  getAllOrders(params: OrderListParams = {}): Observable<ApiResponse<PaginatedResponse<OrderSummaryDto>>> {
    let p = new HttpParams();
    if (params.page) p = p.set('page', params.page);
    if (params.pageSize) p = p.set('pageSize', params.pageSize);
    if (params.status !== undefined) p = p.set('status', params.status);
    return this.http.get<ApiResponse<PaginatedResponse<OrderSummaryDto>>>(API_ENDPOINTS.order.all, { params: p });
  }

  updateStatus(id: number, dto: UpdateOrderStatusDto): Observable<ApiResponse<OrderDto>> {
    return this.http.patch<ApiResponse<OrderDto>>(API_ENDPOINTS.order.status(id), dto);
  }
}
