import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { CategoryDto, CreateCategoryDto } from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DatePipe],
  templateUrl: './categories.component.html'
})
export class AdminCategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  categories: CategoryDto[] = [];
  loading = false;
  saving = false;
  showModal = false;
  editingId: string | null = null;
  deleteTarget: CategoryDto | null = null;
  showDeleteConfirm = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    parentId: [''],
    imageUrl: [''],
    isActive: [true],
    displayOrder: [0]
  });

  get name() { return this.form.get('name')!; }

  get parentCategories(): CategoryDto[] {
    if (!this.editingId) return this.categories;
    return this.categories.filter(c => c.id !== this.editingId);
  }

  ngOnInit(): void { this.loadCategories(); }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (res) => {
        this.loading = false;
        this.categories = res.success && res.data ? res.data : this.getMockCategories();
      },
      error: () => {
        this.loading = false;
        this.categories = this.getMockCategories();
      }
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({ name: '', description: '', parentId: '', imageUrl: '', isActive: true, displayOrder: 0 });
    this.showModal = true;
  }

  openEdit(cat: CategoryDto): void {
    this.editingId = cat.id;
    this.form.patchValue({
      name: cat.name,
      description: cat.description ?? '',
      parentId: cat.parentId ?? '',
      imageUrl: cat.imageUrl ?? '',
      isActive: cat.isActive,
      displayOrder: cat.displayOrder
    });
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;

    const raw = this.form.getRawValue();
    const dto: CreateCategoryDto = {
      name: raw.name!,
      description: raw.description || undefined,
      parentId: raw.parentId || undefined,
      imageUrl: raw.imageUrl || undefined,
      isActive: raw.isActive ?? true,
      displayOrder: raw.displayOrder ?? 0
    };

    const req = this.editingId
      ? this.categoryService.update(this.editingId, dto)
      : this.categoryService.create(dto);

    req.subscribe({
      next: (res) => {
        this.saving = false;
        if (res.success) {
          this.toast.success(this.editingId ? 'Category updated.' : 'Category created.', 'Success');
          this.closeModal();
          this.loadCategories();
        } else {
          this.toast.error(res.message, 'Error');
        }
      },
      error: () => { this.saving = false; }
    });
  }

  confirmDelete(cat: CategoryDto): void {
    this.deleteTarget = cat;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.deleteTarget = null;
    this.showDeleteConfirm = false;
  }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.categoryService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.toast.success('Category deleted.', 'Deleted');
        this.cancelDelete();
        this.loadCategories();
      },
      error: () => { this.cancelDelete(); }
    });
  }

  private getMockCategories(): CategoryDto[] {
    return [
      { id: '1', name: 'Electronics', slug: 'electronics', description: 'Electronic devices', isActive: true, displayOrder: 1, productCount: 45, createdAt: new Date().toISOString() },
      { id: '2', name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel', isActive: true, displayOrder: 2, productCount: 120, createdAt: new Date().toISOString() },
      { id: '3', name: 'Smartphones', slug: 'smartphones', description: 'Mobile phones', parentId: '1', parentName: 'Electronics', isActive: true, displayOrder: 1, productCount: 20, createdAt: new Date().toISOString() },
      { id: '4', name: 'Laptops', slug: 'laptops', description: 'Notebook computers', parentId: '1', parentName: 'Electronics', isActive: true, displayOrder: 2, productCount: 15, createdAt: new Date().toISOString() },
      { id: '5', name: 'Men\'s Wear', slug: 'mens-wear', parentId: '2', parentName: 'Clothing', isActive: true, displayOrder: 1, productCount: 60, createdAt: new Date().toISOString() },
    ];
  }
}
