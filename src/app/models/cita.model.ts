/**
 * Modelo de Cita para el frontend
 */

import { CitaResponseDTO, EstadoCita, TipoServicio, UsuarioBasicoDTO, ProfesionalBasicoDTO } from '../interfaces/cita-dtos.interface';

export class Cita {
  id: number;
  usuario: UsuarioBasicoDTO;
  profesional: ProfesionalBasicoDTO;
  fecha: Date;
  hora: string;
  fechaCompleta: Date;
  estado: EstadoCita;
  tipoServicio: TipoServicio;
  comentarios?: string;
  esUrgente: boolean;
  duracionMinutos: number;
  precio?: number;

  fechaCreacion: Date;
  fechaActualizacion: Date;

  // Información adicional según el estado
  motivoCancelacion?: string;
  fechaCancelacion?: Date;
  usuarioCancelacion?: 'USUARIO' | 'PROFESIONAL' | 'SISTEMA';

  // Para citas completadas
  notas?: string;
  recomendaciones?: string;
  proximaCita?: Date;

  // Recordatorios
  recordatorioEnviado: boolean;
  fechaRecordatorio?: Date;

  constructor(data: CitaResponseDTO) {
    this.id = data.id;
    this.usuario = data.usuario;
    this.profesional = data.profesional;
    this.fecha = new Date(data.fecha);
    this.hora = data.hora;
    this.fechaCompleta = new Date(data.fechaCompleta);
    this.estado = data.estado;
    this.tipoServicio = data.tipoServicio;
    this.comentarios = data.comentarios;
    this.esUrgente = data.esUrgente;
    this.duracionMinutos = data.duracionMinutos;
    this.precio = data.precio;

    this.fechaCreacion = new Date(data.fechaCreacion);
    this.fechaActualizacion = new Date(data.fechaActualizacion);

    this.motivoCancelacion = data.motivoCancelacion;
    this.fechaCancelacion = data.fechaCancelacion ? new Date(data.fechaCancelacion) : undefined;
    this.usuarioCancelacion = data.usuarioCancelacion;

    this.notas = data.notas;
    this.recomendaciones = data.recomendaciones;
    this.proximaCita = data.proximaCita ? new Date(data.proximaCita) : undefined;

    this.recordatorioEnviado = data.recordatorioEnviado;
    this.fechaRecordatorio = data.fechaRecordatorio ? new Date(data.fechaRecordatorio) : undefined;
  }

