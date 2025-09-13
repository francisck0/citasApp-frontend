/**
 * Servicio para gestión de usuarios
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { APP_CONFIG } from '../config/app.config';
import {
  UsuarioCreateDTO,
  UsuarioUpdateDTO,
  UsuarioPerfilDTO,
  UsuarioEstadisticasDTO,
  UsuarioBusquedaDTO,
  NotificacionesPreferenciasDTO,
  ContactoEmergenciaDTO
} from '../interfaces/usuario-dtos.interface';
import { Usuario } from '../models/usuario.model';

export interface CambioPasswordDTO {
  passwordActual: string;
  passwordNueva: string;
  confirmarPassword: string;
}

export interface VerificarEmailDTO {
  token: string;
}

export interface RecuperarPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  passwordNueva: string;
  confirmarPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.usuarios}`;

  constructor(private http: HttpClient) {}

  // === REGISTRO Y VERIFICACIÓN ===

  /**
   * Registra un nuevo usuario
   */
  registrar(usuario: UsuarioCreateDTO): Observable<Usuario> {
    return this.http.post<ApiResponse<UsuarioPerfilDTO>>(`${this.apiUrl}/registro`, usuario)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Usuario.fromDTO(response.data);
          }
          throw new Error(response.message || 'Error al registrar usuario');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Verifica el email del usuario
   */
  verificarEmail(data: VerificarEmailDTO): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/verificar-email`, data)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al verificar email');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Reenvía el email de verificación
   */
  reenviarVerificacion(email: string): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/reenviar-verificacion`, { email })
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al reenviar verificación');
        }),
        catchError(this.handleError)
      );
  }

  // === GESTIÓN DE PERFIL ===

  /**
   * Obtiene el perfil del usuario actual
   */
  obtenerPerfil(): Observable<Usuario> {
    return this.http.get<ApiResponse<UsuarioPerfilDTO>>(`${this.apiUrl}/perfil`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Usuario.fromDTO(response.data);
          }
          throw new Error(response.message || 'Error al obtener perfil');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene perfil de usuario por ID
   */
  obtenerPerfilPorId(id: number): Observable<Usuario> {
    return this.http.get<ApiResponse<UsuarioPerfilDTO>>(`${this.apiUrl}/${id}/perfil`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Usuario.fromDTO(response.data);
          }
          throw new Error(response.message || 'Error al obtener perfil');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza el perfil del usuario
   */
  actualizarPerfil(datos: UsuarioUpdateDTO): Observable<Usuario> {
    return this.http.put<ApiResponse<UsuarioPerfilDTO>>(`${this.apiUrl}/perfil`, datos)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Usuario.fromDTO(response.data);
          }
          throw new Error(response.message || 'Error al actualizar perfil');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza información adicional del usuario
   */
  actualizarInformacionAdicional(datos: {
    preferencias?: string;
    comentarios?: string;
    observaciones?: string;
    contactoEmergencia?: ContactoEmergenciaDTO;
  }): Observable<Usuario> {
    return this.http.put<ApiResponse<UsuarioPerfilDTO>>(`${this.apiUrl}/informacion-adicional`, datos)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Usuario.fromDTO(response.data);
          }
          throw new Error(response.message || 'Error al actualizar información adicional');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza las preferencias de notificaciones
   */
  actualizarPreferenciasNotificaciones(preferencias: NotificacionesPreferenciasDTO): Observable<boolean> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/preferencias-notificaciones`, preferencias)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al actualizar preferencias');
        }),
        catchError(this.handleError)
      );
  }

  // === GESTIÓN DE CONTRASEÑA ===

  /**
   * Cambia la contraseña del usuario
   */
  cambiarPassword(datos: CambioPasswordDTO): Observable<boolean> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/cambiar-password`, datos)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al cambiar contraseña');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Solicita recuperación de contraseña
   */
  recuperarPassword(datos: RecuperarPasswordDTO): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/recuperar-password`, datos)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al solicitar recuperación');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Restablece la contraseña con token
   */
  resetearPassword(datos: ResetPasswordDTO): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/reset-password`, datos)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al restablecer contraseña');
        }),
        catchError(this.handleError)
      );
  }

  // === SUBIDA DE ARCHIVOS ===

  /**
   * Sube foto de perfil
   */
  subirFotoPerfil(archivo: File): Observable<string> {
    const formData = new FormData();
    formData.append('foto', archivo);

    return this.http.post<ApiResponse<{ url: string }>>(`${this.apiUrl}/foto-perfil`, formData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data.url;
          }
          throw new Error(response.message || 'Error al subir foto');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Elimina foto de perfil
   */
  eliminarFotoPerfil(): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/foto-perfil`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al eliminar foto');
        }),
        catchError(this.handleError)
      );
  }

  // === ESTADÍSTICAS Y DATOS ADICIONALES ===

  /**
   * Obtiene estadísticas del usuario
   */
  obtenerEstadisticas(): Observable<UsuarioEstadisticasDTO> {
    return this.http.get<ApiResponse<UsuarioEstadisticasDTO>>(`${this.apiUrl}/estadisticas`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al obtener estadísticas');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene el historial de actividad del usuario
   */
  obtenerHistorialActividad(page = 1, size = 10): Observable<any[]> {
    const params = { page: page.toString(), size: size.toString() };

    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/historial-actividad`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al obtener historial');
        }),
        catchError(this.handleError)
      );
  }

  // === ADMINISTRACIÓN (solo para admins) ===

  /**
   * Busca usuarios (solo admins)
   */
  buscarUsuarios(filtros: {
    nombre?: string;
    email?: string;
    estado?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    size?: number;
  }): Observable<{ usuarios: UsuarioBusquedaDTO[], total: number }> {
    const params: any = {};
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof typeof filtros] !== undefined && filtros[key as keyof typeof filtros] !== '') {
        params[key] = filtros[key as keyof typeof filtros]?.toString();
      }
    });

    return this.http.get<ApiResponse<{ usuarios: UsuarioBusquedaDTO[], total: number }>>(`${this.apiUrl}/buscar`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al buscar usuarios');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Cambia el estado de un usuario (solo admins)
   */
  cambiarEstadoUsuario(id: number, estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO', motivo?: string): Observable<boolean> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${id}/estado`, { estado, motivo })
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al cambiar estado');
        }),
        catchError(this.handleError)
      );
  }

  // === ELIMINACIÓN DE CUENTA ===

  /**
   * Solicita eliminación de cuenta
   */
  solicitarEliminacionCuenta(motivo?: string): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/solicitar-eliminacion`, { motivo })
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al solicitar eliminación');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Confirma eliminación de cuenta con token
   */
  confirmarEliminacionCuenta(token: string): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/confirmar-eliminacion`, { token })
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al eliminar cuenta');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Cancela solicitud de eliminación
   */
  cancelarEliminacionCuenta(): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/cancelar-eliminacion`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al cancelar eliminación');
        }),
        catchError(this.handleError)
      );
  }

  // === VALIDACIONES ===

  /**
   * Verifica si un email ya está registrado
   */
  verificarEmailDisponible(email: string): Observable<boolean> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/verificar-email-disponible?email=${encodeURIComponent(email)}`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al verificar email');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Valida la fortaleza de una contraseña
   */
  validarPassword(password: string): {
    esValida: boolean;
    puntuacion: number;
    errores: string[];
  } {
    const errores: string[] = [];
    let puntuacion = 0;

    // Longitud mínima
    if (password.length < APP_CONFIG.validation.password.minLength) {
      errores.push(`Debe tener al menos ${APP_CONFIG.validation.password.minLength} caracteres`);
    } else {
      puntuacion += 25;
    }

    // Mayúscula
    if (APP_CONFIG.validation.password.requireUppercase && !/[A-Z]/.test(password)) {
      errores.push('Debe contener al menos una letra mayúscula');
    } else if (/[A-Z]/.test(password)) {
      puntuacion += 25;
    }

    // Minúscula
    if (APP_CONFIG.validation.password.requireLowercase && !/[a-z]/.test(password)) {
      errores.push('Debe contener al menos una letra minúscula');
    } else if (/[a-z]/.test(password)) {
      puntuacion += 25;
    }

    // Números
    if (APP_CONFIG.validation.password.requireNumbers && !/\d/.test(password)) {
      errores.push('Debe contener al menos un número');
    } else if (/\d/.test(password)) {
      puntuacion += 25;
    }

    // Caracteres especiales (bonus)
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      puntuacion += 25;
    }

    // Bonificaciones por longitud
    if (password.length >= 12) puntuacion += 10;
    if (password.length >= 16) puntuacion += 10;

    puntuacion = Math.min(puntuacion, 100);

    return {
      esValida: errores.length === 0,
      puntuacion,
      errores
    };
  }

  // === MÉTODOS PRIVADOS ===

  /**
   * Maneja errores HTTP
   */
  private handleError = (error: any): Observable<never> => {
    console.error('Error en UsuarioService:', error);

    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      switch (error.status) {
        case 400:
          errorMessage = 'Datos inválidos';
          break;
        case 401:
          errorMessage = 'No autorizado';
          break;
        case 403:
          errorMessage = 'Acceso denegado';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 409:
          errorMessage = 'Conflicto - El recurso ya existe';
          break;
        case 422:
          errorMessage = 'Datos de entrada inválidos';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        case 503:
          errorMessage = 'Servicio no disponible';
          break;
      }
    }

    return throwError(() => new Error(errorMessage));
  };
}