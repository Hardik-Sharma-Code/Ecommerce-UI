import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CategoryDto } from '../../../../core/models/category.model';
import { CreateProductDto } from '../../../../core/models/product.model';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './create-product.component.html'
})
export class CreateProductComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);
  private router = inject(Router);

  categories: CategoryDto[] = [];
  saving = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    shortDescription: [''],
    description: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    discountedPrice: [null as number | null],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    sku: [''],
    categoryId: ['', Validators.required],
    imageUrl: [''],
    isActive: [true],
    isFeatured: [false],
  });

  get name() { return this.form.get('name')!; }
  get price() { return this.form.get('price')!; }
  get stockQuantity() { return this.form.get('stockQuantity')!; }
  get categoryId() { return this.form.get('categoryId')!; }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => { if (res.success && res.data) this.categories = res.data; },
      error: () => {}
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;

    const raw = this.form.getRawValue();
    const dto: CreateProductDto = {
      name: raw.name!,
      shortDescription: raw.shortDescription || undefined,
      description: raw.description || undefined,
      price: raw.price!,
      discountedPrice: raw.discountedPrice ?? undefined,
      stockQuantity: raw.stockQuantity!,
      sku: raw.sku || undefined,
      categoryId: raw.categoryId!,
      imageUrl: raw.imageUrl || undefined,
      isActive: raw.isActive ?? true,
      isFeatured: raw.isFeatured ?? false,
    };

    this.productService.create(dto).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.success) {
          this.toast.success('Product created successfully.', 'Created');
          this.router.navigate(['/vendor/products']);
        } else {
          this.toast.error(res.message, 'Error');
        }
      },
      error: () => { this.saving = false; }
    });
  }
}
