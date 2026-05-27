import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const auth = inject(AuthService);

  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/refresh-token');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          if (!isAuthEndpoint) {
            auth.logout();
            toast.error('Session expired. Please login again.', 'Unauthorized');
          } else if (error.error?.message) {
            toast.error(error.error.message, 'Login Failed');
          } else {
            toast.error('Invalid email or password.', 'Login Failed');
          }
          break;
        case 400:
          if (error.error?.message) {
            toast.error(error.error.message, 'Error');
          } else if (error.error?.errors?.length) {
            toast.error(error.error.errors[0], 'Validation Error');
          }
          break;
        case 403:
          toast.error('You do not have permission to perform this action.', 'Forbidden');
          router.navigate(['/']);
          break;
        case 404:
          toast.error('The requested resource was not found.', 'Not Found');
          break;
        case 500:
          toast.error('An internal server error occurred. Please try again.', 'Server Error');
          break;
        default:
          if (error.error?.message) {
            toast.error(error.error.message, 'Error');
          }
      }
      return throwError(() => error);
    })
  );
};
