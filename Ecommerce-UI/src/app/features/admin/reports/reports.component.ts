import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DatePipe, CurrencyPipe, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../core/services/report.service';
import { ToastService } from '../../../core/services/toast.service';
import { SalesReportDto, InventoryReportDto, ReportRequestDto } from '../../../core/models/report.model';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, FormsModule],
  templateUrl: './reports.component.html'
})
export class AdminReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private toast = inject(ToastService);
  private platformId = inject(PLATFORM_ID);

  activeTab: 'sales' | 'inventory' = 'sales';

  salesForm = { fromDate: '', toDate: '', vendorId: '' };
  salesReport: SalesReportDto | null = null;
  loadingSales = false;
  exportingSales = false;

  inventoryReport: InventoryReportDto | null = null;
  loadingInventory = false;
  exportingInventory = false;

  ngOnInit(): void {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    this.salesForm.fromDate = this.toDateInput(first);
    this.salesForm.toDate = this.toDateInput(now);
  }

  private toDateInput(d: Date): string {
    return d.toISOString().substring(0, 10);
  }

  generateSalesReport(): void {
    if (!this.salesForm.fromDate || !this.salesForm.toDate) return;
    this.loadingSales = true;
    const dto: ReportRequestDto = {
      fromDate: this.salesForm.fromDate,
      toDate: this.salesForm.toDate,
      vendorId: this.salesForm.vendorId || undefined
    };
    this.reportService.getSalesReport(dto).subscribe({
      next: (res) => {
        this.loadingSales = false;
        this.salesReport = res.success && res.data ? res.data : null;
        if (!res.success) this.toast.error(res.message, 'Error');
      },
      error: () => { this.loadingSales = false; }
    });
  }

  exportSalesReport(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.exportingSales = true;
    const dto: ReportRequestDto = {
      fromDate: this.salesForm.fromDate,
      toDate: this.salesForm.toDate,
      vendorId: this.salesForm.vendorId || undefined
    };
    this.reportService.exportSalesReport(dto).subscribe({
      next: (blob) => {
        this.exportingSales = false;
        this.downloadBlob(blob, `sales-report-${this.salesForm.fromDate}-${this.salesForm.toDate}.csv`);
      },
      error: () => { this.exportingSales = false; this.toast.error('Export failed.', 'Error'); }
    });
  }

  loadInventoryReport(): void {
    this.loadingInventory = true;
    this.reportService.getInventoryReport().subscribe({
      next: (res) => {
        this.loadingInventory = false;
        this.inventoryReport = res.success && res.data ? res.data : null;
        if (!res.success) this.toast.error(res.message, 'Error');
      },
      error: () => { this.loadingInventory = false; }
    });
  }

  exportInventoryReport(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.exportingInventory = true;
    this.reportService.exportInventoryReport().subscribe({
      next: (blob) => {
        this.exportingInventory = false;
        this.downloadBlob(blob, 'inventory-report.csv');
      },
      error: () => { this.exportingInventory = false; this.toast.error('Export failed.', 'Error'); }
    });
  }

  get maxDailyRevenue(): number {
    return Math.max(...(this.salesReport?.dailyBreakdown.map(d => d.revenue) ?? [1]), 1);
  }

  stockBadgeClass(status: string): string {
    const map: Record<string, string> = {
      InStock: 'bg-success',
      LowStock: 'bg-warning text-dark',
      OutOfStock: 'bg-danger'
    };
    return map[status] ?? 'bg-secondary';
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
