import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { UserListDto, UpdateVendorKycStatusDto } from '../models/user.model';
import { API_ENDPOINTS } from '../constants/api.constants';

export interface UserListParams {
  page?: number;
  pageSize?: number;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  getUsers(params: UserListParams = {}): Observable<ApiResponse<PaginatedResponse<UserListDto>>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PaginatedResponse<UserListDto>>>(API_ENDPOINTS.admin.users, { params: httpParams });
  }

  enableDisableUser(userId: string, isActive: boolean): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${API_ENDPOINTS.admin.users}/${userId}/status`, { isActive });
  }

  deleteUser(userId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${API_ENDPOINTS.admin.users}/${userId}`);
  }

  getCustomers(params: UserListParams = {}): Observable<ApiResponse<PaginatedResponse<UserListDto>>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PaginatedResponse<UserListDto>>>(API_ENDPOINTS.admin.customers, { params: httpParams });
  }

  getVendors(params: UserListParams = {}): Observable<ApiResponse<PaginatedResponse<UserListDto>>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PaginatedResponse<UserListDto>>>(API_ENDPOINTS.admin.vendors, { params: httpParams });
  }

  updateVendorKycStatus(vendorId: string, dto: UpdateVendorKycStatusDto): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${API_ENDPOINTS.admin.vendors}/${vendorId}/kyc`, dto);
  }

  private buildParams(params: UserListParams): HttpParams {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return httpParams;
  }
}
