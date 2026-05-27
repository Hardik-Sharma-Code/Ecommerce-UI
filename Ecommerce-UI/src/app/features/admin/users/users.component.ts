import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserListDto } from '../../../core/models/user.model';
import { TableColumn, PaginatedResponse } from '../../../core/models/api-response.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ITEMS_PER_PAGE } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [FormsModule, DataTableComponent, PaginationComponent, ConfirmationDialogComponent],
  templateUrl: './users.component.html'
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  users: UserListDto[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  total = 0;
  pageSize = ITEMS_PER_PAGE;

  confirmDialog = { visible: false, title: '', message: '', action: '' as 'delete' | 'toggle', userId: '', isActive: false };

  columns: TableColumn[] = [
    { key: 'fullName', label: 'Name', sortable: false, type: 'avatar' },
    { key: 'email', label: 'Email', sortable: false },
    { key: 'roles', label: 'Role', type: 'badge', badgeClass: (v) => v === 'Admin' ? 'bg-danger' : v === 'Vendor' ? 'bg-warning text-dark' : 'bg-primary' },
    { key: 'isActive', label: 'Status', type: 'badge', badgeClass: (v) => v === 'true' ? 'bg-success' : 'bg-secondary' },
    { key: 'createdAt', label: 'Joined', type: 'date', sortable: false },
    { key: 'actions', label: 'Actions', type: 'actions' }
  ];

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers({ page: this.currentPage, pageSize: this.pageSize }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.users = res.data.items;
          this.total = res.data.total;
          this.totalPages = res.data.totalPages;
        }
      },
      error: () => {
        this.loading = false;
        this.users = this.getMockUsers();
        this.total = 5; this.totalPages = 1;
      }
    });
  }

  onPageChange(page: number): void { this.currentPage = page; this.loadUsers(); }

  onAction(event: { action: string; row: Record<string, unknown> }): void {
    const user = event.row as unknown as UserListDto;
    if (event.action === 'delete') {
      this.confirmDialog = { visible: true, title: 'Delete User', message: `Delete "${user.firstName} ${user.lastName}"? This cannot be undone.`, action: 'delete', userId: user.id, isActive: user.isActive };
    } else if (event.action === 'toggle') {
      this.confirmDialog = { visible: true, title: user.isActive ? 'Disable User' : 'Enable User', message: `${user.isActive ? 'Disable' : 'Enable'} "${user.firstName} ${user.lastName}"?`, action: 'toggle', userId: user.id, isActive: user.isActive };
    }
  }

  confirmAction(): void {
    this.confirmDialog.visible = false;
    if (this.confirmDialog.action === 'delete') {
      this.adminService.deleteUser(this.confirmDialog.userId).subscribe({
        next: () => { this.toast.success('User deleted.', 'Deleted'); this.loadUsers(); },
        error: () => {}
      });
    } else {
      this.adminService.enableDisableUser(this.confirmDialog.userId, !this.confirmDialog.isActive).subscribe({
        next: () => { this.toast.success('User status updated.', 'Updated'); this.loadUsers(); },
        error: () => {}
      });
    }
  }

  get tableData(): Record<string, unknown>[] {
    return this.users.map(u => ({
      ...u,
      fullName: `${u.firstName} ${u.lastName}`,
      roles: u.roles[0] ?? '',
      isActive: String(u.isActive)
    }));
  }

  private getMockUsers(): UserListDto[] {
    return [
      { id: '1', firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', roles: ['Customer'], isActive: true, createdAt: new Date().toISOString() },
      { id: '2', firstName: 'Bob', lastName: 'Vendor', email: 'bob@vendor.com', roles: ['Vendor'], isActive: true, createdAt: new Date().toISOString() },
      { id: '3', firstName: 'Carol', lastName: 'Smith', email: 'carol@example.com', roles: ['Customer'], isActive: false, createdAt: new Date().toISOString() },
      { id: '4', firstName: 'Dave', lastName: 'Admin', email: 'dave@admin.com', roles: ['Admin'], isActive: true, createdAt: new Date().toISOString() },
      { id: '5', firstName: 'Eve', lastName: 'Customer', email: 'eve@example.com', roles: ['Customer'], isActive: true, createdAt: new Date().toISOString() }
    ];
  }
}
