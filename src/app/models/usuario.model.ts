/**
 * Modelo de Usuario para el frontend
 */

import { UsuarioPerfilDTO, NotificacionesPreferenciasDTO, ContactoEmergenciaDTO } from '../interfaces/usuario-dtos.interface';
import { UsuarioResponseDTO } from '../interfaces/auth-dtos.interface';

export class Usuario {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  fechaNacimiento?: Date;
  genero?: 'MASCULINO' | 'FEMENINO' | 'OTRO';
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  rol: 'USUARIO' | 'ADMIN' | 'PROFESIONAL';
  fechaRegistro: Date;
  ultimoAcceso?: Date;
  emailVerificado: boolean;
  perfilCompleto: boolean;

  // Información adicional
  preferencias?: string;
  comentarios?: string;
  observaciones?: string;
  contactoEmergencia?: ContactoEmergenciaDTO;

  // Preferencias
  notificaciones: NotificacionesPreferenciasDTO;

  constructor(data: UsuarioResponseDTO | UsuarioPerfilDTO) {
    this.id = data.id;
    this.email = data.email;
    this.nombre = data.nombre;
    this.apellidos = data.apellidos;
    this.telefono = data.telefono;
    this.fechaNacimiento = data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined;
    this.genero = data.genero;
    this.fechaRegistro = new Date(data.fechaRegistro);
    this.emailVerificado = data.emailVerificado;
    this.perfilCompleto = data.perfilCompleto;

    // Propiedades específicas de UsuarioResponseDTO
    if ('estado' in data) {
      this.estado = data.estado;
      this.rol = data.rol;
      this.ultimoAcceso = data.ultimoAcceso ? new Date(data.ultimoAcceso) : undefined;
    } else {
      // Valores por defecto para UsuarioPerfilDTO
      this.estado = 'ACTIVO';
      this.rol = 'USUARIO';
    }

    // Propiedades específicas de UsuarioPerfilDTO
    if ('preferencias' in data) {
      this.preferencias = data.preferencias;
      this.comentarios = data.comentarios;
      this.observaciones = data.observaciones;
      this.contactoEmergencia = data.contactoEmergencia;
      this.notificaciones = data.notificaciones;
    } else {
      // Valores por defecto
      this.notificaciones = {
        email: true,
        sms: false,
        recordatoriosCitas: true,
        promociones: false,
        newsletter: false
      };
    }
  }

  // Métodos de utilidad
  get nombreCompleto(): string {
    return `${this.nombre} ${this.apellidos}`;
  }

  get iniciales(): string {
    return `${this.nombre.charAt(0)}${this.apellidos.charAt(0)}`.toUpperCase();
  }

  get edad(): number | null {
    if (!this.fechaNacimiento) return null;

    const today = new Date();
    const birthDate = this.fechaNacimiento;
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  get esActivo(): boolean {
    return this.estado === 'ACTIVO';
  }

  get esAdmin(): boolean {
    return this.rol === 'ADMIN';
  }

  get esProfesional(): boolean {
    return this.rol === 'PROFESIONAL';
  }

  get generoDisplay(): string {
    switch (this.genero) {
      case 'MASCULINO': return 'Masculino';
      case 'FEMENINO': return 'Femenino';
      case 'OTRO': return 'Otro';
      default: return 'No especificado';
    }
  }

  get fechaRegistroFormateada(): string {
    return this.fechaRegistro.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  get ultimoAccesoFormateado(): string {
    if (!this.ultimoAcceso) return 'Nunca';

    const now = new Date();
    const diff = now.getTime() - this.ultimoAcceso.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;

    return this.ultimoAcceso.toLocaleDateString('es-ES');
  }

  // Métodos de validación
  tieneInformacionCompleta(): boolean {
    return !!(
      this.nombre &&
      this.apellidos &&
      this.telefono &&
      this.fechaNacimiento &&
      this.genero
    );
  }

  tieneContactoEmergencia(): boolean {
    return !!(
      this.contactoEmergencia?.nombre &&
      this.contactoEmergencia?.telefono &&
      this.contactoEmergencia?.relacion
    );
  }

  // Métodos de actualización
  actualizarPerfil(data: Partial<Usuario>): void {
    Object.assign(this, data);
  }

  actualizarPreferenciasNotificaciones(preferencias: NotificacionesPreferenciasDTO): void {
    this.notificaciones = { ...preferencias };
  }

  // Método para exportar datos del usuario
  toJSON(): any {
    return {
      id: this.id,
      email: this.email,
      nombre: this.nombre,
      apellidos: this.apellidos,
      telefono: this.telefono,
      fechaNacimiento: this.fechaNacimiento?.toISOString(),
      genero: this.genero,
      estado: this.estado,
      rol: this.rol,
      fechaRegistro: this.fechaRegistro.toISOString(),
      ultimoAcceso: this.ultimoAcceso?.toISOString(),
      emailVerificado: this.emailVerificado,
      perfilCompleto: this.perfilCompleto,
      preferencias: this.preferencias,
      comentarios: this.comentarios,
      observaciones: this.observaciones,
      contactoEmergencia: this.contactoEmergencia,
      notificaciones: this.notificaciones
    };
  }

  // Método estático para crear desde DTO
  static fromDTO(dto: UsuarioResponseDTO | UsuarioPerfilDTO): Usuario {
    return new Usuario(dto);
  }

  // Método estático para crear lista desde DTOs
  static fromDTOList(dtos: UsuarioResponseDTO[]): Usuario[] {
    return dtos.map(dto => new Usuario(dto));
  }
}