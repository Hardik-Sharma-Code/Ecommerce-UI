import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { CustomerProfileDto, CustomerRegistrationDto, UpdateCustomerProfileDto } from '../models/user.model';
import { API_ENDPOINTS } from '../constants/api.constants';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private http = inject(HttpClient);

  register(dto: CustomerRegistrationDto): Observable<ApiResponse<CustomerProfileDto>> {
    return this.http.post<ApiResponse<CustomerProfileDto>>(API_ENDPOINTS.customer.register, dto);
  }

  getProfile(): Observable<ApiResponse<CustomerProfileDto>> {
    return this.http.get<ApiResponse<CustomerProfileDto>>(API_ENDPOINTS.customer.profile);
  }

  updateProfile(dto: UpdateCustomerProfileDto): Observable<ApiResponse<CustomerProfileDto>> {
    return this.http.put<ApiResponse<CustomerProfileDto>>(API_ENDPOINTS.customer.profile, dto);
  }
}
