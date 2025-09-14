/**
 * Servicio centralizado para manejo de errores HTTP con mensajes user-friendly
 */

import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Observable, throwError } from 'rxjs';

export interface AppError {
  message: string;
  userMessage: string;
  code: string | number;
  details?: any;
  isRecoverable: boolean;
}

export interface ErrorAction {
  label: string;
  action: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private readonly defaultMessages = {
    network: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
    unauthorized: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    forbidden: 'No tienes permisos para realizar esta acción.',
    notFound: 'El recurso solicitado no fue encontrado.',
    validation: 'Los datos proporcionados no son válidos.',
    server: 'Error interno del servidor. Inténtalo más tarde.',
    timeout: 'La operación tardó demasiado tiempo. Inténtalo nuevamente.',
    unknown: 'Ocurrió un error inesperado. Si persiste, contacta al soporte.',
    tooManyRequests: 'Demasiadas solicitudes. Inténtalo más tarde.',
    maintenance: 'El servicio está en mantenimiento. Inténtalo más tarde.'
  };

  private readonly errorMappings = new Map<string, string>([
    // Errores de autenticación
    ['INVALID_CREDENTIALS', 'Email o contraseña incorrectos'],
    ['ACCOUNT_LOCKED', 'Tu cuenta ha sido bloqueada temporalmente'],
    ['EMAIL_NOT_VERIFIED', 'Debes verificar tu email antes de continuar'],
    ['TOKEN_EXPIRED', 'Tu sesión ha expirado'],
    ['INVALID_TOKEN', 'El token de acceso no es válido'],

    // Errores de usuarios
    ['USER_NOT_FOUND', 'Usuario no encontrado'],
    ['EMAIL_ALREADY_EXISTS', 'Ya existe una cuenta con este email'],
    ['USERNAME_TAKEN', 'Este nombre de usuario no está disponible'],
    ['WEAK_PASSWORD', 'La contraseña debe ser más segura'],

    // Errores de negocios
    ['BUSINESS_NOT_FOUND', 'Negocio no encontrado'],
    ['INSUFFICIENT_PERMISSIONS', 'No tienes permisos para esta acción'],
    ['APPOINTMENT_CONFLICT', 'Ya existe una cita en ese horario'],
    ['SLOT_NOT_AVAILABLE', 'El horario seleccionado no está disponible'],

    // Errores de validación
    ['INVALID_DATE_RANGE', 'El rango de fechas no es válido'],
    ['INVALID_EMAIL_FORMAT', 'El formato del email no es válido'],
    ['INVALID_PHONE_FORMAT', 'El formato del teléfono no es válido'],

    // Errores de archivos
    ['FILE_TOO_LARGE', 'El archivo es demasiado grande'],
    ['INVALID_FILE_TYPE', 'Tipo de archivo no permitido'],
    ['UPLOAD_FAILED', 'Error al subir el archivo'],

    // Errores de límites
    ['RATE_LIMIT_EXCEEDED', 'Has superado el límite de solicitudes'],
    ['QUOTA_EXCEEDED', 'Has alcanzado el límite de tu plan'],
    ['MAX_APPOINTMENTS_REACHED', 'Has alcanzado el máximo de citas permitidas']
  ]);

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Maneja errores HTTP y los convierte en errores de aplicación
   */
  handleHttpError(error: HttpErrorResponse, context?: string): AppError {
    let appError: AppError;

    if (error.status === 0) {
      // Error de red
      appError = {
        message: 'Network error',
        userMessage: this.defaultMessages.network,
        code: 'NETWORK_ERROR',
        isRecoverable: true
      };
    } else if (error.status >= 400 && error.status < 500) {
      // Errores del cliente
      appError = this.handleClientError(error);
    } else if (error.status >= 500) {
      // Errores del servidor
      appError = this.handleServerError(error);
    } else {
      // Otros errores
      appError = {
        message: error.message || 'Unknown error',
        userMessage: this.defaultMessages.unknown,
        code: 'UNKNOWN_ERROR',
        isRecoverable: false
      };
    }

    // Agregar contexto si se proporciona
    if (context) {
      appError.details = { ...appError.details, context };
    }

    return appError;
  }

  /**
   * Maneja errores del cliente (4xx)
   */
  private handleClientError(error: HttpErrorResponse): AppError {
    const errorBody = error.error;

    switch (error.status) {
      case 400:
        return this.handleBadRequest(errorBody);
      case 401:
        return {
          message: 'Unauthorized',
          userMessage: this.defaultMessages.unauthorized,
          code: 'UNAUTHORIZED',
          isRecoverable: false,
          details: errorBody
        };
      case 403:
        return {
          message: 'Forbidden',
          userMessage: this.defaultMessages.forbidden,
          code: 'FORBIDDEN',
          isRecoverable: false,
          details: errorBody
        };
      case 404:
        return {
          message: 'Not found',
          userMessage: this.defaultMessages.notFound,
          code: 'NOT_FOUND',
          isRecoverable: false,
          details: errorBody
        };
      case 429:
        return {
          message: 'Too many requests',
          userMessage: this.defaultMessages.tooManyRequests,
          code: 'TOO_MANY_REQUESTS',
          isRecoverable: true,
          details: errorBody
        };
      default:
        return {
          message: `Client error ${error.status}`,
          userMessage: this.defaultMessages.unknown,
          code: `CLIENT_ERROR_${error.status}`,
          isRecoverable: false,
          details: errorBody
        };
    }
  }

