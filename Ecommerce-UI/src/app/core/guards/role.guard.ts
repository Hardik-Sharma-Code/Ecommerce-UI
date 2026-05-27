import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../enums/user-role.enum';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn) {
    router.navigate(['/auth/login']);
    return false;
  }

  const allowedRoles: UserRole[] = route.data['roles'] ?? [];
  const userRole = auth.userRole;

  if (!allowedRoles.length || (userRole && allowedRoles.includes(userRole))) {
    return true;
  }

  router.navigate([auth.getDashboardRoute()]);
  return false;
};
