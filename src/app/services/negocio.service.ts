/**
 * Servicio para gestión de negocios
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { APP_CONFIG } from '../config/app.config';
import {
  NegocioResponseDTO,
  NegocioCreateDTO,
  NegocioUpdateDTO,
  NegocioBusquedaDTO,
  NegocioFiltrosDTO,
  TipoNegocio,
  EstadoNegocio,
  HorarioAtencionDTO,
  HorarioAtencionCreateDTO,
  ServicioDTO,
  FotoDTO,
  ConfiguracionNegocioDTO
} from '../interfaces/negocio-dtos.interface';
import { CoordenadasDTO } from '../interfaces/cita-dtos.interface';
import { Negocio } from '../models/negocio.model';

export interface ReseñaNegocioDTO {
  id: number;
  usuario: {
    id: number;
    nombre: string;
    apellidos: string;
    foto?: string;
  };
  calificacion: number; // 1-5
  comentario?: string;
  fecha: string;
  aspecto: 'GENERAL' | 'ATENCION' | 'INSTALACIONES' | 'LIMPIEZA' | 'PRECIO';
  recomendado: boolean;
  verificada: boolean;
}

export interface EstadisticasNegocioDTO {
  totalCitas: number;
  citasCompletadas: number;
  citasCanceladas: number;
  ingresosMes: number;
  ingresosAnio: number;
  calificacionPromedio: number;
  totalReseñas: number;
  clientesUnicos: number;
  horasPicoMasFrecuentes: string[];
  serviciosMasPopulares: {
    nombre: string;
    cantidad: number;
    ingresos: number;
  }[];
}

export interface DisponibilidadNegocioDTO {
  negocioId: number;
  fecha: string; // YYYY-MM-DD
  horarios: {
    hora: string; // HH:mm
    disponible: boolean;
    profesionalesDisponibles: number;
    serviciosDisponibles: string[];
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

export interface NegociosPaginadosDTO {
  negocios: NegocioBusquedaDTO[];
  total: number;
  totalPaginas: number;
  paginaActual: number;
  tamanoPagina: number;
}

@Injectable({
  providedIn: 'root'
})
export class NegocioService {
  private readonly apiUrl = `${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.negocios}`;

  constructor(private http: HttpClient) {}

  // === BÚSQUEDA Y LISTADO DE NEGOCIOS ===

  /**
   * Busca negocios con filtros
   */
  buscarNegocios(filtros: NegocioFiltrosDTO = {}): Observable<{
    negocios: Negocio[];
    total: number;
  }> {
    const params = this.buildHttpParams(filtros);

    return this.http.get<ApiResponse<NegociosPaginadosDTO>>(`${this.apiUrl}/buscar`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return {
              negocios: response.data.negocios.map(dto => Negocio.fromDTO(dto as any)),
              total: response.data.total
            };
          }
          throw new Error(response.message || 'Error al buscar negocios');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene negocios cercanos por ubicación
   */
  obtenerNegociosCercanos(
    coordenadas: CoordenadasDTO,
    radio: number = 10,
    filtros?: Partial<NegocioFiltrosDTO>
  ): Observable<{
    negocios: (Negocio & { distancia: number })[];
    total: number;
  }> {
    const params = this.buildHttpParams({
      ...filtros,
      coordenadas,
      radio
    });

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/cercanos`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return {
              negocios: response.data.negocios.map((item: any) => ({
                ...Negocio.fromDTO(item.negocio),
                distancia: item.distancia
              })),
              total: response.data.total
            };
          }
          throw new Error(response.message || 'Error al obtener negocios cercanos');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene negocio por ID
   */
  obtenerNegocioPorId(id: number): Observable<Negocio> {
    return this.http.get<ApiResponse<NegocioResponseDTO>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Negocio.fromDTO(response.data);
          }
          throw new Error(response.message || 'Error al obtener negocio');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene negocios por tipo
   */
  obtenerNegociosPorTipo(tipo: TipoNegocio, filtros?: Partial<NegocioFiltrosDTO>): Observable<Negocio[]> {
    const params = this.buildHttpParams({
      ...filtros,
      tipoNegocio: [tipo]
    });

    return this.http.get<ApiResponse<NegocioResponseDTO[]>>(`${this.apiUrl}/tipo`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Negocio.fromDTOList(response.data);
          }
          throw new Error(response.message || 'Error al obtener negocios por tipo');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene negocios destacados
   */
  obtenerNegociosDestacados(limite: number = 10): Observable<Negocio[]> {
    const params = new HttpParams().set('limite', limite.toString());

    return this.http.get<ApiResponse<NegocioResponseDTO[]>>(`${this.apiUrl}/destacados`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Negocio.fromDTOList(response.data);
          }
          throw new Error(response.message || 'Error al obtener negocios destacados');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene negocios favoritos del usuario
   */
  obtenerNegociosFavoritos(): Observable<Negocio[]> {
    return this.http.get<ApiResponse<NegocioResponseDTO[]>>(`${this.apiUrl}/favoritos`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Negocio.fromDTOList(response.data);
          }
          throw new Error(response.message || 'Error al obtener favoritos');
        }),
        catchError(this.handleError)
      );
  }

  // === GESTIÓN DE FAVORITOS ===

  /**
   * Agrega negocio a favoritos
   */
  agregarAFavoritos(negocioId: number): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/${negocioId}/favorito`, {})
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
   * Quita negocio de favoritos
   */
  quitarDeFavoritos(negocioId: number): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${negocioId}/favorito`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al quitar de favoritos');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Verifica si un negocio está en favoritos
   */
  esFavorito(negocioId: number): Observable<boolean> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/${negocioId}/es-favorito`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al verificar favorito');
        }),
        catchError(this.handleError)
      );
  }

  // === HORARIOS Y DISPONIBILIDAD ===

  /**
   * Obtiene horarios de atención de un negocio
   */
  obtenerHorarios(negocioId: number): Observable<HorarioAtencionDTO[]> {
    return this.http.get<ApiResponse<HorarioAtencionDTO[]>>(`${this.apiUrl}/${negocioId}/horarios`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al obtener horarios');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Verifica si un negocio está abierto
   */
  estaAbierto(negocioId: number): Observable<{
    abierto: boolean;
    proximaApertura?: string;
    horarioHoy?: string;
  }> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${negocioId}/esta-abierto`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al verificar apertura');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene disponibilidad de un negocio para una fecha
   */
  obtenerDisponibilidad(negocioId: number, fecha: string): Observable<DisponibilidadNegocioDTO> {
    const params = new HttpParams().set('fecha', fecha);

    return this.http.get<ApiResponse<DisponibilidadNegocioDTO>>(`${this.apiUrl}/${negocioId}/disponibilidad`, { params })
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

  // === SERVICIOS DEL NEGOCIO ===

  /**
   * Obtiene servicios de un negocio
   */
  obtenerServicios(negocioId: number): Observable<ServicioDTO[]> {
    return this.http.get<ApiResponse<ServicioDTO[]>>(`${this.apiUrl}/${negocioId}/servicios`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al obtener servicios');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Busca servicios en un negocio
   */
  buscarServicios(negocioId: number, filtros: {
    nombre?: string;
    categoriaId?: number;
    precioMin?: number;
    precioMax?: number;
  }): Observable<ServicioDTO[]> {
    const params = this.buildHttpParams(filtros);

    return this.http.get<ApiResponse<ServicioDTO[]>>(`${this.apiUrl}/${negocioId}/servicios/buscar`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al buscar servicios');
        }),
        catchError(this.handleError)
      );
  }

  // === RESEÑAS Y CALIFICACIONES ===

  /**
   * Obtiene reseñas de un negocio
   */
  obtenerReseñas(
    negocioId: number,
    filtros: {
      calificacion?: number;
      aspecto?: string;
      page?: number;
      size?: number;
    } = {}
  ): Observable<{
    reseñas: ReseñaNegocioDTO[];
    total: number;
    promedioCalificacion: number;
    distribucionCalificaciones: { [key: number]: number };
  }> {
    const params = this.buildHttpParams(filtros);

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${negocioId}/reseñas`, { params })
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
   * Crea una reseña para un negocio
   */
  crearReseña(negocioId: number, reseña: {
    calificacion: number;
    comentario?: string;
    aspecto: string;
    recomendado: boolean;
  }): Observable<ReseñaNegocioDTO> {
    return this.http.post<ApiResponse<ReseñaNegocioDTO>>(`${this.apiUrl}/${negocioId}/reseñas`, reseña)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al crear reseña');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza una reseña
   */
  actualizarReseña(negocioId: number, reseñaId: number, datos: {
    calificacion?: number;
    comentario?: string;
    recomendado?: boolean;
  }): Observable<ReseñaNegocioDTO> {
    return this.http.put<ApiResponse<ReseñaNegocioDTO>>(`${this.apiUrl}/${negocioId}/reseñas/${reseñaId}`, datos)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al actualizar reseña');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Elimina una reseña
   */
  eliminarReseña(negocioId: number, reseñaId: number): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${negocioId}/reseñas/${reseñaId}`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al eliminar reseña');
        }),
        catchError(this.handleError)
      );
  }

  // === FOTOS Y GALERÍA ===

  /**
   * Obtiene fotos de un negocio
   */
  obtenerFotos(negocioId: number): Observable<FotoDTO[]> {
    return this.http.get<ApiResponse<FotoDTO[]>>(`${this.apiUrl}/${negocioId}/fotos`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al obtener fotos');
        }),
        catchError(this.handleError)
      );
  }

  // === ESTADÍSTICAS (Solo para propietarios) ===

  /**
   * Obtiene estadísticas del negocio
   */
  obtenerEstadisticas(negocioId: number): Observable<EstadisticasNegocioDTO> {
    return this.http.get<ApiResponse<EstadisticasNegocioDTO>>(`${this.apiUrl}/${negocioId}/estadisticas`)
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
   * Obtiene resumen de actividad mensual
   */
  obtenerResumenMensual(negocioId: number, year: number, month: number): Observable<{
    citas: number;
    ingresos: number;
    nuevosClientes: number;
    calificacionPromedio: number;
    serviciosMasPopulares: any[];
    horasPico: any[];
  }> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${negocioId}/resumen-mensual`, { params })
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

  // === GESTIÓN DE NEGOCIO (Solo para propietarios) ===

  /**
   * Crea un nuevo negocio
   */
  crearNegocio(negocio: NegocioCreateDTO): Observable<Negocio> {
    return this.http.post<ApiResponse<NegocioResponseDTO>>(`${this.apiUrl}`, negocio)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Negocio.fromDTO(response.data);
          }
          throw new Error(response.message || 'Error al crear negocio');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza un negocio
   */
  actualizarNegocio(id: number, datos: NegocioUpdateDTO): Observable<Negocio> {
    return this.http.put<ApiResponse<NegocioResponseDTO>>(`${this.apiUrl}/${id}`, datos)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return Negocio.fromDTO(response.data);
          }
          throw new Error(response.message || 'Error al actualizar negocio');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza horarios de atención
   */
  actualizarHorarios(negocioId: number, horarios: HorarioAtencionCreateDTO[]): Observable<HorarioAtencionDTO[]> {
    return this.http.put<ApiResponse<HorarioAtencionDTO[]>>(`${this.apiUrl}/${negocioId}/horarios`, { horarios })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al actualizar horarios');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza configuración del negocio
   */
  actualizarConfiguracion(negocioId: number, config: ConfiguracionNegocioDTO): Observable<boolean> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${negocioId}/configuracion`, config)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al actualizar configuración');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Sube fotos del negocio
   */
  subirFotos(negocioId: number, archivos: File[]): Observable<FotoDTO[]> {
    const formData = new FormData();
    archivos.forEach((archivo, index) => {
      formData.append(`fotos`, archivo);
    });

    return this.http.post<ApiResponse<FotoDTO[]>>(`${this.apiUrl}/${negocioId}/fotos`, formData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al subir fotos');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Establece foto principal
   */
  establecerFotoPrincipal(negocioId: number, fotoId: number): Observable<boolean> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${negocioId}/fotos/${fotoId}/principal`, {})
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || false;
          }
          throw new Error(response.message || 'Error al establecer foto principal');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Elimina una foto
   */
  eliminarFoto(negocioId: number, fotoId: number): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${negocioId}/fotos/${fotoId}`)
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

  // === MÉTODOS DE UTILIDAD ===

  /**
   * Calcula distancia entre coordenadas
   */
  calcularDistancia(coord1: CoordenadasDTO, coord2: CoordenadasDTO): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(coord2.latitud - coord1.latitud);
    const dLon = this.toRad(coord2.longitud - coord1.longitud);
    const lat1 = this.toRad(coord1.latitud);
    const lat2 = this.toRad(coord2.latitud);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Valida horarios de atención
   */
  validarHorarios(horarios: HorarioAtencionCreateDTO[]): {
    esValido: boolean;
    errores: string[];
  } {
    const errores: string[] = [];

    horarios.forEach((horario, index) => {
      if (!horario.cerrado) {
        // Validar formato de horas
        if (!this.esHoraValida(horario.horaApertura)) {
          errores.push(`Hora de apertura inválida en ${horario.diaSemana}`);
        }
        if (!this.esHoraValida(horario.horaCierre)) {
          errores.push(`Hora de cierre inválida en ${horario.diaSemana}`);
        }

        // Validar que apertura sea antes que cierre
        if (horario.horaApertura >= horario.horaCierre) {
          errores.push(`Hora de apertura debe ser antes que la de cierre en ${horario.diaSemana}`);
        }

        // Validar descanso si existe
        if (horario.descansoInicio && horario.descansoFin) {
          if (!this.esHoraValida(horario.descansoInicio) || !this.esHoraValida(horario.descansoFin)) {
            errores.push(`Horario de descanso inválido en ${horario.diaSemana}`);
          }
          if (horario.descansoInicio >= horario.descansoFin) {
            errores.push(`Inicio de descanso debe ser antes que el fin en ${horario.diaSemana}`);
          }
          if (horario.descansoInicio < horario.horaApertura || horario.descansoFin > horario.horaCierre) {
            errores.push(`Descanso debe estar dentro del horario de atención en ${horario.diaSemana}`);
          }
        }
      }
    });

    return {
      esValido: errores.length === 0,
      errores
    };
  }

  /**
   * Obtiene tipos de negocio disponibles
   */
  obtenerTiposNegocio(): TipoNegocio[] {
    return [
      'SPA',
      'BARBERIA',
      'SALON_BELLEZA',
      'PELUQUERIA',
      'CENTRO_ESTETICO',
      'CONSULTORIO_PSICOLOGIA',
      'GIMNASIO',
      'CENTRO_MASAJES',
      'CLINICA_DENTAL',
      'CENTRO_FISIOTERAPIA',
      'OTRO'
    ];
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
        } else if (typeof value === 'object' && value.latitud !== undefined) {
          // Para coordenadas
          params = params.set('latitud', value.latitud.toString());
          params = params.set('longitud', value.longitud.toString());
        } else {
          params = params.set(key, value.toString());
        }
      }
    });

    return params;
  }

  /**
   * Convierte grados a radianes
   */
  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  /**
   * Valida formato de hora HH:mm
   */
  private esHoraValida(hora: string): boolean {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(hora);
  }

  /**
   * Maneja errores HTTP
   */
  private handleError = (error: any): Observable<never> => {
    console.error('Error en NegocioService:', error);

    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      switch (error.status) {
        case 400:
          errorMessage = 'Datos inválidos para el negocio';
          break;
        case 401:
          errorMessage = 'No autorizado para realizar esta operación';
          break;
        case 403:
          errorMessage = 'No tienes permisos para acceder a este negocio';
          break;
        case 404:
          errorMessage = 'Negocio no encontrado';
          break;
        case 409:
          errorMessage = 'Conflicto - El negocio ya existe o hay datos duplicados';
          break;
        case 422:
          errorMessage = 'Datos de entrada inválidos';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        case 503:
          errorMessage = 'Servicio de negocios temporalmente no disponible';
          break;
      }
    }

    return throwError(() => new Error(errorMessage));
  };
}