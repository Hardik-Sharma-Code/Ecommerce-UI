import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CategoryDto } from '../../../../core/models/category.model';
import { UpdateProductDto } from '../../../../core/models/product.model';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './edit-product.component.html'
})
export class EditProductComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  productId = '';
  categories: CategoryDto[] = [];
  saving = false;
  loading = true;

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
    this.productId = this.route.snapshot.paramMap.get('id') ?? '';
    this.categoryService.getAll().subscribe({
      next: (res) => { if (res.success && res.data) this.categories = res.data; },
      error: () => {}
    });
    this.productService.getById(this.productId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          const p = res.data;
          this.form.patchValue({
            name: p.name,
            shortDescription: p.shortDescription ?? '',
            description: p.description ?? '',
            price: p.price,
            discountedPrice: p.discountedPrice ?? null,
            stockQuantity: p.stockQuantity,
            sku: p.sku ?? '',
            categoryId: p.categoryId,
            imageUrl: p.imageUrl ?? '',
            isActive: p.isActive,
            isFeatured: p.isFeatured,
          });
        }
      },
      error: () => { this.loading = false; }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;

    const raw = this.form.getRawValue();
    const dto: UpdateProductDto = {
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

    this.productService.update(this.productId, dto).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.success) {
          this.toast.success('Product updated successfully.', 'Updated');
          this.router.navigate(['/vendor/products']);
        } else {
          this.toast.error(res.message, 'Error');
        }
      },
      error: () => { this.saving = false; }
    });
  }
}