  // Getters de utilidad
  get fechaFormateada(): string {
    return this.fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  get fechaCorta(): string {
    return this.fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  get horaFormateada(): string {
    return this.hora.substring(0, 5); // HH:mm
  }

  get fechaHoraCompleta(): string {
    return `${this.fechaFormateada} a las ${this.horaFormateada}`;
  }

  get fechaHoraCorta(): string {
    return `${this.fechaCorta} ${this.horaFormateada}`;
  }

  get profesionalNombre(): string {
    return `${this.profesional.nombre} ${this.profesional.apellidos}`;
  }

  get categoriaNombre(): string {
    return this.profesional.categoria.nombre;
  }

  get negocioNombre(): string {
    return this.profesional.negocio.nombre;
  }

  get duracionFormateada(): string {
    const horas = Math.floor(this.duracionMinutos / 60);
    const minutos = this.duracionMinutos % 60;

    if (horas > 0) {
      return minutos > 0 ? `${horas}h ${minutos}m` : `${horas}h`;
    }
    return `${minutos}m`;
  }

  get precioFormateado(): string {
    return this.precio ? `€${this.precio.toFixed(2)}` : 'Consultar';
  }

  // Métodos de estado
  get esPendiente(): boolean {
    return this.estado === 'PENDIENTE';
  }

  get esConfirmada(): boolean {
    return this.estado === 'CONFIRMADA';
  }

  get esEnCurso(): boolean {
    return this.estado === 'EN_CURSO';
  }

  get esCompletada(): boolean {
    return this.estado === 'COMPLETADA';
  }

  get esCancelada(): boolean {
    return this.estado === 'CANCELADA';
  }

  get esNoAsistio(): boolean {
    return this.estado === 'NO_ASISTIO';
  }

  get puedeModificar(): boolean {
    return this.esPendiente || this.esConfirmada;
  }

  get puedeCancelar(): boolean {
    const ahora = new Date();
    const limiteCancelacion = new Date(this.fechaCompleta.getTime() - (2 * 60 * 60 * 1000)); // 2 horas antes
    return (this.esPendiente || this.esConfirmada) && ahora < limiteCancelacion;
  }

  get esProxima(): boolean {
    const ahora = new Date();
    const treintaMinutos = 30 * 60 * 1000; // 30 minutos en milisegundos
    const diferencia = this.fechaCompleta.getTime() - ahora.getTime();

    return diferencia > 0 && diferencia <= treintaMinutos;
  }

  get esPasada(): boolean {
    const ahora = new Date();
    return this.fechaCompleta.getTime() < ahora.getTime();
  }

  get tiempoRestante(): string {
    const ahora = new Date();
    const diferencia = this.fechaCompleta.getTime() - ahora.getTime();

    if (diferencia <= 0) {
      return this.esPasada ? 'Pasada' : 'Ahora';
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

    if (dias > 0) {
      return `En ${dias} días`;
    } else if (horas > 0) {
      return `En ${horas}h ${minutos}m`;
    } else {
      return `En ${minutos} minutos`;
    }
  }

  // Métodos de display
  get estadoDisplay(): string {
    const estados = {
      'PENDIENTE': 'Pendiente',
      'CONFIRMADA': 'Confirmada',
      'EN_CURSO': 'En curso',
      'COMPLETADA': 'Completada',
      'CANCELADA': 'Cancelada',
      'NO_ASISTIO': 'No asistió'
    };
    return estados[this.estado] || this.estado;
  }

  get estadoColor(): string {
    const colores = {
      'PENDIENTE': 'warning',
      'CONFIRMADA': 'info',
      'EN_CURSO': 'primary',
      'COMPLETADA': 'success',
      'CANCELADA': 'danger',
      'NO_ASISTIO': 'secondary'
    };
    return colores[this.estado] || 'secondary';
  }

  get tipoServicioDisplay(): string {
    const tipos = {
      'PRIMERA_VEZ': 'Primera vez',
      'MANTENIMIENTO': 'Mantenimiento',
      'SEGUIMIENTO': 'Seguimiento',
      'SESION_COMPLETA': 'Sesión completa',
      'CONSULTA': 'Consulta'
    };
    return tipos[this.tipoServicio] || this.tipoServicio;
  }

  get prioridadDisplay(): string {
    return this.esUrgente ? 'Urgente' : 'Normal';
  }

  get prioridadColor(): string {
    return this.esUrgente ? 'danger' : 'secondary';
  }

  // Métodos para calendario
  get eventoCalendario(): any {
    return {
      id: this.id,
      title: `${this.profesionalNombre} - ${this.categoriaNombre}`,
      start: this.fechaCompleta,
      end: new Date(this.fechaCompleta.getTime() + (this.duracionMinutos * 60 * 1000)),
      backgroundColor: this.getColorByEstado(),
      borderColor: this.getColorByEstado(),
      textColor: 'white',
      extendedProps: {
        cita: this,
        tipo: this.tipoServicioDisplay,
        profesional: this.profesionalNombre,
        categoria: this.categoriaNombre,
        negocio: this.negocioNombre,
        estado: this.estadoDisplay,
        esUrgente: this.esUrgente
      }
    };
  }

  private getColorByEstado(): string {
    const colores = {
      'PENDIENTE': '#ffc107',
      'CONFIRMADA': '#17a2b8',
      'EN_CURSO': '#007bff',
      'COMPLETADA': '#28a745',
      'CANCELADA': '#dc3545',
      'NO_ASISTIO': '#6c757d'
    };
    return colores[this.estado] || '#6c757d';
  }

  // Métodos de actualización
  actualizarEstado(nuevoEstado: EstadoCita, motivo?: string): void {
    const estadoAnterior = this.estado;
    this.estado = nuevoEstado;
    this.fechaActualizacion = new Date();

    if (nuevoEstado === 'CANCELADA' && motivo) {
      this.motivoCancelacion = motivo;
      this.fechaCancelacion = new Date();
    }
  }

  // Validaciones
  puedeSerModificada(): boolean {
    const estadosModificables: EstadoCita[] = ['PENDIENTE', 'CONFIRMADA'];
    return estadosModificables.includes(this.estado) && !this.esPasada;
  }

  // Método para exportar datos
  toJSON(): any {
    return {
      id: this.id,
      usuario: this.usuario,
      profesional: this.profesional,
      fecha: this.fecha.toISOString(),
      hora: this.hora,
      fechaCompleta: this.fechaCompleta.toISOString(),
      estado: this.estado,
      tipoServicio: this.tipoServicio,
      comentarios: this.comentarios,
      esUrgente: this.esUrgente,
      duracionMinutos: this.duracionMinutos,
      precio: this.precio,
      fechaCreacion: this.fechaCreacion.toISOString(),
      fechaActualizacion: this.fechaActualizacion.toISOString(),
      motivoCancelacion: this.motivoCancelacion,
      fechaCancelacion: this.fechaCancelacion?.toISOString(),
      usuarioCancelacion: this.usuarioCancelacion,
      notas: this.notas,
      recomendaciones: this.recomendaciones,
      proximaCita: this.proximaCita?.toISOString(),
      recordatorioEnviado: this.recordatorioEnviado,
      fechaRecordatorio: this.fechaRecordatorio?.toISOString()
    };
  }

  // Métodos estáticos
  static fromDTO(dto: CitaResponseDTO): Cita {
    return new Cita(dto);
  }

  static fromDTOList(dtos: CitaResponseDTO[]): Cita[] {
    return dtos.map(dto => new Cita(dto));
  }

  static compararPorFecha(a: Cita, b: Cita): number {
    return a.fechaCompleta.getTime() - b.fechaCompleta.getTime();
  }

  static filtrarPorEstado(citas: Cita[], estado: EstadoCita): Cita[] {
    return citas.filter(cita => cita.estado === estado);
  }

  static filtrarProximas(citas: Cita[]): Cita[] {
    const ahora = new Date();
    return citas.filter(cita => cita.fechaCompleta.getTime() > ahora.getTime());
  }

  static filtrarPasadas(citas: Cita[]): Cita[] {
    const ahora = new Date();
    return citas.filter(cita => cita.fechaCompleta.getTime() <= ahora.getTime());
  }
}