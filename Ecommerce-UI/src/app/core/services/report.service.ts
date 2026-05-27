import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import { ReportRequestDto, SalesReportDto, InventoryReportDto } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);

  getSalesReport(dto: ReportRequestDto): Observable<ApiResponse<SalesReportDto>> {
    return this.http.post<ApiResponse<SalesReportDto>>(API_ENDPOINTS.reports.sales, dto);
  }

  getInventoryReport(): Observable<ApiResponse<InventoryReportDto>> {
    return this.http.get<ApiResponse<InventoryReportDto>>(API_ENDPOINTS.reports.inventory);
  }

  exportSalesReport(dto: ReportRequestDto): Observable<Blob> {
    return this.http.post(API_ENDPOINTS.reports.exportSales, dto, { responseType: 'blob' });
  }

  exportInventoryReport(): Observable<Blob> {
    return this.http.get(API_ENDPOINTS.reports.exportInventory, { responseType: 'blob' });
  }
}
