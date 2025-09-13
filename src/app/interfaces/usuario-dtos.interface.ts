/**
 * DTOs relacionados con usuarios
 */

export interface UsuarioCreateDTO {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  fechaNacimiento?: string;
  genero?: 'MASCULINO' | 'FEMENINO' | 'OTRO';
}

export interface UsuarioUpdateDTO {
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  fechaNacimiento?: string;
  genero?: 'MASCULINO' | 'FEMENINO' | 'OTRO';
}

export interface UsuarioPerfilDTO {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  fechaNacimiento?: string;
  genero?: 'MASCULINO' | 'FEMENINO' | 'OTRO';
  fechaRegistro: string;
  emailVerificado: boolean;
  perfilCompleto: boolean;

  // Información adicional opcional
  preferencias?: string;
  comentarios?: string;
  observaciones?: string;
  contactoEmergencia?: ContactoEmergenciaDTO;

  // Preferencias
  notificaciones: NotificacionesPreferenciasDTO;
}

export interface ContactoEmergenciaDTO {
  nombre: string;
  telefono: string;
  relacion: string;
}

export interface NotificacionesPreferenciasDTO {
  email: boolean;
  sms: boolean;
  recordatoriosCitas: boolean;
  promociones: boolean;
  newsletter: boolean;
}

export interface UsuarioEstadisticasDTO {
  totalCitas: number;
  citasCompletadas: number;
  citasCanceladas: number;
  proximasCitas: number;
  profesionalesFavoritos: number;
  antiguedad: string; // en meses
}

export interface UsuarioBusquedaDTO {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  fechaRegistro: string;
  ultimoAcceso?: string;
}