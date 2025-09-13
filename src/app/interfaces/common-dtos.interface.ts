/**
 * DTOs comunes y de propósito general
 */

// Respuestas estándar de la API
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  error: string;
  status: number;
  timestamp: string;
  path: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  rejectedValue?: any;
}

// Paginación
export interface PageableResponse<T> {
  content: T[];
  pageable: PageableInfo;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: SortInfo;
  empty: boolean;
}

export interface PageableInfo {
  sort: SortInfo;
  offset: number;
  pageSize: number;
  pageNumber: number;
  paged: boolean;
  unpaged: boolean;
}

export interface SortInfo {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

export interface PageRequest {
  page: number;
  size: number;
  sort?: string[];
}

// Filtros comunes
export interface DateRangeFilter {
  fechaInicio: string;
  fechaFin: string;
}

export interface SearchFilter {
  query: string;
  searchIn?: string[]; // campos donde buscar
}

// Notificaciones
export interface NotificacionDTO {
  id: number;
  usuarioId: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
  fechaLectura?: string;
  link?: string;
  data?: { [key: string]: any };
}

export type TipoNotificacion =
  | 'CITA_CONFIRMADA'
  | 'CITA_CANCELADA'
  | 'CITA_RECORDATORIO'
  | 'CITA_MODIFICADA'
  | 'MENSAJE_PROFESIONAL'
  | 'PROMOCION'
  | 'SISTEMA'
  | 'PAGO_CONFIRMADO'
  | 'PAGO_RECHAZADO';

// Archivos y multimedia
export interface ArchivoDTO {
  id: number;
  nombre: string;
  nombreOriginal: string;
  extension: string;
  tamaño: number; // bytes
  tipoContenido: string;
  url: string;
  fechaSubida: string;
  usuarioId: number;
}

export interface ImagenDTO extends ArchivoDTO {
  ancho?: number;
  alto?: number;
  thumbnailUrl?: string;
}

// Ubicación (usando CoordenadasDTO de cita-dtos.interface)
export interface UbicacionDTO {
  direccion: string;
  ciudad: string;
  provincia: string;
  pais: string;
  codigoPostal: string;
  coordenadas: { latitud: number; longitud: number };
}

// Estadísticas generales
export interface EstadisticasGeneralesDTO {
  totalUsuarios: number;
  totalProfesionales: number;
  totalNegocios: number;
  totalCitas: number;
  citasHoy: number;
  citasSemana: number;
  citasMes: number;
  crecimientoMensual: number; // porcentaje
}

// Configuración de la aplicación
export interface ConfiguracionAppDTO {
  mantenimiento: boolean;
  versionMinima: string;
  versionActual: string;
  mensajeMantenimiento?: string;
  funcionesHabilitadas: FuncionesHabilitadasDTO;
}

export interface FuncionesHabilitadasDTO {
  registro: boolean;
  citasOnline: boolean;
  pagosOnline: boolean;
  videollamadas: boolean;
  notificacionesPush: boolean;
  chat: boolean;
}

// Auditoría
export interface AuditoriaDTO {
  id: number;
  entidad: string;
  entidadId: number;
  accion: AccionAuditoria;
  usuarioId: number;
  usuarioNombre: string;
  fecha: string;
  ip: string;
  userAgent?: string;
  detalles?: { [key: string]: any };
}

export type AccionAuditoria =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW'
  | 'EXPORT';

// Métricas y analytics
export interface MetricaDTO {
  nombre: string;
  valor: number;
  unidad?: string;
  fecha: string;
  categoria?: string;
  tags?: { [key: string]: string };
}

export interface ReporteDTO {
  id: number;
  nombre: string;
  tipo: TipoReporte;
  parametros: { [key: string]: any };
  fechaGeneracion: string;
  estado: EstadoReporte;
  urlDescarga?: string;
  usuarioId: number;
}

export type TipoReporte =
  | 'CITAS'
  | 'USUARIOS'
  | 'INGRESOS'
  | 'PROFESIONALES'
  | 'SATISFACCION';

export type EstadoReporte =
  | 'GENERANDO'
  | 'COMPLETADO'
  | 'ERROR'
  | 'EXPIRADO';

// Contacto y soporte
export interface ContactoDTO {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  categoria: CategoriaContacto;
  estado: EstadoContacto;
  fechaCreacion: string;
  fechaRespuesta?: string;
  respuesta?: string;
}

export type CategoriaContacto =
  | 'SOPORTE_TECNICO'
  | 'FACTURACION'
  | 'SUGERENCIA'
  | 'RECLAMO'
  | 'OTRO';

export type EstadoContacto =
  | 'PENDIENTE'
  | 'EN_PROCESO'
  | 'RESUELTO'
  | 'CERRADO';

// Tipos de respuesta comunes
export interface SuccessResponse {
  message: string;
  id?: number;
}

export interface CountResponse {
  count: number;
}

export interface StatusResponse {
  status: 'OK' | 'ERROR';
  details?: string;
}