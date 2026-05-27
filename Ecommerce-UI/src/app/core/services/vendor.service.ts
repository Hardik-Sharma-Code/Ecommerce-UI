import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { VendorProfileDto, VendorRegistrationDto, UpdateVendorProfileDto, KycSubmissionDto, KycStatusDto } from '../models/user.model';
import { API_ENDPOINTS } from '../constants/api.constants';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private http = inject(HttpClient);

  register(dto: VendorRegistrationDto): Observable<ApiResponse<VendorProfileDto>> {
    return this.http.post<ApiResponse<VendorProfileDto>>(API_ENDPOINTS.vendor.register, dto);
  }

  getProfile(): Observable<ApiResponse<VendorProfileDto>> {
    return this.http.get<ApiResponse<VendorProfileDto>>(API_ENDPOINTS.vendor.profile);
  }

  updateProfile(dto: UpdateVendorProfileDto): Observable<ApiResponse<VendorProfileDto>> {
    return this.http.put<ApiResponse<VendorProfileDto>>(API_ENDPOINTS.vendor.profile, dto);
  }

  submitKyc(dto: KycSubmissionDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(API_ENDPOINTS.vendor.kycSubmit, dto);
  }

  getKycStatus(): Observable<ApiResponse<KycStatusDto>> {
    return this.http.get<ApiResponse<KycStatusDto>>(API_ENDPOINTS.vendor.kycStatus);
  }
}
