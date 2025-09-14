/**
 * Servicio para gestión de profesionales
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { APP_CONFIG } from '../config/app.config';
import { Profesional } from '../models/profesional.model';
import { ProfesionalResponseDTO } from '../interfaces/profesional-dtos.interface';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

export interface ProfesionalesBusquedaDTO {
  profesionales: ProfesionalResponseDTO[];
  total: number;
  totalPaginas: number;
  paginaActual: number;
  tamanoPagina: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProfesionalService {
  private readonly apiUrl = `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.profesionales || '/api/profesionales'}`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los profesionales
   */
  obtenerProfesionales(): Observable<Profesional[]> {
    return this.http.get<ApiResponse<ProfesionalResponseDTO[]>>(`${this.apiUrl}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data.map(dto => new Profesional(dto));
          }
          throw new Error(response.message || 'Error al obtener profesionales');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene un profesional por ID
   */
  obtenerProfesionalPorId(id: number): Observable<Profesional> {
    return this.http.get<ApiResponse<ProfesionalResponseDTO>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return new Profesional(response.data);
          }
          throw new Error(response.message || 'Error al obtener profesional');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Busca profesionales con filtros
   */
  buscarProfesionales(filtros: {
    textoBusqueda?: string;
    categoria?: string;
    negocioId?: number;
    calificacionMinima?: number;
    disponible?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
  }): Observable<Profesional[]> {
    let params = new HttpParams();

    Object.keys(filtros).forEach(key => {
      const value = filtros[key as keyof typeof filtros];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<ProfesionalResponseDTO[]>>(`${this.apiUrl}/buscar`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data.map(dto => new Profesional(dto));
          }
          throw new Error(response.message || 'Error al buscar profesionales');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene profesionales por negocio
   */
  obtenerProfesionalesPorNegocio(negocioId: number): Observable<Profesional[]> {
    return this.http.get<ApiResponse<ProfesionalResponseDTO[]>>(`${this.apiUrl}/negocio/${negocioId}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data.map(dto => new Profesional(dto));
          }
          throw new Error(response.message || 'Error al obtener profesionales del negocio');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene profesionales por categoría
   */
  obtenerProfesionalesPorCategoria(categoriaId: number): Observable<Profesional[]> {
    return this.http.get<ApiResponse<ProfesionalResponseDTO[]>>(`${this.apiUrl}/categoria/${categoriaId}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data.map(dto => new Profesional(dto));
          }
          throw new Error(response.message || 'Error al obtener profesionales de la categoría');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene profesionales disponibles para una fecha/hora
   */
  obtenerProfesionalesDisponibles(fecha: string, hora: string, duracionMinutos: number): Observable<Profesional[]> {
    const params = new HttpParams()
      .set('fecha', fecha)
      .set('hora', hora)
      .set('duracion', duracionMinutos.toString());

    return this.http.get<ApiResponse<ProfesionalResponseDTO[]>>(`${this.apiUrl}/disponibles`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data.map(dto => new Profesional(dto));
          }
          throw new Error(response.message || 'Error al obtener profesionales disponibles');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene los profesionales mejor calificados
   */
  obtenerProfesionalesPopulares(limite: number = 10): Observable<Profesional[]> {
    const params = new HttpParams().set('limite', limite.toString());

    return this.http.get<ApiResponse<ProfesionalResponseDTO[]>>(`${this.apiUrl}/populares`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data.map(dto => new Profesional(dto));
          }
          throw new Error(response.message || 'Error al obtener profesionales populares');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene la disponibilidad de un profesional para un rango de fechas
   */
  obtenerDisponibilidadProfesional(profesionalId: number, fechaInicio: string, fechaFin: string): Observable<any> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${profesionalId}/disponibilidad`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al obtener disponibilidad');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene los horarios de trabajo de un profesional
   */
  obtenerHorariosTrabajo(profesionalId: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${profesionalId}/horarios`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al obtener horarios de trabajo');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene las reseñas de un profesional
   */
  obtenerResenasProfesional(profesionalId: number, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${profesionalId}/resenas`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al obtener reseñas');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Califica a un profesional
   */
  calificarProfesional(profesionalId: number, calificacion: {
    puntuacion: number;
    comentario?: string;
    aspectos?: {
      puntualidad: number;
      atencion: number;
      profesionalismo: number;
      instalaciones: number;
    };
  }): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/${profesionalId}/calificar`, calificacion)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al calificar profesional');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene estadísticas de un profesional
   */
  obtenerEstadisticasProfesional(profesionalId: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${profesionalId}/estadisticas`)
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
   * Agrega un profesional a favoritos
   */
  agregarAFavoritos(profesionalId: number): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/${profesionalId}/favorito`, {})
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al agregar a favoritos');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Remueve un profesional de favoritos
   */
  removerDeFavoritos(profesionalId: number): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${profesionalId}/favorito`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al remover de favoritos');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene profesionales favoritos del usuario
   */
  obtenerProfesionalesFavoritos(): Observable<Profesional[]> {
    return this.http.get<ApiResponse<ProfesionalResponseDTO[]>>(`${this.apiUrl}/favoritos`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data.map(dto => new Profesional(dto));
          }
          throw new Error(response.message || 'Error al obtener profesionales favoritos');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Maneja errores HTTP
   */
  private handleError = (error: any): Observable<never> => {
    console.error('Error en ProfesionalService:', error);

    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      switch (error.status) {
        case 400:
          errorMessage = 'Datos inválidos en la solicitud';
          break;
        case 401:
          errorMessage = 'No autorizado';
          break;
        case 403:
          errorMessage = 'No tienes permisos para acceder a este recurso';
          break;
        case 404:
          errorMessage = 'Profesional no encontrado';
          break;
        case 409:
          errorMessage = 'Conflicto en la solicitud';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
      }
    }

    return throwError(() => new Error(errorMessage));
  };
}