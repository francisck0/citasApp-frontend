/**
 * DTOs relacionados con citas de servicios
 */

export interface CitaCreateDTO {
  profesionalId: number;
  fecha: string; // ISO date string
  hora: string; // HH:mm format
  tipoServicio: TipoServicio;
  comentarios?: string;
  esUrgente?: boolean;
}

export interface CitaUpdateDTO {
  fecha?: string;
  hora?: string;
  comentarios?: string;
  esUrgente?: boolean;
}

export interface CitaResponseDTO {
  id: number;
  usuario: UsuarioBasicoDTO;
  profesional: ProfesionalBasicoDTO;
  fecha: string;
  hora: string;
  fechaCompleta: string; // ISO datetime string
  estado: EstadoCita;
  tipoServicio: TipoServicio;
  comentarios?: string;
  esUrgente: boolean;
  duracionMinutos: number;
  precio?: number;

  fechaCreacion: string;
  fechaActualizacion: string;

  // Información adicional según el estado
  motivoCancelacion?: string;
  fechaCancelacion?: string;
  usuarioCancelacion?: 'USUARIO' | 'PROFESIONAL' | 'SISTEMA';

  // Para citas completadas
  notas?: string;
  recomendaciones?: string;
  proximaCita?: string;

  // Recordatorios
  recordatorioEnviado: boolean;
  fechaRecordatorio?: string;
}

export interface CitaBusquedaDTO {
  id: number;
  fechaCompleta: string;
  estado: EstadoCita;
  profesionalNombre: string;
  categoria: string;
  tipoServicio: TipoServicio;
  esUrgente: boolean;
  precio?: number;
}

export interface CitaCalendarioDTO {
  id: number;
  titulo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoCita;
  profesional: string;
  categoria: string;
  color?: string; // Para el calendario
}

export interface DisponibilidadDTO {
  fecha: string;
  horariosDisponibles: HorarioDisponibleDTO[];
}

export interface HorarioDisponibleDTO {
  hora: string;
  disponible: boolean;
  precio?: number;
  duracionMinutos: number;
}

export interface CitaEstadisticasDTO {
  totalCitas: number;
  citasPendientes: number;
  citasCompletadas: number;
  citasCanceladas: number;
  citasHoy: number;
  proximasCitas: CitaResponseDTO[];
  citasRecientes: CitaResponseDTO[];
}

// DTOs auxiliares
export interface UsuarioBasicoDTO {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
}

export interface ProfesionalBasicoDTO {
  id: number;
  nombre: string;
  apellidos: string;
  categoria: CategoriaDTO;
  negocio: NegocioBasicoDTO;
  telefono?: string;
  email?: string;
  foto?: string;
  calificacion?: number;
}

export interface CategoriaDTO {
  id: number;
  nombre: string;
  descripcion?: string;
  icono?: string;
}

export interface NegocioBasicoDTO {
  id: number;
  nombre: string;
  direccion: DireccionDTO;
  telefono: string;
}

export interface DireccionDTO {
  calle: string;
  numero: string;
  piso?: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
  coordenadas?: CoordenadasDTO;
}

export interface CoordenadasDTO {
  latitud: number;
  longitud: number;
}

// Días de la semana
export type DiaSemana =
  | 'LUNES'
  | 'MARTES'
  | 'MIERCOLES'
  | 'JUEVES'
  | 'VIERNES'
  | 'SABADO'
  | 'DOMINGO';

// Enums como tipos
export type EstadoCita =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'EN_CURSO'
  | 'COMPLETADA'
  | 'CANCELADA'
  | 'NO_ASISTIO';

export type TipoServicio =
  | 'PRIMERA_VEZ'
  | 'MANTENIMIENTO'
  | 'SEGUIMIENTO'
  | 'SESION_COMPLETA'
  | 'CONSULTA';

// Para filtros de búsqueda
export interface CitaFiltrosDTO {
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: EstadoCita[];
  profesionalId?: number;
  categoriaId?: number;
  tipoServicio?: TipoServicio[];
  esUrgente?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}