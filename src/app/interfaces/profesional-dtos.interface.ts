/**
 * DTOs relacionados con profesionales de servicios
 */

import { UsuarioBasicoDTO, CategoriaDTO, NegocioBasicoDTO, DiaSemana, CoordenadasDTO, ProfesionalBasicoDTO } from './cita-dtos.interface';

export interface ProfesionalResponseDTO {
  id: number;
  usuario: UsuarioBasicoDTO;

  // Información profesional
  numeroLicencia: string;
  categorias: CategoriaDTO[];
  experienciaAnios: number;
  biografia?: string;

  // Negocio donde trabaja
  negocio: NegocioBasicoDTO;

  // Horarios de trabajo
  horariosDisponibles: HorarioDisponibleProfesionalDTO[];

  // Servicios que ofrece
  servicios: ServicioProfesionalDTO[];

  // Métricas y calificaciones
  calificacion?: number;
  totalReseñas: number;
  totalConsultas: number;

  // Configuración
  precioConsultaBase?: number;
  duracionConsultaMinutos: number;
  activoParaCitas: boolean;

  // Información adicional
  fechaRegistro: string;
  fechaUltimaActividad: string;
  estado: EstadoProfesional;

  // Media
  foto?: string;
  documentosVerificacion: DocumentoVerificacionDTO[];
}

export interface ProfesionalCreateDTO {
  usuarioId: number;
  numeroLicencia: string;
  categorias: number[]; // IDs
  experienciaAnios: number;
  biografia?: string;
  negocioId: number;
  precioConsultaBase?: number;
  duracionConsultaMinutos: number;
}

export interface ProfesionalUpdateDTO {
  numeroLicencia?: string;
  categorias?: number[];
  experienciaAnios?: number;
  biografia?: string;
  precioConsultaBase?: number;
  duracionConsultaMinutos?: number;
  activoParaCitas?: boolean;
}

export interface ProfesionalBusquedaDTO {
  id: number;
  nombre: string;
  apellidos: string;
  categorias: string[];
  experienciaAnios: number;
  calificacion?: number;
  totalReseñas: number;
  negocioNombre: string;
  ciudad: string;
  precioConsultaBase?: number;
  foto?: string;
  disponible: boolean;
  distancia?: number; // km
}

export interface HorarioDisponibleProfesionalDTO {
  id: number;
  diaSemana: DiaSemana;
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  activo: boolean;

  // Horarios de pausa/descanso
  pausas: PausaHorarioDTO[];

  // Configuración especial por día
  precioEspecial?: number;
  duracionEspecial?: number;
}

export interface PausaHorarioDTO {
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  motivo?: string;
}

export interface ServicioProfesionalDTO {
  id: number;
  nombre: string;
  descripcion?: string;
  duracionMinutos: number;
  precio: number;
  categoriaId: number;
  activo: boolean;
  modalidad: ModalidadConsulta;
}

export interface DocumentoVerificacionDTO {
  id: number;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  fechaEmision: string;
  fechaVencimiento?: string;
  entidadEmisora: string;
  verificado: boolean;
  fechaVerificacion?: string;
  urlDocumento?: string;
}

export interface DisponibilidadProfesionalDTO {
  profesionalId: number;
  fecha: string; // YYYY-MM-DD
  horariosDisponibles: {
    hora: string; // HH:mm
    disponible: boolean;
    ocupadoPor?: number; // ID de cita si está ocupado
    bloqueado: boolean;
    precio?: number;
    duracion: number;
  }[];
}

export interface BloqueoHorarioDTO {
  id: number;
  profesionalId: number;
  fechaInicio: string; // ISO datetime
  fechaFin: string; // ISO datetime
  motivo: string;
  tipoBloqueo: TipoBloqueo;
  recurrente: boolean;
  activo: boolean;
}

export interface ReseñaProfesionalDTO {
  id: number;
  usuario: UsuarioBasicoDTO;
  profesional: ProfesionalBasicoDTO;
  calificacion: number; // 1-5
  comentario?: string;
  fecha: string;
  citaId: number;
  recomendado: boolean;

  // Aspectos específicos calificados
  puntualidad?: number;
  atencion?: number;
  explicacion?: number;
  instalaciones?: number;
}

export interface EstadisticasProfesionalDTO {
  totalCitas: number;
  citasCompletadas: number;
  citasCanceladas: number;
  citasNoAsistio: number;
  proximasCitas: number;
  citasHoy: number;
  ingresosMes?: number;
  ingresosAnio?: number;
  calificacionPromedio?: number;
  clientesUnicos: number;
  diasTrabajados: number;
}

// Enums y tipos
export type EstadoProfesional =
  | 'ACTIVO'
  | 'INACTIVO'
  | 'PENDIENTE_VERIFICACION'
  | 'SUSPENDIDO'
  | 'VACACIONES';

export type ModalidadConsulta =
  | 'PRESENCIAL'
  | 'VIRTUAL'
  | 'HIBRIDA';

export type TipoDocumento =
  | 'LICENCIA_PROFESIONAL'
  | 'CEDULA_PROFESIONAL'
  | 'DIPLOMA'
  | 'CERTIFICACION'
  | 'OTRO';

export type TipoBloqueo =
  | 'VACACIONES'
  | 'CAPACITACION'
  | 'ENFERMEDAD'
  | 'PERSONAL'
  | 'MANTENIMIENTO'
  | 'OTRO';

// Para filtros de búsqueda de profesionales
export interface ProfesionalFiltrosDTO {
  nombre?: string;
  categoriaId?: number[];
  negocioId?: number;
  ciudad?: string;
  provincia?: string;
  coordenadas?: CoordenadasDTO;
  radio?: number; // km
  calificacionMinima?: number;
  precioMaximo?: number;
  disponibleFecha?: string; // YYYY-MM-DD
  disponibleHora?: string; // HH:mm
  modalidad?: ModalidadConsulta[];
  experienciaMinima?: number;
  genero?: 'MASCULINO' | 'FEMENINO';
  idiomas?: string[];
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}