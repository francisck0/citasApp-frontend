/**
 * Componente de calendario de disponibilidad para seleccionar fechas y horas
 */

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil } from 'rxjs';

import { CitaService } from '../../services/cita.service';
import { ProfesionalService } from '../../services/profesional.service';

export interface DisponibilidadDia {
  fecha: Date;
  disponible: boolean;
  horarios: HorarioDisponible[];
  esFestivo?: boolean;
  motivo?: string;
}

export interface HorarioDisponible {
  hora: string;
  disponible: boolean;
  ocupado?: boolean;
  precio?: number;
}

export interface SeleccionCalendario {
  fecha: Date;
  hora: string;
  duracionMinutos: number;
}

@Component({
  selector: 'app-calendario-disponibilidad',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  template: `
    <div class="calendario-container">
      <!-- Header del calendario -->
      <div class="calendario-header">
        <button mat-icon-button (click)="mesAnterior()" [disabled]="!puedeRetroceder()">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <h2>{{ mesActual | date:'MMMM yyyy' | titlecase }}</h2>
        <button mat-icon-button (click)="mesSiguiente()" [disabled]="!puedeAvanzar()">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>

      <!-- Vista del calendario -->
      <div class="vista-calendario">
        <!-- Selector de vista -->
        <div class="vista-selector">
          <mat-chip-set>
            <mat-chip
              [class.selected]="vistaActual === 'mes'"
              (click)="cambiarVista('mes')">
              Mes
            </mat-chip>
            <mat-chip
              [class.selected]="vistaActual === 'semana'"
              (click)="cambiarVista('semana')">
              Semana
            </mat-chip>
            <mat-chip
              [class.selected]="vistaActual === 'dia'"
              (click)="cambiarVista('dia')">
              Día
            </mat-chip>
          </mat-chip-set>
        </div>

        <!-- Loading -->
        <div class="loading" *ngIf="cargando">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando disponibilidad...</p>
        </div>

        <!-- Vista de mes -->
        <div class="vista-mes" *ngIf="vistaActual === 'mes' && !cargando">
          <div class="dias-semana">
            <div class="dia-header" *ngFor="let dia of diasSemana">{{ dia }}</div>
          </div>
          <div class="calendario-grid">
            <div
              *ngFor="let dia of diasDelMes"
              class="dia-celda"
              [class.otro-mes]="!esMesActual(dia.fecha)"
              [class.hoy]="esHoy(dia.fecha)"
              [class.seleccionado]="esDiaSeleccionado(dia.fecha)"
              [class.disponible]="dia.disponible"
              [class.no-disponible]="!dia.disponible"
              (click)="seleccionarDia(dia)">

              <span class="numero-dia">{{ dia.fecha.getDate() }}</span>

              <div class="indicadores" *ngIf="dia.disponible">
                <div class="horarios-disponibles">
                  <mat-icon
                    [matBadge]="getHorariosDisponiblesCount(dia)"
                    matBadgeSize="small"
                    matBadgeColor="primary">
                    schedule
                  </mat-icon>
                </div>
              </div>

              <div class="no-disponible-indicador" *ngIf="!dia.disponible">
                <mat-icon matTooltip="{{ dia.motivo || 'No disponible' }}">block</mat-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- Vista de semana -->
        <div class="vista-semana" *ngIf="vistaActual === 'semana' && !cargando">
          <div class="semana-header">
            <div class="hora-column"></div>
            <div
              *ngFor="let dia of diasSemanaActual"
              class="dia-column-header"
              [class.hoy]="esHoy(dia.fecha)"
              [class.seleccionado]="esDiaSeleccionado(dia.fecha)">
              <div class="dia-nombre">{{ dia.fecha | date:'EEE' }}</div>
              <div class="dia-numero">{{ dia.fecha.getDate() }}</div>
            </div>
          </div>
          <div class="semana-grid">
            <div class="horas-column">
              <div *ngFor="let hora of horasDelDia" class="hora-label">{{ hora }}</div>
            </div>
            <div
              *ngFor="let dia of diasSemanaActual"
              class="dia-column"
              [class.no-disponible]="!dia.disponible">
              <div
                *ngFor="let hora of dia.horarios"
                class="horario-slot"
                [class.disponible]="hora.disponible && !hora.ocupado"
                [class.ocupado]="hora.ocupado"
                [class.seleccionado]="esHorarioSeleccionado(dia.fecha, hora.hora)"
                (click)="seleccionarHorario(dia.fecha, hora.hora)"
                [matTooltip]="getTooltipHorario(hora)">
                <span *ngIf="hora.disponible && !hora.ocupado">{{ hora.precio ? hora.precio + '€' : '' }}</span>
                <mat-icon *ngIf="hora.ocupado">block</mat-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- Vista de día -->
        <div class="vista-dia" *ngIf="vistaActual === 'dia' && !cargando">
          <div class="dia-header-detail">
            <h3>{{ fechaSeleccionada | date:'fullDate' | titlecase }}</h3>
            <div class="navegacion-dia">
              <button mat-icon-button (click)="diaAnterior()">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <button mat-icon-button (click)="diaSiguiente()">
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>
          </div>

          <div class="horarios-dia" *ngIf="diaActual">
            <div class="horarios-grid">
              <mat-card
                *ngFor="let horario of diaActual.horarios"
                class="horario-card"
                [class.disponible]="horario.disponible && !horario.ocupado"
                [class.ocupado]="horario.ocupado"
                [class.no-disponible]="!horario.disponible"
                [class.seleccionado]="esHorarioSeleccionado(diaActual.fecha, horario.hora)"
                (click)="seleccionarHorario(diaActual.fecha, horario.hora)">
                <mat-card-content>
                  <div class="horario-info">
                    <span class="hora">{{ horario.hora }}</span>
                    <span class="estado">
                      <mat-icon *ngIf="horario.disponible && !horario.ocupado">check_circle</mat-icon>
                      <mat-icon *ngIf="horario.ocupado">block</mat-icon>
                      <mat-icon *ngIf="!horario.disponible">cancel</mat-icon>
                    </span>
                  </div>
                  <div class="precio" *ngIf="horario.precio && horario.disponible">
                    {{ horario.precio }}€
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div class="no-horarios" *ngIf="!diaActual.disponible || diaActual.horarios.length === 0">
              <mat-icon>event_busy</mat-icon>
              <p>{{ diaActual.motivo || 'No hay horarios disponibles para este día' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Información de selección -->
      <div class="seleccion-info" *ngIf="seleccion">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Horario Seleccionado</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="seleccion-detalles">
              <p><strong>Fecha:</strong> {{ seleccion.fecha | date:'fullDate' }}</p>
              <p><strong>Hora:</strong> {{ seleccion.hora }}</p>
              <p><strong>Duración:</strong> {{ seleccion.duracionMinutos }} minutos</p>
            </div>
            <div class="seleccion-acciones">
              <button mat-button (click)="limpiarSeleccion()">Limpiar</button>
              <button mat-raised-button color="primary" (click)="confirmarSeleccion()">
                Confirmar Horario
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Leyenda -->
      <div class="leyenda">
        <div class="leyenda-item">
          <mat-icon class="icono-disponible">check_circle</mat-icon>
          <span>Disponible</span>
        </div>
        <div class="leyenda-item">
          <mat-icon class="icono-ocupado">block</mat-icon>
          <span>Ocupado</span>
        </div>
        <div class="leyenda-item">
          <mat-icon class="icono-no-disponible">cancel</mat-icon>
          <span>No disponible</span>
        </div>
        <div class="leyenda-item">
          <mat-icon class="icono-seleccionado">radio_button_checked</mat-icon>
          <span>Seleccionado</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendario-container {
      max-width: 1000px;
      margin: 0 auto;
    }

    .calendario-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding: 0 16px;
    }

    .calendario-header h2 {
      margin: 0;
      color: #333;
    }

    .vista-selector {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
    }

    .vista-selector mat-chip {
      cursor: pointer;
    }

    .vista-selector mat-chip.selected {
      background-color: #1976d2;
      color: white;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: #666;
    }

    /* Vista de mes */
    .vista-mes {
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .dias-semana {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      margin-bottom: 8px;
    }

    .dia-header {
      text-align: center;
      padding: 12px;
      font-weight: 500;
      color: #666;
      background: #f5f5f5;
    }

    .calendario-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: #e0e0e0;
    }

    .dia-celda {
      background: white;
      min-height: 80px;
      padding: 8px;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }

    .dia-celda:hover {
      background: #f0f7ff;
    }

    .dia-celda.otro-mes {
      color: #ccc;
      background: #fafafa;
    }

    .dia-celda.hoy {
      background: #e3f2fd;
    }

    .dia-celda.seleccionado {
      background: #1976d2;
      color: white;
    }

    .dia-celda.no-disponible {
      background: #f5f5f5;
      color: #999;
      cursor: not-allowed;
    }

    .numero-dia {
      font-weight: 500;
    }

    .indicadores {
      position: absolute;
      bottom: 4px;
      right: 4px;
    }

    .horarios-disponibles mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
      color: #4caf50;
    }

    .no-disponible-indicador {
      position: absolute;
      bottom: 4px;
      right: 4px;
    }

    .no-disponible-indicador mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
      color: #f44336;
    }

    /* Vista de semana */
    .vista-semana {
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .semana-header {
      display: grid;
      grid-template-columns: 80px repeat(7, 1fr);
      gap: 1px;
      margin-bottom: 8px;
    }

    .dia-column-header {
      text-align: center;
      padding: 12px 4px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .dia-column-header.hoy {
      background: #e3f2fd;
    }

    .dia-column-header.seleccionado {
      background: #1976d2;
      color: white;
    }

    .dia-nombre {
      font-size: 0.8rem;
      color: #666;
    }

    .dia-numero {
      font-weight: 500;
      font-size: 1.1rem;
    }

    .semana-grid {
      display: grid;
      grid-template-columns: 80px repeat(7, 1fr);
      gap: 1px;
    }

    .horas-column {
      display: flex;
      flex-direction: column;
    }

    .hora-label {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      color: #666;
      border-bottom: 1px solid #e0e0e0;
    }

    .dia-column {
      display: flex;
      flex-direction: column;
    }

    .horario-slot {
      height: 40px;
      border-bottom: 1px solid #e0e0e0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      transition: all 0.2s;
    }

    .horario-slot.disponible {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .horario-slot.disponible:hover {
      background: #c8e6c9;
    }

    .horario-slot.ocupado {
      background: #ffebee;
      color: #c62828;
      cursor: not-allowed;
    }

    .horario-slot.seleccionado {
      background: #1976d2;
      color: white;
    }

    /* Vista de día */
    .vista-dia {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .dia-header-detail {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .dia-header-detail h3 {
      margin: 0;
      color: #333;
    }

    .navegacion-dia {
      display: flex;
      gap: 8px;
    }

    .horarios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .horario-card {
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
    }

    .horario-card.disponible {
      border-color: #4caf50;
    }

    .horario-card.disponible:hover {
      box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
    }

    .horario-card.ocupado {
      border-color: #f44336;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .horario-card.no-disponible {
      border-color: #ccc;
      cursor: not-allowed;
      opacity: 0.5;
    }

    .horario-card.seleccionado {
      border-color: #1976d2;
      background: #e3f2fd;
    }

    .horario-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .hora {
      font-size: 1.2rem;
      font-weight: 500;
    }

    .estado mat-icon {
      font-size: 20px;
      height: 20px;
      width: 20px;
    }

    .estado .mat-icon {
      color: #4caf50;
    }

    .precio {
      margin-top: 8px;
      font-weight: 500;
      color: #1976d2;
    }

    .no-horarios {
      text-align: center;
      padding: 48px;
      color: #666;
    }

    .no-horarios mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
      color: #ccc;
    }

    /* Selección info */
    .seleccion-info {
      margin-top: 24px;
    }

    .seleccion-detalles p {
      margin: 8px 0;
    }

    .seleccion-acciones {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 16px;
    }

    /* Leyenda */
    .leyenda {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-top: 24px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .leyenda-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
    }

    .icono-disponible { color: #4caf50; }
    .icono-ocupado { color: #f44336; }
    .icono-no-disponible { color: #9e9e9e; }
    .icono-seleccionado { color: #1976d2; }

    /* Responsive */
    @media (max-width: 768px) {
      .calendario-container {
        padding: 0 8px;
      }

      .calendario-grid {
        grid-template-columns: repeat(7, minmax(40px, 1fr));
      }

      .dia-celda {
        min-height: 60px;
        padding: 4px;
      }

      .semana-grid {
        grid-template-columns: 60px repeat(7, 1fr);
      }

      .horarios-grid {
        grid-template-columns: 1fr;
      }

      .leyenda {
        flex-wrap: wrap;
        gap: 12px;
      }

      .vista-selector {
        margin-bottom: 16px;
      }
    }
  `]
})
export class CalendarioDisponibilidadComponent implements OnInit, OnDestroy, OnChanges {
  private destroy$ = new Subject<void>();

