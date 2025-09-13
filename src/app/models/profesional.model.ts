/**
 * Modelo de Profesional para el frontend
 */

import {
  ProfesionalResponseDTO,
  EstadoProfesional,
  HorarioDisponibleProfesionalDTO,
  ServicioProfesionalDTO,
  DocumentoVerificacionDTO,
  ModalidadConsulta,
  TipoDocumento
} from '../interfaces/profesional-dtos.interface';
import { UsuarioBasicoDTO, CategoriaDTO, NegocioBasicoDTO, DiaSemana } from '../interfaces/cita-dtos.interface';

export class Profesional {
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
  fechaRegistro: Date;
  fechaUltimaActividad: Date;
  estado: EstadoProfesional;

  // Media
  foto?: string;
  documentosVerificacion: DocumentoVerificacionDTO[];

  constructor(data: ProfesionalResponseDTO) {
    this.id = data.id;
    this.usuario = data.usuario;
    this.numeroLicencia = data.numeroLicencia;
    this.categorias = data.categorias;
    this.experienciaAnios = data.experienciaAnios;
    this.biografia = data.biografia;
    this.negocio = data.negocio;
    this.horariosDisponibles = data.horariosDisponibles;
    this.servicios = data.servicios;
    this.calificacion = data.calificacion;
    this.totalReseñas = data.totalReseñas;
    this.totalConsultas = data.totalConsultas;
    this.precioConsultaBase = data.precioConsultaBase;
    this.duracionConsultaMinutos = data.duracionConsultaMinutos;
    this.activoParaCitas = data.activoParaCitas;
    this.fechaRegistro = new Date(data.fechaRegistro);
    this.fechaUltimaActividad = new Date(data.fechaUltimaActividad);
    this.estado = data.estado;
    this.foto = data.foto;
    this.documentosVerificacion = data.documentosVerificacion;
  }

  // Getters básicos
  get nombreCompleto(): string {
    return `${this.usuario.nombre} ${this.usuario.apellidos}`;
  }

  get iniciales(): string {
    return `${this.usuario.nombre.charAt(0)}${this.usuario.apellidos.charAt(0)}`.toUpperCase();
  }

  get nombreConTitulo(): string {
    return `Dr. ${this.nombreCompleto}`;
  }

  // Getters de categorias
  get especialidadPrincipal(): CategoriaDTO | null {
    return this.categorias[0] || null;
  }

  get categoriasNombres(): string[] {
    return this.categorias.map(e => e.nombre);
  }

  get categoriasPrincipales(): CategoriaDTO[] {
    return this.categorias.slice(0, 2);
  }

  get categoriasTexto(): string {
    if (this.categorias.length === 0) return 'Sin especialidad';
    if (this.categorias.length === 1) return this.categorias[0].nombre;
    if (this.categorias.length === 2) {
      return `${this.categorias[0].nombre} y ${this.categorias[1].nombre}`;
    }
    return `${this.categorias[0].nombre} y ${this.categorias.length - 1} más`;
  }

  // Getters de estado
  get esActivo(): boolean {
    return this.estado === 'ACTIVO' && this.activoParaCitas;
  }

  get estaDisponible(): boolean {
    return this.esActivo && this.estado !== 'VACACIONES';
  }

  get necesitaVerificacion(): boolean {
    return this.estado === 'PENDIENTE_VERIFICACION';
  }

  get estaSuspendido(): boolean {
    return this.estado === 'SUSPENDIDO';
  }

  get estaDeVacaciones(): boolean {
    return this.estado === 'VACACIONES';
  }

  get estadoDisplay(): string {
    const estados = {
      'ACTIVO': 'Activo',
      'INACTIVO': 'Inactivo',
      'PENDIENTE_VERIFICACION': 'Pendiente de verificación',
      'SUSPENDIDO': 'Suspendido',
      'VACACIONES': 'De vacaciones'
    };
    return estados[this.estado] || this.estado;
  }

  get estadoColor(): string {
    const colores = {
      'ACTIVO': 'success',
      'INACTIVO': 'secondary',
      'PENDIENTE_VERIFICACION': 'warning',
      'SUSPENDIDO': 'danger',
      'VACACIONES': 'info'
    };
    return colores[this.estado] || 'secondary';
  }

  // Getters de experiencia
  get experienciaTexto(): string {
    if (this.experienciaAnios === 0) return 'Menos de 1 año';
    if (this.experienciaAnios === 1) return '1 año';
    return `${this.experienciaAnios} años`;
  }

  get esExperimentado(): boolean {
    return this.experienciaAnios >= 5;
  }

  get nivelExperiencia(): 'Nuevo' | 'Intermedio' | 'Experimentado' | 'Experto' {
    if (this.experienciaAnios < 2) return 'Nuevo';
    if (this.experienciaAnios < 5) return 'Intermedio';
    if (this.experienciaAnios < 10) return 'Experimentado';
    return 'Experto';
  }