  /**
   * Maneja errores del servidor (5xx)
   */
  private handleServerError(error: HttpErrorResponse): AppError {
    const errorBody = error.error;

    switch (error.status) {
      case 503:
        return {
          message: 'Service unavailable',
          userMessage: this.defaultMessages.maintenance,
          code: 'SERVICE_UNAVAILABLE',
          isRecoverable: true,
          details: errorBody
        };
      case 504:
        return {
          message: 'Gateway timeout',
          userMessage: this.defaultMessages.timeout,
          code: 'TIMEOUT',
          isRecoverable: true,
          details: errorBody
        };
      default:
        return {
          message: 'Internal server error',
          userMessage: this.defaultMessages.server,
          code: 'INTERNAL_SERVER_ERROR',
          isRecoverable: true,
          details: errorBody
        };
    }
  }

  /**
   * Maneja errores de validación (400)
   */
  private handleBadRequest(errorBody: any): AppError {
    // Si hay un código específico, usarlo
    if (errorBody?.code && this.errorMappings.has(errorBody.code)) {
      return {
        message: errorBody.message || 'Bad request',
        userMessage: this.errorMappings.get(errorBody.code)!,
        code: errorBody.code,
        isRecoverable: true,
        details: errorBody
      };
    }

    // Si hay errores de validación específicos
    if (errorBody?.errors && Array.isArray(errorBody.errors)) {
      const validationMessages = errorBody.errors
        .map((err: any) => this.formatValidationError(err))
        .filter(Boolean)
        .join(', ');

      return {
        message: 'Validation error',
        userMessage: validationMessages || this.defaultMessages.validation,
        code: 'VALIDATION_ERROR',
        isRecoverable: true,
        details: errorBody
      };
    }

    // Mensaje genérico de validación
    return {
      message: 'Bad request',
      userMessage: errorBody?.message || this.defaultMessages.validation,
      code: 'BAD_REQUEST',
      isRecoverable: true,
      details: errorBody
    };
  }

  /**
   * Formatea errores de validación específicos
   */
  private formatValidationError(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error.field && error.message) {
      const fieldTranslations: Record<string, string> = {
        'email': 'Email',
        'password': 'Contraseña',
        'nombre': 'Nombre',
        'telefono': 'Teléfono',
        'fecha': 'Fecha'
      };

      const fieldName = fieldTranslations[error.field] || error.field;
      return `${fieldName}: ${error.message}`;
    }

    return error.message || '';
  }

  /**
   * Muestra un mensaje de error al usuario
   */
  showError(
    error: AppError,
    action?: ErrorAction,
    config?: Partial<MatSnackBarConfig>
  ): void {
    const snackBarConfig: MatSnackBarConfig = {
      duration: error.isRecoverable ? 6000 : 8000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
      ...config
    };

    const actionLabel = action?.label || 'Cerrar';

    const snackBarRef = this.snackBar.open(
      error.userMessage,
      actionLabel,
      snackBarConfig
    );

    if (action) {
      snackBarRef.onAction().subscribe(() => {
        action.action();
      });
    }
  }

  /**
   * Muestra un mensaje de error desde HttpErrorResponse
   */
  showHttpError(
    httpError: HttpErrorResponse,
    context?: string,
    action?: ErrorAction
  ): void {
    const appError = this.handleHttpError(httpError, context);
    this.showError(appError, action);
  }

  /**
   * Crea un Observable de error con manejo mejorado
   */
  createErrorObservable(error: HttpErrorResponse, context?: string): Observable<never> {
    const appError = this.handleHttpError(error, context);
    return throwError(() => appError);
  }

  /**
   * Registra un error para debugging/monitoring
   */
  logError(error: AppError, additionalInfo?: any): void {
    console.group('🚨 Application Error');
    console.error('User Message:', error.userMessage);
    console.error('Technical Message:', error.message);
    console.error('Code:', error.code);
    console.error('Recoverable:', error.isRecoverable);

    if (error.details) {
      console.error('Details:', error.details);
    }

    if (additionalInfo) {
      console.error('Additional Info:', additionalInfo);
    }

    console.groupEnd();

    // Aquí se podría enviar el error a un servicio de monitoreo
    // como Sentry, LogRocket, etc.
  }

  /**
   * Verifica si un error es recuperable
   */
  isRecoverable(error: AppError): boolean {
    return error.isRecoverable;
  }

  /**
   * Obtiene sugerencias de acciones basadas en el tipo de error
   */
  getErrorActions(error: AppError): ErrorAction[] {
    const actions: ErrorAction[] = [];

    switch (error.code) {
      case 'NETWORK_ERROR':
        actions.push({
          label: 'Reintentar',
          action: () => window.location.reload()
        });
        break;

      case 'UNAUTHORIZED':
      case 'TOKEN_EXPIRED':
        actions.push({
          label: 'Iniciar Sesión',
          action: () => {
            // Redirigir al login
            window.location.href = '/login';
          }
        });
        break;

      case 'TOO_MANY_REQUESTS':
        actions.push({
          label: 'Entendido',
          action: () => {} // No hacer nada, solo cerrar
        });
        break;

      default:
        actions.push({
          label: 'Cerrar',
          action: () => {} // No hacer nada, solo cerrar
        });
    }

    return actions;
  }
}