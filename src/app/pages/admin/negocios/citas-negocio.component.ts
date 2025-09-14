/**
 * Panel de administración para ver todas las citas del negocio
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { CitaService } from '../../../services/cita.service';
import { NegocioService } from '../../../services/negocio.service';
import { Cita } from '../../../models/cita.model';
import { Negocio } from '../../../models/negocio.model';
import { EstadoCita } from '../../../interfaces/cita-dtos.interface';

@Component({
  selector: 'app-citas-negocio',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatDividerModule
  ],
  template: `
    <div class="citas-negocio-container">
      <!-- Header -->
      <div class="header">
        <button mat-icon-button (click)="volver()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h1>Administración de Citas</h1>
          <p *ngIf="negocio">{{ negocio.nombre }}</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="exportarCitas()">
            <mat-icon>download</mat-icon>
            Exportar
          </button>
          <button mat-raised-button color="primary" (click)="nuevaCita()">
            <mat-icon>add</mat-icon>
            Nueva Cita
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <mat-tab-group [(selectedIndex)]="tabActivo" (selectedIndexChange)="cambiarTab($event)">
        <!-- Vista Resumen -->
        <mat-tab label="Resumen">
          <div class="tab-content">
            <!-- Stats Cards -->
            <div class="stats-cards">
              <mat-card class="stat-card clickable" (click)="filtrarPorEstado('todas')">
                <mat-card-content>
                  <div class="stat-content">
                    <div class="stat-icon total">
                      <mat-icon>event</mat-icon>
                    </div>
                    <div class="stat-info">
                      <h3>{{ estadisticas.total }}</h3>
                      <p>Total Citas</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card clickable" (click)="filtrarPorEstado('hoy')">
                <mat-card-content>
                  <div class="stat-content">
                    <div class="stat-icon hoy">
                      <mat-icon>today</mat-icon>
                    </div>
                    <div class="stat-info">
                      <h3>{{ estadisticas.hoy }}</h3>
                      <p>Citas Hoy</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card clickable" (click)="filtrarPorEstado('PENDIENTE')">
                <mat-card-content>
                  <div class="stat-content">
                    <div class="stat-icon pendientes">
                      <mat-icon>pending</mat-icon>
                    </div>
                    <div class="stat-info">
                      <h3>{{ estadisticas.pendientes }}</h3>
                      <p>Pendientes</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card clickable" (click)="filtrarPorEstado('CONFIRMADA')">
                <mat-card-content>
                  <div class="stat-content">
                    <div class="stat-icon confirmadas">
                      <mat-icon>check_circle</mat-icon>
                    </div>
                    <div class="stat-info">
                      <h3>{{ estadisticas.confirmadas }}</h3>
                      <p>Confirmadas</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card clickable" (click)="filtrarPorEstado('ingresos')">
                <mat-card-content>
                  <div class="stat-content">
                    <div class="stat-icon ingresos">
                      <mat-icon>euro_symbol</mat-icon>
                    </div>
                    <div class="stat-info">
                      <h3>{{ estadisticas.ingresosMes | currency:'EUR' }}</h3>
                      <p>Ingresos Mes</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Chart Placeholder -->
            <mat-card class="chart-card">
              <mat-card-header>
                <mat-card-title>Citas por Día</mat-card-title>
                <mat-card-subtitle>Últimos 30 días</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="chart-placeholder">
                  <mat-icon>bar_chart</mat-icon>
                  <p>Gráfico de citas próximamente disponible</p>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Vista Lista -->
        <mat-tab label="Lista de Citas" [matBadge]="totalCitas" matBadgeOverlap="false">
          <div class="tab-content">
            <!-- Filters -->
            <mat-card class="filters-card">
              <mat-card-content>
                <form [formGroup]="filtrosForm">
                  <div class="filters-grid">
                    <mat-form-field>
                      <mat-label>Buscar</mat-label>
                      <input matInput formControlName="busqueda" placeholder="Cliente, profesional...">
                      <mat-icon matSuffix>search</mat-icon>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Estado</mat-label>
                      <mat-select formControlName="estado">
                        <mat-option value="">Todos</mat-option>
                        <mat-option value="PENDIENTE">Pendiente</mat-option>
                        <mat-option value="CONFIRMADA">Confirmada</mat-option>
                        <mat-option value="EN_CURSO">En Curso</mat-option>
                        <mat-option value="COMPLETADA">Completada</mat-option>
                        <mat-option value="CANCELADA">Cancelada</mat-option>
                        <mat-option value="NO_ASISTIO">No Asistió</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Fecha desde</mat-label>
                      <input matInput [matDatepicker]="fechaDesde" formControlName="fechaDesde">
                      <mat-datepicker-toggle matIconSuffix [for]="fechaDesde"></mat-datepicker-toggle>
                      <mat-datepicker #fechaDesde></mat-datepicker>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Fecha hasta</mat-label>
                      <input matInput [matDatepicker]="fechaHasta" formControlName="fechaHasta">
                      <mat-datepicker-toggle matIconSuffix [for]="fechaHasta"></mat-datepicker-toggle>
                      <mat-datepicker #fechaHasta></mat-datepicker>
                    </mat-form-field>

                    <button mat-button (click)="limpiarFiltros()">
                      <mat-icon>clear</mat-icon>
                      Limpiar
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>

            <!-- Loading -->
            <div class="loading" *ngIf="cargando">
              <mat-spinner diameter="50"></mat-spinner>
              <p>Cargando citas...</p>
            </div>

            <!-- Table -->
            <mat-card class="table-card" *ngIf="!cargando">
              <mat-table [dataSource]="citas" matSort (matSortChange)="ordenar($event)">
                <!-- Columna Cliente -->
                <ng-container matColumnDef="cliente">
                  <mat-header-cell *matHeaderCellDef mat-sort-header="usuario.nombre">Cliente</mat-header-cell>
                  <mat-cell *matCellDef="let cita">
                    <div class="cliente-info">
                      <strong>{{ cita.usuario.nombre }} {{ cita.usuario.apellidos }}</strong>
                      <p>{{ cita.usuario.email }}</p>
                      <p *ngIf="cita.usuario.telefono">{{ cita.usuario.telefono }}</p>
                    </div>
                  </mat-cell>
                </ng-container>

                <!-- Columna Profesional -->
                <ng-container matColumnDef="profesional">
                  <mat-header-cell *matHeaderCellDef>Profesional</mat-header-cell>
                  <mat-cell *matCellDef="let cita">
                    <div class="profesional-info">
                      <strong>{{ cita.profesionalNombre }}</strong>
                      <p>{{ cita.categoriaNombre }}</p>
                    </div>
                  </mat-cell>
                </ng-container>

                <!-- Columna Fecha/Hora -->
                <ng-container matColumnDef="fechaHora">
                  <mat-header-cell *matHeaderCellDef mat-sort-header="fechaCompleta">Fecha/Hora</mat-header-cell>
                  <mat-cell *matCellDef="let cita">
                    <div class="fecha-info">
                      <strong>{{ cita.fechaCorta }}</strong>
                      <p>{{ cita.horaFormateada }}</p>
                      <p class="duracion">{{ cita.duracionFormateada }}</p>
                    </div>
                  </mat-cell>
                </ng-container>

                <!-- Columna Servicio -->
                <ng-container matColumnDef="servicio">
                  <mat-header-cell *matHeaderCellDef>Servicio</mat-header-cell>
                  <mat-cell *matCellDef="let cita">
                    <div class="servicio-info">
                      <strong>{{ cita.tipoServicioDisplay }}</strong>
                      <mat-chip color="warn" *ngIf="cita.esUrgente">
                        <mat-icon matChipAvatar>priority_high</mat-icon>
                        Urgente
                      </mat-chip>
                    </div>
                  </mat-cell>
                </ng-container>

                <!-- Columna Estado -->
                <ng-container matColumnDef="estado">
                  <mat-header-cell *matHeaderCellDef mat-sort-header="estado">Estado</mat-header-cell>
                  <mat-cell *matCellDef="let cita">
                    <mat-chip [class]="'chip-' + cita.estadoColor">
                      {{ cita.estadoDisplay }}
                    </mat-chip>
                  </mat-cell>
                </ng-container>

                <!-- Columna Precio -->
                <ng-container matColumnDef="precio">
                  <mat-header-cell *matHeaderCellDef>Precio</mat-header-cell>
                  <mat-cell *matCellDef="let cita">
                    <strong *ngIf="cita.precio">{{ cita.precioFormateado }}</strong>
                    <span *ngIf="!cita.precio">-</span>
                  </mat-cell>
                </ng-container>

                <!-- Columna Acciones -->
                <ng-container matColumnDef="acciones">
                  <mat-header-cell *matHeaderCellDef>Acciones</mat-header-cell>
                  <mat-cell *matCellDef="let cita">
                    <button mat-icon-button [matMenuTriggerFor]="menu" [matMenuTriggerData]="{cita: cita}">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <ng-template matMenuContent let-cita="cita">
                        <button mat-menu-item (click)="verDetalleCita(cita)">
                          <mat-icon>visibility</mat-icon>
                          Ver Detalle
                        </button>
                        <button mat-menu-item *ngIf="cita.esPendiente" (click)="confirmarCita(cita)">
                          <mat-icon>check</mat-icon>
                          Confirmar
                        </button>
                        <button mat-menu-item *ngIf="cita.esConfirmada" (click)="iniciarCita(cita)">
                          <mat-icon>play_arrow</mat-icon>
                          Iniciar
                        </button>
                        <button mat-menu-item *ngIf="cita.esEnCurso" (click)="completarCita(cita)">
                          <mat-icon>check_circle</mat-icon>
                          Completar
                        </button>
                        <mat-divider></mat-divider>
                        <button mat-menu-item (click)="reagendarCita(cita)">
                          <mat-icon>edit_calendar</mat-icon>
                          Reagendar
                        </button>
                        <button mat-menu-item (click)="cancelarCita(cita)" class="cancel-action">
                          <mat-icon>cancel</mat-icon>
                          Cancelar
                        </button>
                      </ng-template>
                    </mat-menu>
                  </mat-cell>
                </ng-container>

                <mat-header-row *matHeaderRowDef="columnasMostradas"></mat-header-row>
                <mat-row *matRowDef="let row; columns: columnasMostradas;"
                         [class]="'row-' + row.estado.toLowerCase()"></mat-row>
              </mat-table>

              <!-- Empty State -->
              <div class="empty-state" *ngIf="citas.length === 0 && !cargando">
                <mat-icon>event_busy</mat-icon>
                <h3>No se encontraron citas</h3>
                <p>No hay citas que coincidan con los filtros seleccionados</p>
                <button mat-raised-button color="primary" (click)="limpiarFiltros()">
                  Limpiar Filtros
                </button>
              </div>

              <!-- Paginación -->
              <mat-paginator
                [length]="totalCitas"
                [pageSize]="tamanoPagina"
                [pageIndex]="paginaActual"
                [pageSizeOptions]="[10, 25, 50, 100]"
                (page)="onPageChange($event)"
                showFirstLastButtons>
              </mat-paginator>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Vista Calendario -->
        <mat-tab label="Calendario">
          <div class="tab-content">
            <div class="calendario-placeholder">
              <mat-icon>calendar_view_month</mat-icon>
              <h3>Vista de Calendario</h3>
              <p>Funcionalidad próximamente disponible</p>
              <ul>
                <li>Vista mensual con citas</li>
                <li>Drag & drop para reagendar</li>
                <li>Vista semanal detallada</li>
                <li>Bloques de tiempo libre</li>
              </ul>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .citas-negocio-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
    }

    .header-content {
      flex: 1;
    }

    .header-content h1 {
      margin: 0 0 4px 0;
      color: #333;
    }

    .header-content p {
      margin: 0;
      color: #666;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      cursor: pointer;
      transition: all 0.3s;
    }

    .stat-card.clickable:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }

    .stat-card .stat-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon mat-icon {
      color: white;
    }

    .stat-icon.total { background: linear-gradient(135deg, #2196f3, #1976d2); }
    .stat-icon.hoy { background: linear-gradient(135deg, #4caf50, #45a049); }
    .stat-icon.pendientes { background: linear-gradient(135deg, #ff9800, #f57c00); }
    .stat-icon.confirmadas { background: linear-gradient(135deg, #00bcd4, #0097a7); }
    .stat-icon.ingresos { background: linear-gradient(135deg, #9c27b0, #7b1fa2); }

    .stat-info h3 {
      margin: 0 0 4px 0;
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
    }

    .stat-info p {
      margin: 0;
      color: #666;
      font-size: 0.85rem;
    }

    .chart-card {
      margin-bottom: 32px;
    }

    .chart-placeholder {
      text-align: center;
      padding: 48px;
      color: #666;
    }

    .chart-placeholder mat-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr auto;
      gap: 16px;
      align-items: center;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: #666;
    }

    .loading mat-spinner {
      margin-bottom: 16px;
    }

    .table-card {
      overflow: hidden;
    }

    .cliente-info strong,
    .profesional-info strong,
    .fecha-info strong,
    .servicio-info strong {
      display: block;
      color: #333;
      margin-bottom: 2px;
    }

    .cliente-info p,
    .profesional-info p,
    .fecha-info p {
      color: #666;
      font-size: 0.85rem;
      margin: 1px 0;
    }

    .duracion {
      color: #999 !important;
      font-style: italic;
    }

    .servicio-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .chip-primary { background-color: #2196f3; color: white; }
    .chip-success { background-color: #4caf50; color: white; }
    .chip-warning { background-color: #ff9800; color: white; }
    .chip-danger { background-color: #f44336; color: white; }
    .chip-info { background-color: #00bcd4; color: white; }
    .chip-secondary { background-color: #9e9e9e; color: white; }

    .row-pendiente {
      background-color: rgba(255, 152, 0, 0.05);
    }

    .row-confirmada {
      background-color: rgba(33, 150, 243, 0.05);
    }

    .row-completada {
      background-color: rgba(76, 175, 80, 0.05);
    }

    .row-cancelada {
      background-color: rgba(244, 67, 54, 0.05);
      opacity: 0.7;
    }

    .cancel-action {
      color: #f44336;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin-bottom: 8px;
      color: #333;
    }

    .empty-state p {
      margin-bottom: 24px;
    }

    .calendario-placeholder {
      text-align: center;
      padding: 48px;
      color: #666;
    }

    .calendario-placeholder mat-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .calendario-placeholder h3 {
      margin-bottom: 12px;
      color: #333;
    }

    .calendario-placeholder p {
      margin-bottom: 16px;
    }

    .calendario-placeholder ul {
      text-align: left;
      display: inline-block;
      margin: 0;
    }

    @media (max-width: 768px) {
      .citas-negocio-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .header-actions {
        justify-content: center;
      }

      .stats-cards {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .stat-content {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class CitasNegocioComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  negocioId: number | null = null;
  negocio: Negocio | null = null;
  cargando = true;

  // Data
  citas: Cita[] = [];
  totalCitas = 0;

  // Pagination
  paginaActual = 0;
  tamanoPagina = 25;

  // Table
  columnasMostradas: string[] = ['cliente', 'profesional', 'fechaHora', 'servicio', 'estado', 'precio', 'acciones'];

  // Tabs
  tabActivo = 0;

  // Filters
  filtrosForm: FormGroup;

  // Stats
  estadisticas = {
    total: 0,
    hoy: 0,
    pendientes: 0,
    confirmadas: 0,
    ingresosMes: 0
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private citaService: CitaService,
    private negocioService: NegocioService
  ) {
    this.filtrosForm = this.fb.group({
      busqueda: [''],
      estado: [''],
      fechaDesde: [null],
      fechaHasta: [null]
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.negocioId = +params['id'];
      if (this.negocioId) {
        this.cargarNegocio();
        this.configurarFiltros();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  configurarFiltros(): void {
    this.filtrosForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.paginaActual = 0;
        this.cargarCitas();
      });
  }

  cargarNegocio(): void {
    if (!this.negocioId) return;

    this.negocioService.obtenerNegocioPorId(this.negocioId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (negocio) => {
          this.negocio = negocio;
          this.cargarCitas();
          this.cargarEstadisticas();
        },
        error: (error) => {
          console.error('Error al cargar negocio:', error);
          this.snackBar.open('Error al cargar negocio', 'Cerrar', { duration: 3000 });
        }
      });
  }

  cargarCitas(): void {
    this.cargando = true;
    const filtros = this.construirFiltros();

    // TODO: Implementar servicio para obtener citas del negocio
    // this.citaService.obtenerCitasNegocio(this.negocioId!, filtros)
    setTimeout(() => {
      // Datos simulados
      this.citas = this.generarCitasSimuladas();
      this.totalCitas = this.citas.length;
      this.cargando = false;
    }, 1000);
  }

  cargarEstadisticas(): void {
    // TODO: Implementar servicio para estadísticas del negocio
    this.estadisticas = {
      total: 245,
      hoy: 12,
      pendientes: 8,
      confirmadas: 15,
      ingresosMes: 5420
    };
  }

  generarCitasSimuladas(): Cita[] {
    // Simulación de datos para pruebas
    const citasSimuladas = [];
    const estados: EstadoCita[] = ['PENDIENTE', 'CONFIRMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA'];

    for (let i = 0; i < 50; i++) {
      const fechaBase = new Date();
      fechaBase.setDate(fechaBase.getDate() + Math.floor(Math.random() * 30) - 15);

      const citaData = {
        id: i + 1,
        usuario: {
          id: i + 1,
          nombre: `Cliente${i + 1}`,
          apellidos: `Apellido${i + 1}`,
          email: `cliente${i + 1}@email.com`,
          telefono: `600${String(i + 1).padStart(6, '0')}`
        },
        profesional: {
          id: 1,
          usuario: { nombre: 'Dr.', apellidos: 'Profesional' },
          categoria: { nombre: 'Medicina General' },
          negocio: { nombre: this.negocio?.nombre || 'Negocio' }
        },
        fecha: fechaBase.toISOString(),
        hora: `${9 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '00' : '30'}`,
        fechaCompleta: fechaBase.toISOString(),
        estado: estados[Math.floor(Math.random() * estados.length)],
        tipoServicio: 'CONSULTA',
        duracionMinutos: [30, 60, 90][Math.floor(Math.random() * 3)],
        precio: Math.floor(Math.random() * 100) + 50,
        fechaCreacion: fechaBase.toISOString(),
        fechaActualizacion: fechaBase.toISOString(),
        recordatorioEnviado: false,
        esUrgente: Math.random() > 0.8
      };

      // Crear instancia de Cita con datos simulados
      const cita = new (Cita as any)(citaData);
      citasSimuladas.push(cita);
    }

    return citasSimuladas;
  }

  construirFiltros(): any {
    const formValues = this.filtrosForm.value;
    return {
      busqueda: formValues.busqueda,
      estado: formValues.estado,
      fechaDesde: formValues.fechaDesde?.toISOString().split('T')[0],
      fechaHasta: formValues.fechaHasta?.toISOString().split('T')[0],
      page: this.paginaActual,
      size: this.tamanoPagina
    };
  }

  volver(): void {
    this.router.navigate(['/admin/negocios', this.negocioId]);
  }

  cambiarTab(index: number): void {
    this.tabActivo = index;
    if (index === 1) { // Tab de lista
      this.cargarCitas();
    }
  }

  filtrarPorEstado(filtro: string): void {
    this.tabActivo = 1; // Cambiar a tab de lista

    const filtrosControl = this.filtrosForm.get('estado');
    switch (filtro) {
      case 'todas':
        filtrosControl?.setValue('');
        break;
      case 'hoy':
        const hoy = new Date();
        this.filtrosForm.patchValue({
          fechaDesde: hoy,
          fechaHasta: hoy,
          estado: ''
        });
        break;
      case 'ingresos':
        filtrosControl?.setValue('COMPLETADA');
        break;
      default:
        filtrosControl?.setValue(filtro);
    }
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.paginaActual = 0;
  }

  onPageChange(event: PageEvent): void {
    this.paginaActual = event.pageIndex;
    this.tamanoPagina = event.pageSize;
    this.cargarCitas();
  }

  ordenar(sort: Sort): void {
    console.log('Ordenar por:', sort);
    // Implementar ordenamiento
  }

  // Actions
  nuevaCita(): void {
    this.router.navigate(['/nueva-cita']);
  }

  verDetalleCita(cita: Cita): void {
    this.router.navigate(['/citas', cita.id]);
  }

  confirmarCita(cita: Cita): void {
    this.citaService.confirmarCita(cita.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Cita confirmada', 'Cerrar', { duration: 2000 });
          this.cargarCitas();
        },
        error: (error) => {
          this.snackBar.open('Error al confirmar cita', 'Cerrar', { duration: 3000 });
        }
      });
  }

  iniciarCita(cita: Cita): void {
    this.citaService.iniciarCita(cita.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Cita iniciada', 'Cerrar', { duration: 2000 });
          this.cargarCitas();
        },
        error: (error) => {
          this.snackBar.open('Error al iniciar cita', 'Cerrar', { duration: 3000 });
        }
      });
  }

  completarCita(cita: Cita): void {
    this.citaService.completarCita(cita.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Cita completada', 'Cerrar', { duration: 2000 });
          this.cargarCitas();
        },
        error: (error) => {
          this.snackBar.open('Error al completar cita', 'Cerrar', { duration: 3000 });
        }
      });
  }

  reagendarCita(cita: Cita): void {
    this.router.navigate(['/citas', cita.id, 'editar']);
  }

  cancelarCita(cita: Cita): void {
    // TODO: Implementar diálogo de cancelación
    this.snackBar.open('Funcionalidad de cancelación próximamente', 'Cerrar', { duration: 2000 });
  }

  exportarCitas(): void {
    const filtros = this.construirFiltros();
    this.citaService.exportarCitasPDF(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `citas-${this.negocio?.nombre || 'negocio'}-${new Date().toISOString().split('T')[0]}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          this.snackBar.open('Error al exportar citas', 'Cerrar', { duration: 3000 });
        }
      });
  }
}