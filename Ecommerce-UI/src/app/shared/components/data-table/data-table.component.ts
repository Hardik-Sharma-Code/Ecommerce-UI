import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableColumn, SortEvent } from '../../../core/models/api-response.model';
import { NoDataComponent } from '../no-data/no-data.component';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [DatePipe, NoDataComponent],
  templateUrl: './data-table.component.html'
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: Record<string, unknown>[] = [];
  @Input() loading = false;
  @Input() sortColumn = '';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';

  @Output() sortChange = new EventEmitter<SortEvent>();
  @Output() actionClick = new EventEmitter<{ action: string; row: Record<string, unknown> }>();

  sort(column: string): void {
    if (!this.columns.find(c => c.key === column)?.sortable) return;
    const direction = this.sortColumn === column && this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ column, direction });
  }

  onAction(action: string, row: Record<string, unknown>): void {
    this.actionClick.emit({ action, row });
  }

  getCellValue(row: Record<string, unknown>, key: string): unknown {
    return key.split('.').reduce((obj, k) => (obj as Record<string, unknown>)?.[k], row as unknown);
  }

  getBadgeClass(col: TableColumn, value: unknown): string {
    return col.badgeClass ? col.badgeClass(String(value)) : 'bg-secondary';
  }
}
