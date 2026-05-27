export interface ReportRequestDto {
  fromDate: string;
  toDate: string;
  vendorId?: string;
}

export interface DailySalesDto {
  date: string;
  orderCount: number;
  revenue: number;
}

export interface SalesReportDto {
  fromDate: string;
  toDate: string;
  totalOrders: number;
  totalRevenue: number;
  totalDiscount: number;
  totalTax: number;
  netRevenue: number;
  dailyBreakdown: DailySalesDto[];
}

export interface InventoryItemDto {
  productId: number;
  productName: string;
  sku: string;
  stockQuantity: number;
  price: number;
  status: string;
}

export interface InventoryReportDto {
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  items: InventoryItemDto[];
}
