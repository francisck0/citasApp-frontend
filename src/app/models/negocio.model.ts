/**
 * Modelo de Negocio para el frontend
 */

import {
  NegocioResponseDTO,
  TipoNegocio,
  EstadoNegocio,
  DireccionCompletaDTO,
  HorarioAtencionDTO,
  ServicioDTO,
  FotoDTO,
  ConfiguracionNegocioDTO
} from '../interfaces/negocio-dtos.interface';
import { UsuarioBasicoDTO, CategoriaDTO, DiaSemana } from '../interfaces/cita-dtos.interface';

export class Negocio {
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
  fechaRegistro: Date;
  fechaActualizacion: Date;
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

  constructor(data: NegocioResponseDTO) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.tipoNegocio = data.tipoNegocio;
    this.estado = data.estado;

    this.telefono = data.telefono;
    this.email = data.email;
    this.sitioWeb = data.sitioWeb;

    this.direccion = data.direccion;
    this.horariosAtencion = data.horariosAtencion;
    this.categorias = data.categorias;
    this.servicios = data.servicios;

    this.fechaRegistro = new Date(data.fechaRegistro);
    this.fechaActualizacion = new Date(data.fechaActualizacion);
    this.propietario = data.propietario;

    this.calificacion = data.calificacion;
    this.totalReseñas = data.totalReseñas;
    this.totalProfesionales = data.totalProfesionales;

    this.fotos = data.fotos;
    this.logo = data.logo;

