import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import {
  ShipmentDto, ShippingRateDto, GetShippingRatesDto,
  UpdateTrackingDto, UpdateShipmentStatusDto
} from '../models/shipping.model';

@Injectable({ providedIn: 'root' })
export class ShippingService {
  private http = inject(HttpClient);

  getRates(dto: GetShippingRatesDto): Observable<ApiResponse<ShippingRateDto[]>> {
    const params = new HttpParams()
      .set('postalCode', dto.postalCode)
      .set('country', dto.country)
      .set('orderAmount', dto.orderAmount);
    return this.http.get<ApiResponse<ShippingRateDto[]>>(API_ENDPOINTS.shipping.rates, { params });
  }

  getTracking(orderId: number): Observable<ApiResponse<ShipmentDto>> {
    return this.http.get<ApiResponse<ShipmentDto>>(API_ENDPOINTS.shipping.tracking(orderId));
  }

  updateTracking(orderId: number, dto: UpdateTrackingDto): Observable<ApiResponse<ShipmentDto>> {
    return this.http.post<ApiResponse<ShipmentDto>>(API_ENDPOINTS.shipping.tracking(orderId), dto);
  }

  updateStatus(orderId: number, dto: UpdateShipmentStatusDto): Observable<ApiResponse<ShipmentDto>> {
    return this.http.patch<ApiResponse<ShipmentDto>>(API_ENDPOINTS.shipping.status(orderId), dto);
  }
}