  @Input() profesionalId?: number;
  @Input() duracionMinutos: number = 60;
  @Input() fechaMinima?: Date;
  @Input() fechaMaxima?: Date;

  @Output() seleccionChange = new EventEmitter<SeleccionCalendario | null>();
  @Output() fechaChange = new EventEmitter<Date>();

  // Estado del calendario
  mesActual = new Date();
  vistaActual: 'mes' | 'semana' | 'dia' = 'mes';
  fechaSeleccionada?: Date;
  seleccion: SeleccionCalendario | null = null;
  cargando = false;

  // Datos
  diasDelMes: DisponibilidadDia[] = [];
  diasSemanaActual: DisponibilidadDia[] = [];
  diaActual: DisponibilidadDia | null = null;

  // Configuración
  diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  horasDelDia = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  constructor(
    private citaService: CitaService,
    private profesionalService: ProfesionalService
  ) {
    this.fechaMinima = this.fechaMinima || new Date();
    this.fechaMaxima = this.fechaMaxima || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 3 meses
  }

  ngOnInit(): void {
    this.cargarDisponibilidad();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profesionalId'] || changes['duracionMinutos']) {
      this.cargarDisponibilidad();
    }
  }

  cargarDisponibilidad(): void {
    if (!this.profesionalId) return;

    this.cargando = true;

    // Simular carga de disponibilidad
    setTimeout(() => {
      this.generarDiasDelMes();
      this.generarDiasSemana();
      this.cargando = false;
    }, 1000);
  }

  generarDiasDelMes(): void {
    const primerDia = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth(), 1);
    const ultimoDia = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() + 1, 0);

    const dias: DisponibilidadDia[] = [];

    // Días del mes anterior para completar la primera semana
    const diasAntes = primerDia.getDay();
    for (let i = diasAntes - 1; i >= 0; i--) {
      const fecha = new Date(primerDia.getTime() - (i + 1) * 24 * 60 * 60 * 1000);
      dias.push(this.crearDiaDisponibilidad(fecha, false));
    }

    // Días del mes actual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth(), dia);
      dias.push(this.crearDiaDisponibilidad(fecha, true));
    }

    // Días del mes siguiente para completar la última semana
    const diasDespues = 42 - dias.length; // 6 semanas * 7 días
    for (let i = 1; i <= diasDespues; i++) {
      const fecha = new Date(ultimoDia.getTime() + i * 24 * 60 * 60 * 1000);
      dias.push(this.crearDiaDisponibilidad(fecha, false));
    }

    this.diasDelMes = dias;
  }

  generarDiasSemana(): void {
    // Obtener la semana de la fecha seleccionada o fecha actual
    const referencia = this.fechaSeleccionada || new Date();
    const inicioSemana = this.getInicioSemana(referencia);

    this.diasSemanaActual = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(inicioSemana.getTime() + i * 24 * 60 * 60 * 1000);
      this.diasSemanaActual.push(this.crearDiaDisponibilidad(fecha, true));
    }
  }

  crearDiaDisponibilidad(fecha: Date, disponibleBase: boolean): DisponibilidadDia {
    const esFinDeSemana = fecha.getDay() === 0 || fecha.getDay() === 6;
    const esPasado = fecha < new Date();
    const esFuturoLejano = this.fechaMaxima && fecha > this.fechaMaxima;

    let disponible = disponibleBase && !esPasado && !esFuturoLejano;
    let motivo = '';

    if (esPasado) {
      disponible = false;
      motivo = 'Fecha pasada';
    } else if (esFuturoLejano) {
      disponible = false;
      motivo = 'Fuera del rango permitido';
    } else if (esFinDeSemana) {
      disponible = false;
      motivo = 'Fin de semana - Cerrado';
    }

    const horarios: HorarioDisponible[] = this.horasDelDia.map(hora => ({
      hora,
      disponible: disponible && Math.random() > 0.3, // Simular disponibilidad
      ocupado: disponible && Math.random() < 0.2, // Simular horarios ocupados
      precio: disponible ? Math.floor(Math.random() * 50) + 30 : undefined
    }));

    return {
      fecha,
      disponible,
      horarios,
      esFestivo: esFinDeSemana,
      motivo
    };
  }

  getInicioSemana(fecha: Date): Date {
    const dia = fecha.getDay();
    const diff = fecha.getDate() - dia;
    return new Date(fecha.setDate(diff));
  }

  // Navegación
  mesAnterior(): void {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() - 1, 1);
    this.generarDiasDelMes();
  }

  mesSiguiente(): void {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() + 1, 1);
    this.generarDiasDelMes();
  }

  diaAnterior(): void {
    if (this.fechaSeleccionada) {
      const nuevaFecha = new Date(this.fechaSeleccionada.getTime() - 24 * 60 * 60 * 1000);
      this.seleccionarDia(this.crearDiaDisponibilidad(nuevaFecha, true));
    }
  }

  diaSiguiente(): void {
    if (this.fechaSeleccionada) {
      const nuevaFecha = new Date(this.fechaSeleccionada.getTime() + 24 * 60 * 60 * 1000);
      this.seleccionarDia(this.crearDiaDisponibilidad(nuevaFecha, true));
    }
  }

  puedeRetroceder(): boolean {
    const mesMinimo = this.fechaMinima ? new Date(this.fechaMinima.getFullYear(), this.fechaMinima.getMonth(), 1) : new Date();
    return this.mesActual > mesMinimo;
  }

  puedeAvanzar(): boolean {
    const mesMaximo = this.fechaMaxima ? new Date(this.fechaMaxima.getFullYear(), this.fechaMaxima.getMonth(), 1) :
                     new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    return this.mesActual < mesMaximo;
  }

  // Cambio de vista
  cambiarVista(vista: 'mes' | 'semana' | 'dia'): void {
    this.vistaActual = vista;

    if (vista === 'semana') {
      this.generarDiasSemana();
    } else if (vista === 'dia' && this.fechaSeleccionada) {
      this.diaActual = this.crearDiaDisponibilidad(this.fechaSeleccionada, true);
    }
  }

  // Selección
  seleccionarDia(dia: DisponibilidadDia): void {
    if (!dia.disponible) return;

    this.fechaSeleccionada = dia.fecha;
    this.diaActual = dia;
    this.fechaChange.emit(dia.fecha);

    if (this.vistaActual === 'mes') {
      this.cambiarVista('dia');
    }
  }

  seleccionarHorario(fecha: Date, hora: string): void {
    const dia = this.obtenerDiaDisponibilidad(fecha);
    if (!dia) return;

    const horario = dia.horarios.find(h => h.hora === hora);
    if (!horario || !horario.disponible || horario.ocupado) return;

    this.seleccion = {
      fecha,
      hora,
      duracionMinutos: this.duracionMinutos
    };

    this.seleccionChange.emit(this.seleccion);
  }

  obtenerDiaDisponibilidad(fecha: Date): DisponibilidadDia | undefined {
    const fechaStr = fecha.toDateString();
    return this.diasDelMes.find(d => d.fecha.toDateString() === fechaStr) ||
           this.diasSemanaActual.find(d => d.fecha.toDateString() === fechaStr) ||
           (this.diaActual?.fecha.toDateString() === fechaStr ? this.diaActual : undefined);
  }

  limpiarSeleccion(): void {
    this.seleccion = null;
    this.seleccionChange.emit(null);
  }

  confirmarSeleccion(): void {
    if (this.seleccion) {
      this.seleccionChange.emit(this.seleccion);
    }
  }

  // Utilidades
  esMesActual(fecha: Date): boolean {
    return fecha.getMonth() === this.mesActual.getMonth() &&
           fecha.getFullYear() === this.mesActual.getFullYear();
  }

  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }

  esDiaSeleccionado(fecha: Date): boolean {
    return this.fechaSeleccionada?.toDateString() === fecha.toDateString();
  }

  esHorarioSeleccionado(fecha: Date, hora: string): boolean {
    return this.seleccion?.fecha.toDateString() === fecha.toDateString() &&
           this.seleccion?.hora === hora;
  }

  getTooltipHorario(horario: HorarioDisponible): string {
    if (horario.ocupado) return 'Horario ocupado';
    if (!horario.disponible) return 'No disponible';
    return `Disponible${horario.precio ? ' - ' + horario.precio + '€' : ''}`;
  }

  getHorariosDisponiblesCount(dia: DisponibilidadDia): number {
    return dia.horarios.filter(h => h.disponible).length;
  }
}