    this.configuracion = data.configuracion;
  }

  // Getters de dirección
  get direccionCompleta(): string {
    const { calle, numero, piso, ciudad, provincia } = this.direccion;
    const pisoStr = piso ? `, ${piso}` : '';
    return `${calle} ${numero}${pisoStr}, ${ciudad}, ${provincia}`;
  }

  get direccionCorta(): string {
    const { calle, numero, ciudad } = this.direccion;
    return `${calle} ${numero}, ${ciudad}`;
  }

  get coordenadas(): { latitud: number; longitud: number } | null {
    return this.direccion.coordenadas || null;
  }

  // Getters de tipo y estado
  get tipoNegocioDisplay(): string {
    const tipos = {
      'SPA': 'Spa',
      'BARBERIA': 'Barbería',
      'SALON_BELLEZA': 'Salón de Belleza',
      'PELUQUERIA': 'Peluquería',
      'CENTRO_ESTETICO': 'Centro Estético',
      'CONSULTORIO_PSICOLOGIA': 'Consultorio de Psicología',
      'GIMNASIO': 'Gimnasio',
      'CENTRO_MASAJES': 'Centro de Masajes',
      'CLINICA_DENTAL': 'Centro Dental',
      'CENTRO_FISIOTERAPIA': 'Centro de Fisioterapia',
      'OTRO': 'Otro'
    };
    return tipos[this.tipoNegocio] || this.tipoNegocio;
  }

  get estadoDisplay(): string {
    const estados = {
      'ACTIVO': 'Activo',
      'INACTIVO': 'Inactivo',
      'PENDIENTE_VERIFICACION': 'Pendiente de Verificación',
      'SUSPENDIDO': 'Suspendido'
    };
    return estados[this.estado] || this.estado;
  }

  get estadoColor(): string {
    const colores = {
      'ACTIVO': 'success',
      'INACTIVO': 'secondary',
      'PENDIENTE_VERIFICACION': 'warning',
      'SUSPENDIDO': 'danger'
    };
    return colores[this.estado] || 'secondary';
  }

  // Getters de horarios
  get estaAbierto(): boolean {
    const ahora = new Date();
    const diaSemana = this.getDiaSemanaActual();
    const horarioHoy = this.horariosAtencion.find(h => h.diaSemana === diaSemana);

    if (!horarioHoy || horarioHoy.cerrado) {
      return false;
    }

    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    const [aperturaH, aperturaM] = horarioHoy.horaApertura.split(':').map(Number);
    const [cierreH, cierreM] = horarioHoy.horaCierre.split(':').map(Number);

    const horaApertura = aperturaH * 60 + aperturaM;
    const horaCierre = cierreH * 60 + cierreM;

    // Verificar si hay descanso
    if (horarioHoy.descansoInicio && horarioHoy.descansoFin) {
      const [descansoInicioH, descansoInicioM] = horarioHoy.descansoInicio.split(':').map(Number);
      const [descansoFinH, descansoFinM] = horarioHoy.descansoFin.split(':').map(Number);
      const horaDescansoInicio = descansoInicioH * 60 + descansoInicioM;
      const horaDescansoFin = descansoFinH * 60 + descansoFinM;

      if (horaActual >= horaDescansoInicio && horaActual < horaDescansoFin) {
        return false;
      }
    }

    return horaActual >= horaApertura && horaActual < horaCierre;
  }

  get horarioHoy(): string {
    const diaSemana = this.getDiaSemanaActual();
    const horario = this.horariosAtencion.find(h => h.diaSemana === diaSemana);

    if (!horario || horario.cerrado) {
      return 'Cerrado';
    }

    const descanso = horario.descansoInicio && horario.descansoFin
      ? ` (Descanso: ${horario.descansoInicio} - ${horario.descansoFin})`
      : '';

    return `${horario.horaApertura} - ${horario.horaCierre}${descanso}`;
  }

  get proximaApertura(): string {
    if (this.estaAbierto) {
      return 'Abierto ahora';
    }

    const ahora = new Date();
    const diasSemana: DiaSemana[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
    let diaActual = ahora.getDay() === 0 ? 6 : ahora.getDay() - 1; // Convertir domingo=0 a domingo=6

    for (let i = 0; i < 7; i++) {
      const dia = diasSemana[diaActual];
      const horario = this.horariosAtencion.find(h => h.diaSemana === dia);

      if (horario && !horario.cerrado) {
        if (i === 0) {
          // Mismo día, verificar si aún no ha abierto
          const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
          const [aperturaH, aperturaM] = horario.horaApertura.split(':').map(Number);
          const horaApertura = aperturaH * 60 + aperturaM;

          if (horaActual < horaApertura) {
            return `Abre hoy a las ${horario.horaApertura}`;
          }
        } else {
          const nombreDia = this.getNombreDia(dia);
          return `Abre ${nombreDia} a las ${horario.horaApertura}`;
        }
      }

      diaActual = (diaActual + 1) % 7;
    }

    return 'Horarios no disponibles';
  }

  // Getters de métricas
  get calificacionEstrellas(): number {
    return Math.round((this.calificacion || 0) * 2) / 2; // Redondear a .5
  }

  get calificacionFormateada(): string {
    return this.calificacion ? this.calificacion.toFixed(1) : 'Sin calificar';
  }

  get tieneReseñas(): boolean {
    return this.totalReseñas > 0;
  }

  // Getters de categorías y servicios
  get categoriasNombres(): string[] {
    return this.categorias.map(e => e.nombre);
  }

  get categoriasPrincipales(): CategoriaDTO[] {
    return this.categorias.slice(0, 3);
  }

  get serviciosActivos(): ServicioDTO[] {
    return this.servicios.filter(s => s.activo);
  }

  get rangoPrecios(): { min: number; max: number } | null {
    const serviciosConPrecio = this.serviciosActivos.filter(s => s.precio && s.precio > 0);

    if (serviciosConPrecio.length === 0) {
      return null;
    }

    const precios = serviciosConPrecio.map(s => s.precio!);
    return {
      min: Math.min(...precios),
      max: Math.max(...precios)
    };
  }

  get rangoPreciosFormateado(): string {
    const rango = this.rangoPrecios;
    if (!rango) {
      return 'Consultar precios';
    }

    if (rango.min === rango.max) {
      return `€${rango.min}`;
    }

    return `€${rango.min} - €${rango.max}`;
  }

  // Getters de fotos
  get fotoPrincipal(): FotoDTO | null {
    return this.fotos.find(f => f.esPrincipal) || this.fotos[0] || null;
  }

  get fotosSecundarias(): FotoDTO[] {
    return this.fotos.filter(f => !f.esPrincipal);
  }

  // Métodos de estado
  get esActivo(): boolean {
    return this.estado === 'ACTIVO';
  }

  get estaSuspendido(): boolean {
    return this.estado === 'SUSPENDIDO';
  }

  get necesitaVerificacion(): boolean {
    return this.estado === 'PENDIENTE_VERIFICACION';
  }

  // Métodos de utilidad
  private getDiaSemanaActual(): DiaSemana {
    const dias: DiaSemana[] = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return dias[new Date().getDay()];
  }

  private getNombreDia(dia: DiaSemana): string {
    const nombres = {
      'LUNES': 'lunes',
      'MARTES': 'martes',
      'MIERCOLES': 'miércoles',
      'JUEVES': 'jueves',
      'VIERNES': 'viernes',
      'SABADO': 'sábado',
      'DOMINGO': 'domingo'
    };
    return nombres[dia] || dia.toLowerCase();
  }

  // Métodos de búsqueda y filtros
  tieneEspecialidad(especialidadId: number): boolean {
    return this.categorias.some(e => e.id === especialidadId);
  }

  ofreceTipoServicio(servicioNombre: string): boolean {
    return this.serviciosActivos.some(s =>
      s.nombre.toLowerCase().includes(servicioNombre.toLowerCase())
    );
  }

  calcularDistancia(latitud: number, longitud: number): number | null {
    const coords = this.coordenadas;
    if (!coords) return null;

    // Fórmula de Haversine para calcular distancia entre coordenadas
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(coords.latitud - latitud);
    const dLon = this.toRad(coords.longitud - longitud);
    const lat1 = this.toRad(latitud);
    const lat2 = this.toRad(coords.latitud);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  // Métodos de configuración
  get permiteCancelacionUsuario(): boolean {
    return this.configuracion.permiteCancelacion;
  }

  get horasLimiteCancelacion(): number {
    return this.configuracion.tiempoLimiteCancelacion;
  }

  puedeSerCancelada(fechaCita: Date): boolean {
    if (!this.permiteCancelacionUsuario) return false;

    const ahora = new Date();
    const limiteCancelacion = new Date(fechaCita.getTime() - (this.horasLimiteCancelacion * 60 * 60 * 1000));

    return ahora < limiteCancelacion;
  }

  // Método para exportar datos
  toJSON(): any {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      tipoNegocio: this.tipoNegocio,
      estado: this.estado,
      telefono: this.telefono,
      email: this.email,
      sitioWeb: this.sitioWeb,
      direccion: this.direccion,
      horariosAtencion: this.horariosAtencion,
      categorias: this.categorias,
      servicios: this.servicios,
      fechaRegistro: this.fechaRegistro.toISOString(),
      fechaActualizacion: this.fechaActualizacion.toISOString(),
      propietario: this.propietario,
      calificacion: this.calificacion,
      totalReseñas: this.totalReseñas,
      totalProfesionales: this.totalProfesionales,
      fotos: this.fotos,
      logo: this.logo,
      configuracion: this.configuracion
    };
  }

  // Métodos estáticos
  static fromDTO(dto: NegocioResponseDTO): Negocio {
    return new Negocio(dto);
  }

  static fromDTOList(dtos: NegocioResponseDTO[]): Negocio[] {
    return dtos.map(dto => new Negocio(dto));
  }

  static filtrarPorEspecialidad(negocios: Negocio[], especialidadId: number): Negocio[] {
    return negocios.filter(negocio => negocio.tieneEspecialidad(especialidadId));
  }

  static ordenarPorCalificacion(negocios: Negocio[]): Negocio[] {
    return negocios.sort((a, b) => (b.calificacion || 0) - (a.calificacion || 0));
  }

  static ordenarPorDistancia(negocios: Negocio[], latitud: number, longitud: number): Negocio[] {
    return negocios
      .map(negocio => ({
        negocio,
        distancia: negocio.calcularDistancia(latitud, longitud) || Infinity
      }))
      .sort((a, b) => a.distancia - b.distancia)
      .map(item => item.negocio);
  }
}