  // Getters de calificación
  get calificacionEstrellas(): number {
    return Math.round((this.calificacion || 0) * 2) / 2;
  }

  get calificacionFormateada(): string {
    return this.calificacion ? this.calificacion.toFixed(1) : 'Sin calificar';
  }

  get tieneReseñas(): boolean {
    return this.totalReseñas > 0;
  }

  get esAltamenteCalificado(): boolean {
    return (this.calificacion || 0) >= 4.5 && this.totalReseñas >= 10;
  }

  // Getters de precios
  get precioFormateado(): string {
    return this.precioConsultaBase ? `€${this.precioConsultaBase}` : 'Consultar';
  }

  get duracionFormateada(): string {
    const horas = Math.floor(this.duracionConsultaMinutos / 60);
    const minutos = this.duracionConsultaMinutos % 60;

    if (horas > 0) {
      return minutos > 0 ? `${horas}h ${minutos}m` : `${horas}h`;
    }
    return `${minutos}m`;
  }

  get rangoPrecios(): { min: number; max: number } | null {
    const serviciosConPrecio = this.servicios.filter(s => s.activo && s.precio > 0);

    if (serviciosConPrecio.length === 0) {
      return this.precioConsultaBase ?
        { min: this.precioConsultaBase, max: this.precioConsultaBase } :
        null;
    }

    const precios = serviciosConPrecio.map(s => s.precio);
    const min = Math.min(...precios, this.precioConsultaBase || Infinity);
    const max = Math.max(...precios, this.precioConsultaBase || 0);

    return { min, max };
  }

  get rangoPreciosFormateado(): string {
    const rango = this.rangoPrecios;
    if (!rango) return 'Consultar precios';

    if (rango.min === rango.max) {
      return `€${rango.min}`;
    }
    return `€${rango.min} - €${rango.max}`;
  }

  // Getters de servicios
  get serviciosActivos(): ServicioProfesionalDTO[] {
    return this.servicios.filter(s => s.activo);
  }

  get modalidadesDisponibles(): ModalidadConsulta[] {
    const modalidades = new Set(this.serviciosActivos.map(s => s.modalidad));
    return Array.from(modalidades);
  }

  get ofreceConsultaVirtual(): boolean {
    return this.modalidadesDisponibles.includes('VIRTUAL') ||
           this.modalidadesDisponibles.includes('HIBRIDA');
  }

  get ofreceConsultaPresencial(): boolean {
    return this.modalidadesDisponibles.includes('PRESENCIAL') ||
           this.modalidadesDisponibles.includes('HIBRIDA');
  }

  // Getters de horarios
  get trabajaHoy(): boolean {
    const hoy = this.getDiaSemanaActual();
    return this.horariosDisponibles.some(h => h.diaSemana === hoy && h.activo);
  }

  get horarioHoy(): string {
    const hoy = this.getDiaSemanaActual();
    const horario = this.horariosDisponibles.find(h => h.diaSemana === hoy && h.activo);

    if (!horario) return 'No disponible';

    return `${horario.horaInicio} - ${horario.horaFin}`;
  }

  get diasTrabajo(): DiaSemana[] {
    return this.horariosDisponibles
      .filter(h => h.activo)
      .map(h => h.diaSemana);
  }

  get horasTotalesSemana(): number {
    return this.horariosDisponibles
      .filter(h => h.activo)
      .reduce((total, horario) => {
        const inicio = this.parseHora(horario.horaInicio);
        const fin = this.parseHora(horario.horaFin);
        let horas = fin - inicio;

        // Restar pausas
        horario.pausas.forEach(pausa => {
          const pausaInicio = this.parseHora(pausa.horaInicio);
          const pausaFin = this.parseHora(pausa.horaFin);
          horas -= (pausaFin - pausaInicio);
        });

        return total + Math.max(0, horas);
      }, 0);
  }

  // Getters de verificación
  get estaVerificado(): boolean {
    return this.documentosVerificacion.some(doc => doc.verificado);
  }

  get documentosVerificados(): DocumentoVerificacionDTO[] {
    return this.documentosVerificacion.filter(doc => doc.verificado);
  }

  get nivelVerificacion(): 'No verificado' | 'Parcialmente verificado' | 'Completamente verificado' {
    const totalDocs = this.documentosVerificacion.length;
    const docsVerificados = this.documentosVerificados.length;

    if (docsVerificados === 0) return 'No verificado';
    if (docsVerificados < totalDocs) return 'Parcialmente verificado';
    return 'Completamente verificado';
  }

