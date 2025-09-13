import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (authService.isAuthenticated()) {
    // Opcional: verificar roles específicos si la ruta los requiere
    const requiredRoles = route.data?.['roles'] as ('USUARIO' | 'ADMIN' | 'PROFESIONAL')[];
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => authService.hasRole(role));

      if (!hasRequiredRole) {
        // Redirigir a página de acceso denegado o dashboard
        router.navigate(['/dashboard'], {
          queryParams: { message: 'access-denied' }
        });
        return false;
      }
    }

    return true;
  }

  // Si no está autenticado, intentar refresh del token si está disponible
  const refreshToken = authService.getRefreshToken();
  if (refreshToken) {
    return authService.refreshToken().pipe(
      map(() => {
        // Token refreshed successfully
        return true;
      }),
      catchError(() => {
        // Refresh failed, redirect to login
        handleAuthFailure(router, state.url);
        return of(false);
      })
    );
  }

  // No hay token ni refresh token, redirigir a login
  handleAuthFailure(router, state.url);
  return false;
};

// Guard para usuarios ya autenticados (ej: página de login)
export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

// Guard para verificar roles específicos
export const roleGuard = (allowedRoles: ('USUARIO' | 'ADMIN' | 'PROFESIONAL')[]) => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    const hasRequiredRole = allowedRoles.some(role => authService.hasRole(role));

    if (!hasRequiredRole) {
      router.navigate(['/dashboard'], {
        queryParams: { message: 'insufficient-permissions' }
      });
      return false;
    }

    return true;
  };
};

// Guard para verificar si el usuario ha completado su perfil
export const profileCompleteGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const user = authService.getCurrentUser();
  if (user && (!user.nombre || !user.apellidos)) {
    router.navigate(['/perfil'], {
      queryParams: { message: 'complete-profile' }
    });
    return false;
  }

  return true;
};

// Función helper para manejar fallos de autenticación
function handleAuthFailure(router: Router, returnUrl: string) {
  // Guardar la URL a la que el usuario quería ir para redirigir después del login
  const redirectUrl = returnUrl !== '/login' ? returnUrl : '/dashboard';

  router.navigate(['/login'], {
    queryParams: {
      returnUrl: redirectUrl,
      message: 'session-expired'
    }
  });
}