import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { StorageService } from './storage.service';
import {
  AuthUser, LoginRequest, LoginResponse,
  ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest,
  RefreshTokenRequest, JwtPayload
} from '../models/auth.model';
import { ApiResponse } from '../models/api-response.model';
import { API_ENDPOINTS } from '../constants/api.constants';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '../constants/app.constants';
import { UserRole } from '../enums/user-role.enum';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storage = inject(StorageService);

  private currentUser$ = new BehaviorSubject<AuthUser | null>(this.storage.get<AuthUser>(USER_KEY));

  readonly currentUser = this.currentUser$.asObservable();

  get isLoggedIn(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  get userRoles(): string[] {
    return this.currentUser$.value?.roles ?? [];
  }

  get userRole(): UserRole | null {
    const roles = this.userRoles;
    if (roles.includes(UserRole.Admin)) return UserRole.Admin;
    if (roles.includes(UserRole.Vendor)) return UserRole.Vendor;
    if (roles.includes(UserRole.Customer)) return UserRole.Customer;
    return null;
  }

  get currentUserValue(): AuthUser | null {
    return this.currentUser$.value;
  }

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(API_ENDPOINTS.auth.login, request).pipe(
      tap(response => {
        if (response.success && response.data) {
          const data = response.data;
          this.storage.set(TOKEN_KEY, data.accessToken);
          this.storage.set(REFRESH_TOKEN_KEY, data.refreshToken);
          const user: AuthUser = {
            id: data.userId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            roles: (data.roles ?? []).map((r: string) => r.toLowerCase())
          };
          this.storage.set(USER_KEY, user);
          this.currentUser$.next(user);
        }
      })
    );
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post<ApiResponse>(API_ENDPOINTS.auth.logout, {}).subscribe({ error: () => {} });
    }
    this.storage.remove(TOKEN_KEY);
    this.storage.remove(REFRESH_TOKEN_KEY);
    this.storage.remove(USER_KEY);
    this.currentUser$.next(null);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(request: RefreshTokenRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(API_ENDPOINTS.auth.refreshToken, request).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.storage.set(TOKEN_KEY, response.data.accessToken);
          this.storage.set(REFRESH_TOKEN_KEY, response.data.refreshToken);
        }
      })
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(API_ENDPOINTS.auth.forgotPassword, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(API_ENDPOINTS.auth.resetPassword, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(API_ENDPOINTS.auth.changePassword, request);
  }

  getToken(): string | null {
    return this.storage.get<string>(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.storage.get<string>(REFRESH_TOKEN_KEY);
  }

  getDashboardRoute(): string {
    switch (this.userRole) {
      case UserRole.Admin: return '/admin/dashboard';
      case UserRole.Vendor: return '/vendor/dashboard';
      case UserRole.Customer: return '/customer/dashboard';
      default: return '/auth/login';
    }
  }

  private isTokenExpired(): boolean {
    const token = this.storage.get<string>(TOKEN_KEY);
    if (!token) return true;
    try {
      const payload = this.decodeToken(token);
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private decodeToken(token: string): JwtPayload {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  }
}