  // Getters de actividad
  get ultimaActividadTexto(): string {
    const ahora = new Date();
    const diferencia = ahora.getTime() - this.fechaUltimaActividad.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
    if (dias < 365) return `Hace ${Math.floor(dias / 30)} meses`;

    return `Hace ${Math.floor(dias / 365)} años`;
  }

  get esActivo30Dias(): boolean {
    const treintaDias = 30 * 24 * 60 * 60 * 1000;
    return (new Date().getTime() - this.fechaUltimaActividad.getTime()) < treintaDias;
  }

  // Getters de ubicación
  get ciudadTrabajo(): string {
    return this.negocio.direccion.ciudad;
  }

  get direccionTrabajo(): string {
    const dir = this.negocio.direccion;
    return `${dir.calle} ${dir.numero}, ${dir.ciudad}`;
  }

  // Métodos de utilidad
  private getDiaSemanaActual(): DiaSemana {
    const dias: DiaSemana[] = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return dias[new Date().getDay()];
  }

  private parseHora(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h + (m / 60);
  }

  // Métodos de búsqueda y filtros
  tieneEspecialidad(especialidadId: number): boolean {
    return this.categorias.some(e => e.id === especialidadId);
  }

  ofreceServicio(servicioNombre: string): boolean {
    return this.serviciosActivos.some(s =>
      s.nombre.toLowerCase().includes(servicioNombre.toLowerCase())
    );
  }

  trabajaEn(dias: DiaSemana[]): boolean {
    return dias.some(dia => this.diasTrabajo.includes(dia));
  }

  estaDisponibleEn(modalidad: ModalidadConsulta): boolean {
    return this.modalidadesDisponibles.includes(modalidad);
  }

  cumpleRangoPrecio(precioMin?: number, precioMax?: number): boolean {
    if (!precioMin && !precioMax) return true;

    const rango = this.rangoPrecios;
    if (!rango) return false;

    if (precioMin && rango.max < precioMin) return false;
    if (precioMax && rango.min > precioMax) return false;

    return true;
  }

  // Métodos de comparación
  compararPorCalificacion(otro: Profesional): number {
    const calA = this.calificacion || 0;
    const calB = otro.calificacion || 0;
    return calB - calA; // Mayor calificación primero
  }

  compararPorExperiencia(otro: Profesional): number {
    return otro.experienciaAnios - this.experienciaAnios; // Mayor experiencia primero
  }

  compararPorPrecio(otro: Profesional): number {
    const precioA = this.precioConsultaBase || 0;
    const precioB = otro.precioConsultaBase || 0;
    return precioA - precioB; // Menor precio primero
  }

  // Método para exportar datos
  toJSON(): any {
    return {
      id: this.id,
      usuario: this.usuario,
      numeroLicencia: this.numeroLicencia,
      categorias: this.categorias,
      experienciaAnios: this.experienciaAnios,
      biografia: this.biografia,
      negocio: this.negocio,
      horariosDisponibles: this.horariosDisponibles,
      servicios: this.servicios,
      calificacion: this.calificacion,
      totalReseñas: this.totalReseñas,
      totalConsultas: this.totalConsultas,
      precioConsultaBase: this.precioConsultaBase,
      duracionConsultaMinutos: this.duracionConsultaMinutos,
      activoParaCitas: this.activoParaCitas,
      fechaRegistro: this.fechaRegistro.toISOString(),
      fechaUltimaActividad: this.fechaUltimaActividad.toISOString(),
      estado: this.estado,
      foto: this.foto,
      documentosVerificacion: this.documentosVerificacion
    };
  }

  // Métodos estáticos
  static fromDTO(dto: ProfesionalResponseDTO): Profesional {
    return new Profesional(dto);
  }

  static fromDTOList(dtos: ProfesionalResponseDTO[]): Profesional[] {
    return dtos.map(dto => new Profesional(dto));
  }

  static filtrarPorEspecialidad(profesionales: Profesional[], especialidadId: number): Profesional[] {
    return profesionales.filter(prof => prof.tieneEspecialidad(especialidadId));
  }

  static filtrarActivos(profesionales: Profesional[]): Profesional[] {
    return profesionales.filter(prof => prof.esActivo);
  }

  static filtrarVerificados(profesionales: Profesional[]): Profesional[] {
    return profesionales.filter(prof => prof.estaVerificado);
  }

  static ordenarPorCalificacion(profesionales: Profesional[]): Profesional[] {
    return profesionales.sort((a, b) => a.compararPorCalificacion(b));
  }

  static ordenarPorExperiencia(profesionales: Profesional[]): Profesional[] {
    return profesionales.sort((a, b) => a.compararPorExperiencia(b));
  }

  static ordenarPorPrecio(profesionales: Profesional[]): Profesional[] {
    return profesionales.sort((a, b) => a.compararPorPrecio(b));
  }
}