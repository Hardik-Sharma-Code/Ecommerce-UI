import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import { AddressDto, CreateAddressDto, UpdateAddressDto } from '../models/address.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private http = inject(HttpClient);

  getAll(): Observable<ApiResponse<AddressDto[]>> {
    return this.http.get<ApiResponse<AddressDto[]>>(API_ENDPOINTS.address.list);
  }

  getById(id: number): Observable<ApiResponse<AddressDto>> {
    return this.http.get<ApiResponse<AddressDto>>(API_ENDPOINTS.address.byId(id));
  }

  create(dto: CreateAddressDto): Observable<ApiResponse<AddressDto>> {
    return this.http.post<ApiResponse<AddressDto>>(API_ENDPOINTS.address.list, dto);
  }

  update(id: number, dto: UpdateAddressDto): Observable<ApiResponse<AddressDto>> {
    return this.http.put<ApiResponse<AddressDto>>(API_ENDPOINTS.address.byId(id), dto);
  }

  delete(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(API_ENDPOINTS.address.byId(id));
  }

  setDefault(id: number): Observable<ApiResponse<AddressDto>> {
    return this.http.patch<ApiResponse<AddressDto>>(API_ENDPOINTS.address.setDefault(id), {});
  }
}
