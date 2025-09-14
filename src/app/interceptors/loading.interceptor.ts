/**
 * Interceptor HTTP para manejo automático de estados de carga
 */

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export interface LoadingConfig {
  skipLoading?: boolean;
  loadingId?: string;
  loadingMessage?: string;
}

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {

    // Verificar si la request tiene configuración de loading
    const skipLoading = request.headers.get('X-Skip-Loading') === 'true';
    const loadingId = request.headers.get('X-Loading-Id') || this.generateLoadingId(request);
    const loadingMessage = request.headers.get('X-Loading-Message') || undefined;

    // Limpiar headers custom para que no se envíen al servidor
    const cleanRequest = request.clone({
      headers: request.headers
        .delete('X-Skip-Loading')
        .delete('X-Loading-Id')
        .delete('X-Loading-Message')
    });

    // Si se debe omitir el loading, continuar normalmente
    if (skipLoading) {
      return next.handle(cleanRequest);
    }

    // Iniciar loading
    this.loadingService.startLoading(loadingId, loadingMessage);

    let finished = false;

    return next.handle(cleanRequest).pipe(
      tap({
        next: (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse && !finished) {
            finished = true;
            this.loadingService.stopLoading(loadingId);
          }
        },
        error: (error: HttpErrorResponse) => {
          if (!finished) {
            finished = true;
            this.loadingService.stopLoading(loadingId);
          }
        }
      }),
      finalize(() => {
        if (!finished) {
          this.loadingService.stopLoading(loadingId);
        }
      })
    );
  }

  private generateLoadingId(request: HttpRequest<any>): string {
    // Generar ID único basado en método y URL
    const method = request.method.toLowerCase();
    const url = request.url.split('?')[0]; // Remover query params
    const timestamp = Date.now();

    return `${method}-${this.hashCode(url)}-${timestamp}`;
  }

  private hashCode(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash);
  }
}

/**
 * Utilidad para configurar requests con loading personalizado
 */
export class LoadingHttpHelper {

  /**
   * Agrega headers para omitir el loading automático
   */
  static skipLoading(request: HttpRequest<any>): HttpRequest<any> {
    return request.clone({
      headers: request.headers.set('X-Skip-Loading', 'true')
    });
  }

  /**
   * Agrega headers para personalizar el loading
   */
  static withLoading(
    request: HttpRequest<any>,
    config: {
      id?: string;
      message?: string;
    }
  ): HttpRequest<any> {
    let headers = request.headers;

    if (config.id) {
      headers = headers.set('X-Loading-Id', config.id);
    }

    if (config.message) {
      headers = headers.set('X-Loading-Message', config.message);
    }

    return request.clone({ headers });
  }

  /**
   * Configuraciones predefinidas para diferentes tipos de operaciones
   */
  static configs = {
    login: { id: 'auth-login', message: 'Iniciando sesión...' },
    register: { id: 'auth-register', message: 'Creando cuenta...' },
    forgotPassword: { id: 'auth-forgot', message: 'Enviando correo...' },
    resetPassword: { id: 'auth-reset', message: 'Restableciendo contraseña...' },
    loadData: { id: 'data-load', message: 'Cargando datos...' },
    saveData: { id: 'data-save', message: 'Guardando...' },
    deleteData: { id: 'data-delete', message: 'Eliminando...' },
    uploadFile: { id: 'file-upload', message: 'Subiendo archivo...' },
    exportData: { id: 'data-export', message: 'Exportando datos...' }
  };
}