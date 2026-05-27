export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parentName?: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
  productCount?: number;
  createdAt: string;
}

export interface CategoryTreeNode extends CategoryDto {
  children: CategoryTreeNode[];
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
