import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserListDto } from '../../../core/models/user.model';
import { TableColumn } from '../../../core/models/api-response.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { KycStatus } from '../../../core/enums/kyc-status.enum';
import { ITEMS_PER_PAGE } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-admin-vendors',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DataTableComponent, PaginationComponent, ConfirmationDialogComponent],
  templateUrl: './vendors.component.html'
})
export class AdminVendorsComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  vendors: UserListDto[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  total = 0;
  pageSize = ITEMS_PER_PAGE;

  confirmDialog = { visible: false, title: '', message: '', action: '' as 'delete' | 'toggle', vendorId: '', isActive: false };
  kycDialog = { visible: false, vendorId: '', action: '' as 'approve' | 'reject', rejectionReason: '' };

  columns: TableColumn[] = [
    { key: 'fullName', label: 'Vendor', sortable: false, type: 'avatar' },
    { key: 'email', label: 'Email' },
    { key: 'isActive', label: 'Status', type: 'badge', badgeClass: (v) => v === 'true' ? 'bg-success' : 'bg-secondary' },
    { key: 'createdAt', label: 'Joined', type: 'date', sortable: false },
    { key: 'actions', label: 'Actions', type: 'actions' }
  ];

  ngOnInit(): void { this.loadVendors(); }

  loadVendors(): void {
    this.loading = true;
    this.adminService.getVendors({ page: this.currentPage, pageSize: this.pageSize }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) { this.vendors = res.data.items; this.total = res.data.total; this.totalPages = res.data.totalPages; }
      },
      error: () => { this.loading = false; this.vendors = this.getMockVendors(); this.total = 3; this.totalPages = 1; }
    });
  }

  onPageChange(page: number): void { this.currentPage = page; this.loadVendors(); }

  onAction(event: { action: string; row: Record<string, unknown> }): void {
    const vendor = event.row as unknown as UserListDto;
    if (event.action === 'toggle') {
      this.confirmDialog = { visible: true, title: vendor.isActive ? 'Disable Vendor' : 'Enable Vendor', message: `${vendor.isActive ? 'Disable' : 'Enable'} vendor "${vendor.firstName} ${vendor.lastName}"?`, action: 'toggle', vendorId: vendor.id, isActive: vendor.isActive };
    } else if (event.action === 'delete') {
      this.confirmDialog = { visible: true, title: 'Delete Vendor', message: `Delete vendor "${vendor.firstName} ${vendor.lastName}"? This cannot be undone.`, action: 'delete', vendorId: vendor.id, isActive: vendor.isActive };
    } else if (event.action === 'approveKyc') {
      this.kycDialog = { visible: true, vendorId: vendor.id, action: 'approve', rejectionReason: '' };
    } else if (event.action === 'rejectKyc') {
      this.kycDialog = { visible: true, vendorId: vendor.id, action: 'reject', rejectionReason: '' };
    }
  }

  confirmAction(): void {
    this.confirmDialog.visible = false;
    if (this.confirmDialog.action === 'delete') {
      this.adminService.deleteUser(this.confirmDialog.vendorId).subscribe({ next: () => { this.toast.success('Vendor deleted.'); this.loadVendors(); } });
    } else if (this.confirmDialog.action === 'toggle') {
      this.adminService.enableDisableUser(this.confirmDialog.vendorId, !this.confirmDialog.isActive).subscribe({ next: () => { this.toast.success('Status updated.'); this.loadVendors(); } });
    }
  }

  confirmKycAction(): void {
    const dto = this.kycDialog.action === 'approve'
      ? { status: KycStatus.Approved }
      : { status: KycStatus.Rejected, rejectionReason: this.kycDialog.rejectionReason };

    this.adminService.updateVendorKycStatus(this.kycDialog.vendorId, dto).subscribe({
      next: () => {
        this.toast.success(`KYC ${this.kycDialog.action === 'approve' ? 'approved' : 'rejected'}.`);
        this.kycDialog.visible = false;
        this.loadVendors();
      },
      error: () => { this.kycDialog.visible = false; }
    });
  }

  get tableData(): Record<string, unknown>[] {
    return this.vendors.map(v => ({
      ...v,
      fullName: `${v.firstName} ${v.lastName}`,
      isActive: String(v.isActive)
    }));
  }

  private getMockVendors(): UserListDto[] {
    return [
      { id: '1', firstName: 'Tech', lastName: 'Supplies', email: 'tech@vendor.com', roles: ['Vendor'], isActive: true, createdAt: new Date().toISOString() },
      { id: '2', firstName: 'Fashion', lastName: 'Hub', email: 'fashion@vendor.com', roles: ['Vendor'], isActive: true, createdAt: new Date().toISOString() },
      { id: '3', firstName: 'Home', lastName: 'Decor', email: 'home@vendor.com', roles: ['Vendor'], isActive: false, createdAt: new Date().toISOString() }
    ];
  }
}
