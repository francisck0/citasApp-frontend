/**
 * DTOs relacionados con negocios de servicios
 */

import { UsuarioBasicoDTO, CategoriaDTO, DireccionDTO, CoordenadasDTO, DiaSemana } from './cita-dtos.interface';

export interface NegocioResponseDTO {
  id: number;
  nombre: string;
  descripcion?: string;
  tipoNegocio: TipoNegocio;
  estado: EstadoNegocio;

  // Información de contacto
  telefono: string;
  email?: string;
  sitioWeb?: string;

  // Dirección
  direccion: DireccionCompletaDTO;

  // Horarios de atención
  horariosAtencion: HorarioAtencionDTO[];

  // Servicios y categorias
  categorias: CategoriaDTO[];
  servicios: ServicioDTO[];

  // Información adicional
  fechaRegistro: string;
  fechaActualizacion: string;
  propietario: UsuarioBasicoDTO;

  // Métricas
  calificacion?: number;
  totalReseñas: number;
  totalProfesionales: number;

  // Media
  fotos: FotoDTO[];
  logo?: string;

  // Configuración
  configuracion: ConfiguracionNegocioDTO;
}

export interface NegocioCreateDTO {
  nombre: string;
  descripcion?: string;
  tipoNegocio: TipoNegocio;
  telefono: string;
  email?: string;
  sitioWeb?: string;
  direccion: DireccionCreateDTO;
  horariosAtencion: HorarioAtencionCreateDTO[];
  categorias: number[]; // IDs de categorias
}

export interface NegocioUpdateDTO {
  nombre?: string;
  descripcion?: string;
  telefono?: string;
  email?: string;
  sitioWeb?: string;
  direccion?: DireccionCreateDTO;
  horariosAtencion?: HorarioAtencionCreateDTO[];
  categorias?: number[];
}

export interface NegocioBusquedaDTO {
  id: number;
  nombre: string;
  tipoNegocio: TipoNegocio;
  direccion: DireccionBasicaDTO;
  categorias: string[];
  calificacion?: number;
  distancia?: number; // en km
  foto?: string;
  estado: EstadoNegocio;
}

export interface DireccionCompletaDTO extends DireccionDTO {
  referencias?: string;
  instrucciones?: string;
}

export interface DireccionCreateDTO {
  calle: string;
  numero: string;
  piso?: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
  referencias?: string;
  instrucciones?: string;
  coordenadas?: CoordenadasDTO;
}

export interface DireccionBasicaDTO {
  calle: string;
  numero: string;
  ciudad: string;
  provincia: string;
}

export interface HorarioAtencionDTO {
  id: number;
  diaSemana: DiaSemana;
  horaApertura: string; // HH:mm
  horaCierre: string; // HH:mm
  cerrado: boolean;
  descansoInicio?: string; // HH:mm
  descansoFin?: string; // HH:mm
}

export interface HorarioAtencionCreateDTO {
  diaSemana: DiaSemana;
  horaApertura: string;
  horaCierre: string;
  cerrado: boolean;
  descansoInicio?: string;
  descansoFin?: string;
}

export interface ServicioDTO {
  id: number;
  nombre: string;
  descripcion?: string;
  duracionMinutos: number;
  precio?: number;
  activo: boolean;
  categoriaId: number;
  modalidad?: 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDA';
  destacado?: boolean;
  requierePreparacion?: boolean;
  admiteUrgencias?: boolean;
}

export interface FotoDTO {
  id: number;
  url: string;
  descripcion?: string;
  esPrincipal: boolean;
  fechaSubida: string;
}

export interface ConfiguracionNegocioDTO {
  permiteCancelacion: boolean;
  tiempoLimiteCancelacion: number; // horas
  requiereConfirmacion: boolean;
  notificacionesEmail: boolean;
  notificacionesSMS: boolean;
  anticipacionReserva: number; // días
  duracionConsultaDefault: number; // minutos
}

// Tipos y enums
export type TipoNegocio =
  | 'SPA'
  | 'BARBERIA'
  | 'SALON_BELLEZA'
  | 'PELUQUERIA'
  | 'CENTRO_ESTETICO'
  | 'CONSULTORIO_PSICOLOGIA'
  | 'GIMNASIO'
  | 'CENTRO_MASAJES'
  | 'CLINICA_DENTAL'
  | 'CENTRO_FISIOTERAPIA'
  | 'OTRO';

export type EstadoNegocio =
  | 'ACTIVO'
  | 'INACTIVO'
  | 'PENDIENTE_VERIFICACION'
  | 'SUSPENDIDO';


// Para filtros de búsqueda de negocios
export interface NegocioFiltrosDTO {
  nombre?: string;
  tipoNegocio?: TipoNegocio[];
  categoriaId?: number[];
  ciudad?: string;
  provincia?: string;
  coordenadas?: CoordenadasDTO;
  radio?: number; // km
  calificacionMinima?: number;
  abierto?: boolean; // filtrar por si está abierto ahora
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}