import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import {
  InitiatePaymentDto, PaymentInitiatedDto, PaymentDto,
  VerifyRazorpayDto, StripeConfirmDto
} from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);

  initiate(dto: InitiatePaymentDto): Observable<ApiResponse<PaymentInitiatedDto>> {
    return this.http.post<ApiResponse<PaymentInitiatedDto>>(API_ENDPOINTS.payment.initiate, dto);
  }

  verifyRazorpay(dto: VerifyRazorpayDto): Observable<ApiResponse<PaymentDto>> {
    return this.http.post<ApiResponse<PaymentDto>>(API_ENDPOINTS.payment.verifyRazorpay, dto);
  }

  confirmStripe(dto: StripeConfirmDto): Observable<ApiResponse<PaymentDto>> {
    return this.http.post<ApiResponse<PaymentDto>>(API_ENDPOINTS.payment.verifyStripe, dto);
  }

  getByOrderId(orderId: number): Observable<ApiResponse<PaymentDto>> {
    return this.http.get<ApiResponse<PaymentDto>>(API_ENDPOINTS.payment.byOrder(orderId));
  }
}
