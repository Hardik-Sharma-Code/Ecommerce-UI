import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserListDto } from '../../../core/models/user.model';
import { TableColumn } from '../../../core/models/api-response.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ITEMS_PER_PAGE } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [FormsModule, DataTableComponent, PaginationComponent, ConfirmationDialogComponent],
  templateUrl: './customers.component.html'
})
export class AdminCustomersComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  customers: UserListDto[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  total = 0;
  pageSize = ITEMS_PER_PAGE;

  confirmDialog = { visible: false, title: '', message: '', action: '' as 'delete' | 'toggle', customerId: '', isActive: false };

  columns: TableColumn[] = [
    { key: 'fullName', label: 'Customer', sortable: false, type: 'avatar' },
    { key: 'email', label: 'Email', sortable: false },
    { key: 'isActive', label: 'Status', type: 'badge', badgeClass: (v) => v === 'true' ? 'bg-success' : 'bg-secondary' },
    { key: 'createdAt', label: 'Joined', type: 'date', sortable: false },
    { key: 'actions', label: 'Actions', type: 'actions' }
  ];

  ngOnInit(): void { this.loadCustomers(); }

  loadCustomers(): void {
    this.loading = true;
    this.adminService.getCustomers({ page: this.currentPage, pageSize: this.pageSize }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) { this.customers = res.data.items; this.total = res.data.total; this.totalPages = res.data.totalPages; }
      },
      error: () => { this.loading = false; this.customers = this.getMockCustomers(); this.total = 4; this.totalPages = 1; }
    });
  }

  onPageChange(page: number): void { this.currentPage = page; this.loadCustomers(); }

  onAction(event: { action: string; row: Record<string, unknown> }): void {
    const c = event.row as unknown as UserListDto;
    if (event.action === 'toggle') {
      this.confirmDialog = { visible: true, title: c.isActive ? 'Disable Customer' : 'Enable Customer', message: `${c.isActive ? 'Disable' : 'Enable'} "${c.firstName} ${c.lastName}"?`, action: 'toggle', customerId: c.id, isActive: c.isActive };
    } else if (event.action === 'delete') {
      this.confirmDialog = { visible: true, title: 'Delete Customer', message: `Delete customer "${c.firstName} ${c.lastName}"?`, action: 'delete', customerId: c.id, isActive: c.isActive };
    }
  }

  confirmAction(): void {
    this.confirmDialog.visible = false;
    if (this.confirmDialog.action === 'delete') {
      this.adminService.deleteUser(this.confirmDialog.customerId).subscribe({ next: () => { this.toast.success('Customer deleted.'); this.loadCustomers(); } });
    } else {
      this.adminService.enableDisableUser(this.confirmDialog.customerId, !this.confirmDialog.isActive).subscribe({ next: () => { this.toast.success('Status updated.'); this.loadCustomers(); } });
    }
  }

  get tableData(): Record<string, unknown>[] {
    return this.customers.map(c => ({
      ...c,
      fullName: `${c.firstName} ${c.lastName}`,
      isActive: String(c.isActive)
    }));
  }

  private getMockCustomers(): UserListDto[] {
    return [
      { id: '1', firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', roles: ['Customer'], isActive: true, createdAt: new Date().toISOString() },
      { id: '2', firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com', roles: ['Customer'], isActive: true, createdAt: new Date().toISOString() },
      { id: '3', firstName: 'Carol', lastName: 'White', email: 'carol@example.com', roles: ['Customer'], isActive: false, createdAt: new Date().toISOString() },
      { id: '4', firstName: 'Dave', lastName: 'Brown', email: 'dave@example.com', roles: ['Customer'], isActive: true, createdAt: new Date().toISOString() }
    ];
  }
}
