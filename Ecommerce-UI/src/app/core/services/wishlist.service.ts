import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import { WishlistItemDto, AddToWishlistDto } from '../models/wishlist.model';
import { CartService } from './cart.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private http = inject(HttpClient);
  private cartService = inject(CartService);

  private wishlistState$ = new BehaviorSubject<WishlistItemDto[]>([]);

  readonly wishlist$ = this.wishlistState$.asObservable();
  readonly wishlistCount$ = this.wishlist$.pipe(map(items => items.length));

  get snapshot(): WishlistItemDto[] { return this.wishlistState$.value; }

  isWishlisted(productId: number): boolean {
    return this.wishlistState$.value.some(item => item.productId === productId);
  }

  loadWishlist(): Observable<ApiResponse<WishlistItemDto[]>> {
    return this.http.get<ApiResponse<WishlistItemDto[]>>(API_ENDPOINTS.wishlist.base).pipe(
      tap(res => { if (res.success && res.data) this.wishlistState$.next(res.data); })
    );
  }

  addToWishlist(dto: AddToWishlistDto): Observable<ApiResponse<WishlistItemDto>> {
    return this.http.post<ApiResponse<WishlistItemDto>>(API_ENDPOINTS.wishlist.items, dto).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.wishlistState$.next([...this.wishlistState$.value, res.data]);
        }
      })
    );
  }

  removeItem(itemId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(API_ENDPOINTS.wishlist.item(itemId)).pipe(
      tap(res => {
        if (res.success) {
          this.wishlistState$.next(this.wishlistState$.value.filter(i => i.itemId !== itemId));
        }
      })
    );
  }

  clearWishlist(): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(API_ENDPOINTS.wishlist.base).pipe(
      tap(res => { if (res.success) this.wishlistState$.next([]); })
    );
  }

  moveToCart(itemId: number): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(API_ENDPOINTS.wishlist.moveToCart(itemId), {}).pipe(
      tap(res => {
        if (res.success) {
          this.wishlistState$.next(this.wishlistState$.value.filter(i => i.itemId !== itemId));
          this.cartService.getCart().subscribe();
        }
      })
    );
  }
}
