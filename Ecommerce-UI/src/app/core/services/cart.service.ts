import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import { CartDto, AddToCartDto, UpdateCartItemDto } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);

  private cartState$ = new BehaviorSubject<CartDto | null>(null);

  readonly cart$ = this.cartState$.asObservable();
  readonly cartCount$ = this.cart$.pipe(map(c => c?.itemCount ?? 0));

  get cartSnapshot(): CartDto | null { return this.cartState$.value; }

  getCart(): Observable<ApiResponse<CartDto>> {
    return this.http.get<ApiResponse<CartDto>>(API_ENDPOINTS.cart.base).pipe(
      tap(res => { if (res.success && res.data) this.cartState$.next(res.data); })
    );
  }

  addItem(dto: AddToCartDto): Observable<ApiResponse<CartDto>> {
    return this.http.post<ApiResponse<CartDto>>(API_ENDPOINTS.cart.items, dto).pipe(
      tap(res => { if (res.success && res.data) this.cartState$.next(res.data); })
    );
  }

  updateItem(itemId: number, dto: UpdateCartItemDto): Observable<ApiResponse<CartDto>> {
    return this.http.put<ApiResponse<CartDto>>(API_ENDPOINTS.cart.item(itemId), dto).pipe(
      tap(res => { if (res.success && res.data) this.cartState$.next(res.data); })
    );
  }

  removeItem(itemId: number): Observable<ApiResponse<CartDto>> {
    return this.http.delete<ApiResponse<CartDto>>(API_ENDPOINTS.cart.item(itemId)).pipe(
      tap(res => { if (res.success && res.data) this.cartState$.next(res.data); })
    );
  }

  clearCart(): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(API_ENDPOINTS.cart.base).pipe(
      tap(res => { if (res.success) this.cartState$.next({ items: [], itemCount: 0, subtotal: 0 }); })
    );
  }
}
