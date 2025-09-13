/**
 * Servicio para gestión de citas
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { APP_CONFIG } from '../config/app.config';
import {
  CitaCreateDTO,
  CitaUpdateDTO,
  CitaResponseDTO,
  CitaFiltrosDTO,
  EstadoCita,
  TipoServicio,
  ModalidadConsulta,
  CitaEstadisticasDTO,
  DisponibilidadDTO
} from '../interfaces/cita-dtos.interface';
import { Cita } from '../models/cita.model';

export interface CancelacionCitaDTO {
  motivo: string;
  anticipacion: number; // horas de anticipación
}

export interface ReagendarCitaDTO {
  nuevaFecha: string; // YYYY-MM-DD
  nuevaHora: string; // HH:mm
  motivo?: string;
}

export interface CalificacionCitaDTO {
  calificacion: number; // 1-5
  comentario?: string;
  aspectos?: {
    puntualidad: number;
    atencion: number;
    explicacion: number;
    instalaciones: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

export interface CitasPaginadasDTO {
  citas: CitaResponseDTO[];
  total: number;
  totalPaginas: number;
  paginaActual: number;
  tamanoPagina: number;
}

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private readonly apiUrl = `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.citas}`;

  constructor(private http: HttpClient) {}

  // === CREACIÓN DE CITAS ===

  /**
   * Crea una nueva cita
   */
  crearCita(cita: CitaCreateDTO): Observable<Cita> {
    return this.http.post<ApiResponse<CitaResponseDTO>>(`${this.apiUrl}`, cita)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Cita.fromDTO(response.data);
          }
          throw new Error(response.message || 'Error al crear cita');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Verifica disponibilidad antes de crear cita
   */
  verificarDisponibilidad(data: {
    profesionalId: number;
    fecha: string; // YYYY-MM-DD
    hora: string; // HH:mm
    duracionMinutos: number;
  }): Observable<DisponibilidadDTO> {
    const params = new HttpParams()
      .set('profesionalId', data.profesionalId.toString())
      .set('fecha', data.fecha)
      .set('hora', data.hora)
      .set('duracionMinutos', data.duracionMinutos.toString());

    return this.http.get<ApiResponse<DisponibilidadDTO>>(`${this.apiUrl}/verificar-disponibilidad`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al verificar disponibilidad');
        }),
        catchError(this.handleError)
      );
  }

  // === LISTADO Y BÚSQUEDA DE CITAS ===

  /**
   * Obtiene todas las citas del usuario actual
   */
  obtenerMisCitas(filtros?: CitaFiltrosDTO): Observable<Cita[]> {
    let params = new HttpParams();

    if (filtros) {
      params = this.buildHttpParams(filtros);
    }

    return this.http.get<ApiResponse<CitaResponseDTO[]>>(`${this.apiUrl}/mis-citas`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Cita.fromDTOList(response.data);
          }
          throw new Error(response.message || 'Error al obtener citas');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene citas con paginación
   */
  obtenerCitasPaginadas(filtros: CitaFiltrosDTO = {}): Observable<{
    citas: Cita[];
    total: number;
    totalPaginas: number;
    paginaActual: number;
  }> {
    const params = this.buildHttpParams(filtros);

    return this.http.get<ApiResponse<CitasPaginadasDTO>>(`${this.apiUrl}/paginadas`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return {
              citas: Cita.fromDTOList(response.data.citas),
              total: response.data.total,
              totalPaginas: response.data.totalPaginas,
              paginaActual: response.data.paginaActual
            };
          }
          throw new Error(response.message || 'Error al obtener citas');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene una cita por ID
   */
  obtenerCitaPorId(id: number): Observable<Cita> {
    return this.http.get<ApiResponse<CitaResponseDTO>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Cita.fromDTO(response.data);
          }
          throw new Error(response.message || 'Error al obtener cita');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene citas próximas (próximas 7 días)
   */
  obtenerCitasProximas(): Observable<Cita[]> {
    return this.http.get<ApiResponse<CitaResponseDTO[]>>(`${this.apiUrl}/proximas`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Cita.fromDTOList(response.data);
          }
          throw new Error(response.message || 'Error al obtener citas próximas');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene citas del día actual
   */
  obtenerCitasHoy(): Observable<Cita[]> {
    return this.http.get<ApiResponse<CitaResponseDTO[]>>(`${this.apiUrl}/hoy`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Cita.fromDTOList(response.data);
          }
          throw new Error(response.message || 'Error al obtener citas de hoy');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Busca citas con múltiples criterios
   */
  buscarCitas(filtros: {
    fechaDesde?: string;
    fechaHasta?: string;
    profesionalId?: number;
    negocioId?: number;
    estado?: EstadoCita[];
    tipoServicio?: TipoServicio[];
    modalidad?: ModalidadConsulta;
    esUrgente?: boolean;
    textoBusqueda?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
  }): Observable<{
    citas: Cita[];
    total: number;
  }> {
    const params = this.buildHttpParams(filtros);

    return this.http.get<ApiResponse<CitasPaginadasDTO>>(`${this.apiUrl}/buscar`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return {
              citas: Cita.fromDTOList(response.data.citas),
              total: response.data.total
            };
          }
          throw new Error(response.message || 'Error al buscar citas');
        }),
        catchError(this.handleError)
      );
  }

  // === MODIFICACIÓN DE CITAS ===

  /**
   * Actualiza una cita existente
   */
  actualizarCita(id: number, datos: CitaUpdateDTO): Observable<Cita> {
    return this.http.put<ApiResponse<CitaResponseDTO>>(`${this.apiUrl}/${id}`, datos)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Cita.fromDTO(response.data);
          }
          throw new Error(response.message || 'Error al actualizar cita');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Reagenda una cita
   */
  reagendarCita(id: number, datos: ReagendarCitaDTO): Observable<Cita> {
    return this.http.put<ApiResponse<CitaResponseDTO>>(`${this.apiUrl}/${id}/reagendar`, datos)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Cita.fromDTO(response.data);
          }
          throw new Error(response.message || 'Error al reagendar cita');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Confirma una cita pendiente
   */
  confirmarCita(id: number): Observable<Cita> {
    return this.http.put<ApiResponse<CitaResponseDTO>>(`${this.apiUrl}/${id}/confirmar`, {})
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Cita.fromDTO(response.data);
          }
          throw new Error(response.message || 'Error al confirmar cita');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Marca una cita como en curso
   */
  iniciarCita(id: number): Observable<Cita> {
    return this.http.put<ApiResponse<CitaResponseDTO>>(`${this.apiUrl}/${id}/iniciar`, {})
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Cita.fromDTO(response.data);
          }
          throw new Error(response.message || 'Error al iniciar cita');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Marca una cita como completada
   */
  completarCita(id: number, datos?: {
    notas?: string;
    recomendaciones?: string;
    proximaCita?: string;
  }): Observable<Cita> {
    return this.http.put<ApiResponse<CitaResponseDTO>>(`${this.apiUrl}/${id}/completar`, datos || {})
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Cita.fromDTO(response.data);
          }
          throw new Error(response.message || 'Error al completar cita');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Marca una cita como no asistió
   */
  marcarNoAsistio(id: number, motivo?: string): Observable<Cita> {
    return this.http.put<ApiResponse<CitaResponseDTO>>(`${this.apiUrl}/${id}/no-asistio`, { motivo })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Cita.fromDTO(response.data);
          }
          throw new Error(response.message || 'Error al marcar no asistió');
        }),
        catchError(this.handleError)
      );
  }

  // === CANCELACIÓN DE CITAS ===

  /**
   * Cancela una cita
   */
  cancelarCita(id: number, datos: CancelacionCitaDTO): Observable<boolean> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${id}/cancelar`, datos)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al cancelar cita');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Verifica si una cita puede ser cancelada
   */
  puedeCancelar(id: number): Observable<{
    puedeCancelar: boolean;
    horasRestantes: number;
    politicaCancelacion: string;
  }> {
    return this.http.get<ApiResponse<{
      puedeCancelar: boolean;
      horasRestantes: number;
      politicaCancelacion: string;
    }>>(`${this.apiUrl}/${id}/puede-cancelar`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al verificar cancelación');
        }),
        catchError(this.handleError)
      );
  }

  // === CALIFICACIONES ===

  /**
   * Califica una cita completada
   */
  calificarCita(id: number, calificacion: CalificacionCitaDTO): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/${id}/calificar`, calificacion)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al calificar cita');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene la calificación de una cita
   */
  obtenerCalificacionCita(id: number): Observable<CalificacionCitaDTO | null> {
    return this.http.get<ApiResponse<CalificacionCitaDTO>>(`${this.apiUrl}/${id}/calificacion`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || null;
          }
          throw new Error(response.message || 'Error al obtener calificación');
        }),
        catchError(this.handleError)
      );
  }

  // === ESTADÍSTICAS ===

  /**
   * Obtiene estadísticas de citas del usuario
   */
  obtenerEstadisticasCitas(): Observable<CitaEstadisticasDTO> {
    return this.http.get<ApiResponse<CitaEstadisticasDTO>>(`${this.apiUrl}/estadisticas`)
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
   * Obtiene resumen mensual de citas
   */
  obtenerResumenMensual(year: number, month: number): Observable<{
    totalCitas: number;
    citasCompletadas: number;
    citasCanceladas: number;
    gastoTotal: number;
    profesionalesMasVisitados: any[];
  }> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/resumen-mensual`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al obtener resumen mensual');
        }),
        catchError(this.handleError)
      );
  }

  // === RECORDATORIOS ===

  /**
   * Configura recordatorios para una cita
   */
  configurarRecordatorio(id: number, config: {
    recordatorioEmail: boolean;
    recordatorioSMS: boolean;
    horasAntes: number;
  }): Observable<boolean> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${id}/recordatorio`, config)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al configurar recordatorio');
        }),
        catchError(this.handleError)
      );
  }

  // === EXPORTACIÓN ===

  /**
   * Exporta citas a PDF
   */
  exportarCitasPDF(filtros?: CitaFiltrosDTO): Observable<Blob> {
    const params = filtros ? this.buildHttpParams(filtros) : new HttpParams();

    return this.http.get(`${this.apiUrl}/exportar/pdf`, {
      params,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Exporta citas a Excel
   */
  exportarCitasExcel(filtros?: CitaFiltrosDTO): Observable<Blob> {
    const params = filtros ? this.buildHttpParams(filtros) : new HttpParams();

    return this.http.get(`${this.apiUrl}/exportar/excel`, {
      params,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // === MÉTODOS PARA PROFESIONALES ===

  /**
   * Obtiene citas de un profesional (solo para profesionales)
   */
  obtenerCitasProfesional(filtros?: CitaFiltrosDTO): Observable<Cita[]> {
    const params = filtros ? this.buildHttpParams(filtros) : new HttpParams();

    return this.http.get<ApiResponse<CitaResponseDTO[]>>(`${this.apiUrl}/profesional/mis-citas`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Cita.fromDTOList(response.data);
          }
          throw new Error(response.message || 'Error al obtener citas del profesional');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene agenda del profesional para un día específico
   */
  obtenerAgendaDiaria(fecha: string): Observable<{
    fecha: string;
    citas: Cita[];
    horariosLibres: { hora: string; duracion: number }[];
  }> {
    const params = new HttpParams().set('fecha', fecha);

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/profesional/agenda-diaria`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return {
              ...response.data,
              citas: Cita.fromDTOList(response.data.citas)
            };
          }
          throw new Error(response.message || 'Error al obtener agenda');
        }),
        catchError(this.handleError)
      );
  }

  // === MÉTODOS DE UTILIDAD ===

  /**
   * Verifica si una cita puede ser modificada
   */
  puedeModificar(cita: Cita): boolean {
    const ahora = new Date();
    const fechaCita = cita.fechaCompleta;
    const horasRestantes = (fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    return cita.puedeModificar && horasRestantes > 2; // Mínimo 2 horas de anticipación
  }

  /**
   * Calcula el costo de cancelación
   */
  calcularCostoCancelacion(cita: Cita, horasAnticipacion: number): {
    tieneCosto: boolean;
    porcentaje: number;
    monto: number;
  } {
    let porcentaje = 0;

    if (horasAnticipacion < 2) {
      porcentaje = 100; // Sin reembolso
    } else if (horasAnticipacion < 24) {
      porcentaje = 50; // 50% del costo
    } else {
      porcentaje = 0; // Sin costo
    }

    const monto = cita.precio ? (cita.precio * porcentaje) / 100 : 0;

    return {
      tieneCosto: porcentaje > 0,
      porcentaje,
      monto
    };
  }

  // === MÉTODOS PRIVADOS ===

  /**
   * Construye HttpParams desde un objeto de filtros
   */
  private buildHttpParams(obj: any): HttpParams {
    let params = new HttpParams();

    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => {
            params = params.append(key, item.toString());
          });
        } else {
          params = params.set(key, value.toString());
        }
      }
    });

    return params;
  }

  /**
   * Maneja errores HTTP
   */
  private handleError = (error: any): Observable<never> => {
    console.error('Error en CitaService:', error);

    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      switch (error.status) {
        case 400:
          errorMessage = 'Datos inválidos para la cita';
          break;
        case 401:
          errorMessage = 'No autorizado para realizar esta operación';
          break;
        case 403:
          errorMessage = 'No tienes permisos para acceder a esta cita';
          break;
        case 404:
          errorMessage = 'Cita no encontrada';
          break;
        case 409:
          errorMessage = 'Conflicto de horarios - La hora ya está ocupada';
          break;
        case 422:
          errorMessage = 'Horario no disponible o datos inválidos';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        case 503:
          errorMessage = 'Servicio de citas temporalmente no disponible';
          break;
      }
    }

    return throwError(() => new Error(errorMessage));
  };
}