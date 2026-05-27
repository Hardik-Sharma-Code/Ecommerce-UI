import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import { CategoryDto, CategoryTreeNode, CreateCategoryDto, UpdateCategoryDto } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);

  getAll(): Observable<ApiResponse<CategoryDto[]>> {
    return this.http.get<ApiResponse<CategoryDto[]>>(API_ENDPOINTS.categories.list);
  }

  getTree(): Observable<ApiResponse<CategoryTreeNode[]>> {
    return this.http.get<ApiResponse<CategoryTreeNode[]>>(API_ENDPOINTS.categories.tree);
  }

  getById(id: string): Observable<ApiResponse<CategoryDto>> {
    return this.http.get<ApiResponse<CategoryDto>>(API_ENDPOINTS.categories.byId(id));
  }

  getBySlug(slug: string): Observable<ApiResponse<CategoryDto>> {
    return this.http.get<ApiResponse<CategoryDto>>(API_ENDPOINTS.categories.bySlug(slug));
  }

  getSubcategories(id: string): Observable<ApiResponse<CategoryDto[]>> {
    return this.http.get<ApiResponse<CategoryDto[]>>(API_ENDPOINTS.categories.subcategories(id));
  }

  create(dto: CreateCategoryDto): Observable<ApiResponse<CategoryDto>> {
    return this.http.post<ApiResponse<CategoryDto>>(API_ENDPOINTS.categories.list, dto);
  }

  update(id: string, dto: UpdateCategoryDto): Observable<ApiResponse<CategoryDto>> {
    return this.http.put<ApiResponse<CategoryDto>>(API_ENDPOINTS.categories.byId(id), dto);
  }

  delete(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(API_ENDPOINTS.categories.byId(id));
  }
}
