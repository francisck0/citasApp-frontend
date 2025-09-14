/**
 * Interceptor HTTP para manejo automático de errores
 */

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, retry, delay } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ErrorHandlerService, AppError } from '../services/error-handler.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private errorHandler: ErrorHandlerService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {

    // Verificar configuraciones de manejo de errores
    const skipErrorHandling = request.headers.get('X-Skip-Error-Handling') === 'true';
    const skipToast = request.headers.get('X-Skip-Error-Toast') === 'true';
    const retryAttempts = parseInt(request.headers.get('X-Retry-Attempts') || '0');

    // Limpiar headers custom
    const cleanRequest = request.clone({
      headers: request.headers
        .delete('X-Skip-Error-Handling')
        .delete('X-Skip-Error-Toast')
        .delete('X-Retry-Attempts')
    });

    let requestObservable = next.handle(cleanRequest);

    // Agregar retry si se especifica
    if (retryAttempts > 0) {
      requestObservable = requestObservable.pipe(
        retry({
          count: retryAttempts,
          delay: (error: HttpErrorResponse, retryCount: number) => {
            // Solo reintentar en ciertos casos
            if (this.shouldRetry(error)) {
              const delayMs = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff
              return delay(delayMs);
            }
            throw error;
          }
        })
      );
    }

    return requestObservable.pipe(
      catchError((error: HttpErrorResponse) => {
        if (skipErrorHandling) {
          return throwError(() => error);
        }

        return this.handleError(error, request, skipToast);
      })
    );
  }

  private handleError(
    error: HttpErrorResponse,
    originalRequest: HttpRequest<any>,
    skipToast: boolean
  ): Observable<never> {
    const appError = this.errorHandler.handleHttpError(error, this.getRequestContext(originalRequest));

    // Log del error
    this.errorHandler.logError(appError, {
      url: originalRequest.url,
      method: originalRequest.method
    });

    // Manejo específico por tipo de error
    switch (error.status) {
      case 401:
        return this.handle401Error(error, originalRequest, appError, skipToast);
      case 403:
        return this.handle403Error(appError, skipToast);
      case 404:
        return this.handle404Error(appError, skipToast);
      case 429:
        return this.handle429Error(appError, skipToast);
      case 500:
      case 502:
      case 503:
      case 504:
        return this.handle5xxError(appError, skipToast);
      default:
        return this.handleGenericError(appError, skipToast);
    }
  }

  private handle401Error(
    error: HttpErrorResponse,
    originalRequest: HttpRequest<any>,
    appError: AppError,
    skipToast: boolean
  ): Observable<never> {
    // Si es un endpoint de refresh token, no intentar refrescar
    if (originalRequest.url.includes('/refresh')) {
      this.authService.logout();
      if (!skipToast) {
        this.errorHandler.showError(appError);
      }
      return throwError(() => appError);
    }

    // Si ya se intentó refrescar el token, logout
    if (originalRequest.headers.has('X-Refresh-Attempted')) {
      this.authService.logout();
      if (!skipToast) {
        this.errorHandler.showError(appError);
      }
      return throwError(() => appError);
    }

    // Intentar refrescar el token
    return this.authService.refreshToken().pipe(
      switchMap(() => {
        // Reintentar la request original con el nuevo token
        const retryRequest = originalRequest.clone({
          headers: originalRequest.headers.set('X-Refresh-Attempted', 'true')
        });
        return next.handle(retryRequest);
      }),
      catchError((refreshError) => {
        // Si falla el refresh, hacer logout
        this.authService.logout();
        if (!skipToast) {
          this.errorHandler.showError(appError);
        }
        return throwError(() => appError);
      })
    );
  }

  private handle403Error(appError: AppError, skipToast: boolean): Observable<never> {
    if (!skipToast) {
      this.errorHandler.showError(appError, {
        label: 'Ir al Dashboard',
        action: () => this.router.navigate(['/dashboard'])
      });
    }
    return throwError(() => appError);
  }

  private handle404Error(appError: AppError, skipToast: boolean): Observable<never> {
    if (!skipToast) {
      this.errorHandler.showError(appError);
    }
    return throwError(() => appError);
  }

  private handle429Error(appError: AppError, skipToast: boolean): Observable<never> {
    if (!skipToast) {
      this.errorHandler.showError(appError, {
        label: 'Entendido',
        action: () => {}
      });
    }
    return throwError(() => appError);
  }

  private handle5xxError(appError: AppError, skipToast: boolean): Observable<never> {
    if (!skipToast) {
      const actions = this.errorHandler.getErrorActions(appError);
      this.errorHandler.showError(appError, actions[0]);
    }
    return throwError(() => appError);
  }

  private handleGenericError(appError: AppError, skipToast: boolean): Observable<never> {
    if (!skipToast) {
      this.errorHandler.showError(appError);
    }
    return throwError(() => appError);
  }

  private shouldRetry(error: HttpErrorResponse): boolean {
    // Solo reintentar en errores temporales
    return error.status === 0 || // Network error
           error.status === 408 || // Request timeout
           error.status === 429 || // Too many requests
           error.status >= 500;    // Server errors
  }

  private getRequestContext(request: HttpRequest<any>): string {
    const method = request.method.toUpperCase();
    const url = request.url.split('/').pop() || request.url;
    return `${method} ${url}`;
  }
}

/**
 * Helper para configurar requests con manejo de errores personalizado
 */
export class ErrorHttpHelper {
  /**
   * Agrega headers para omitir el manejo automático de errores
   */
  static skipErrorHandling(request: HttpRequest<any>): HttpRequest<any> {
    return request.clone({
      headers: request.headers.set('X-Skip-Error-Handling', 'true')
    });
  }

  /**
   * Agrega headers para omitir solo los toast de error
   */
  static skipErrorToast(request: HttpRequest<any>): HttpRequest<any> {
    return request.clone({
      headers: request.headers.set('X-Skip-Error-Toast', 'true')
    });
  }

  /**
   * Agrega headers para configurar reintentos automáticos
   */
  static withRetry(request: HttpRequest<any>, attempts: number): HttpRequest<any> {
    return request.clone({
      headers: request.headers.set('X-Retry-Attempts', attempts.toString())
    });
  }

  /**
   * Combinación de configuraciones comunes
   */
  static silent(request: HttpRequest<any>): HttpRequest<any> {
    return this.skipErrorToast(this.skipErrorHandling(request));
  }

  static withRetryAndSilent(request: HttpRequest<any>, attempts: number): HttpRequest<any> {
    return this.silent(this.withRetry(request, attempts));
  }
}