export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type PagedResult<T> = PaginatedResponse<T>;

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'badge' | 'date' | 'actions' | 'avatar';
  badgeClass?: (value: string) => string;
}

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc';
}
