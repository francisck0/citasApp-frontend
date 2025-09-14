import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { CitaService } from '../../services/cita.service';
import { Cita } from '../../models/cita.model';
import { EstadoCita, TipoServicio, CitaFiltrosDTO } from '../../interfaces/cita-dtos.interface';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatBadgeModule
  ],
  template: `
    <div class="citas-container">
      <!-- Header -->
      <div class="header">
        <h1>Mis Citas</h1>
        <div class="header-actions">
          <button mat-stroked-button (click)="exportarCitas()">
            <mat-icon>download</mat-icon>
            Exportar
          </button>
          <button mat-raised-button color="primary" routerLink="/nueva-cita">
            <mat-icon>add</mat-icon>
            Nueva Cita
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards" *ngIf="estadisticas">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ estadisticas.proximasCitas }}</div>
            <div class="stat-label">Próximas</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ estadisticas.citasCompletadas }}</div>
            <div class="stat-label">Completadas</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ estadisticas.totalCitas }}</div>
            <div class="stat-label">Total</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filtros avanzados -->
      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filtrosForm" (ngSubmit)="aplicarFiltros()">
            <div class="filters-row">
              <!-- Filtros rápidos -->
              <div class="quick-filters">
                <mat-chip-set>
                  <mat-chip
                    *ngFor="let filtro of filtrosRapidos"
                    [class.selected]="filtro.active"
                    (click)="aplicarFiltroRapido(filtro)">
                    {{ filtro.label }}
                    <mat-icon matChipTrailingIcon *ngIf="filtro.active">check</mat-icon>
                  </mat-chip>
                </mat-chip-set>
              </div>

              <!-- Botón filtros avanzados -->
              <button type="button" mat-button (click)="mostrarFiltrosAvanzados = !mostrarFiltrosAvanzados">
                <mat-icon>{{ mostrarFiltrosAvanzados ? 'expand_less' : 'expand_more' }}</mat-icon>
                Filtros Avanzados
              </button>
            </div>

            <!-- Filtros avanzados expandibles -->
            <div class="advanced-filters" *ngIf="mostrarFiltrosAvanzados">
              <div class="filters-grid">
                <mat-form-field>
                  <mat-label>Estado</mat-label>
                  <mat-select formControlName="estado" multiple>
                    <mat-option value="PENDIENTE">Pendiente</mat-option>
                    <mat-option value="CONFIRMADA">Confirmada</mat-option>
                    <mat-option value="EN_CURSO">En curso</mat-option>
                    <mat-option value="COMPLETADA">Completada</mat-option>
                    <mat-option value="CANCELADA">Cancelada</mat-option>
                    <mat-option value="NO_ASISTIO">No asistió</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Tipo de servicio</mat-label>
                  <mat-select formControlName="tipoServicio" multiple>
                    <mat-option value="PRIMERA_VEZ">Primera vez</mat-option>
                    <mat-option value="MANTENIMIENTO">Mantenimiento</mat-option>
                    <mat-option value="SEGUIMIENTO">Seguimiento</mat-option>
                    <mat-option value="SESION_COMPLETA">Sesión completa</mat-option>
                    <mat-option value="CONSULTA">Consulta</mat-option>
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
              </div>

              <div class="filter-actions">
                <button type="button" mat-button (click)="limpiarFiltros()">Limpiar</button>
                <button type="submit" mat-raised-button color="primary">Aplicar Filtros</button>
              </div>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      <div class="loading" *ngIf="cargando">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Cargando citas...</p>
      </div>

      <!-- Lista de citas -->
      <div class="citas-list" *ngIf="!cargando">
        <div *ngIf="citas.length === 0" class="empty-state">
          <mat-icon>event_busy</mat-icon>
          <h3>No tienes citas</h3>
          <p>¡Agenda tu primera cita con nuestros profesionales!</p>
          <button mat-raised-button color="primary" routerLink="/nueva-cita">
            <mat-icon>add</mat-icon>
            Agendar Cita
          </button>
        </div>

        <mat-card class="cita-card" *ngFor="let cita of citas" [class]="'estado-' + cita.estado.toLowerCase()">
          <mat-card-content>
            <div class="cita-header">
              <div class="cita-date">
                <div class="date-box">
                  <span class="day">{{ cita.fecha | date:'dd' }}</span>
                  <span class="month">{{ cita.fecha | date:'MMM' | uppercase }}</span>
                </div>
              </div>

              <div class="cita-info">
                <h3>{{ cita.profesionalNombre }}</h3>
                <p class="categoria">{{ cita.categoriaNombre }}</p>
                <p class="negocio">{{ cita.negocioNombre }}</p>
                <div class="time-info">
                  <mat-icon>schedule</mat-icon>
                  <span>{{ cita.horaFormateada }}</span>
                  <span class="duration">({{ cita.duracionFormateada }})</span>
                </div>
              </div>

              <div class="cita-status">
                <mat-chip [class]="'chip-' + cita.estadoColor">{{ cita.estadoDisplay }}</mat-chip>
                <mat-chip *ngIf="cita.esUrgente" color="warn">
                  <mat-icon matChipAvatar>priority_high</mat-icon>
                  Urgente
                </mat-chip>
              </div>

              <div class="cita-actions">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="verDetalleCita(cita)">
                    <mat-icon>visibility</mat-icon>
                    Ver detalle
                  </button>
                  <button mat-menu-item *ngIf="cita.puedeModificar" (click)="modificarCita(cita)">
                    <mat-icon>edit</mat-icon>
                    Modificar
                  </button>
                  <button mat-menu-item *ngIf="cita.puedeCancelar" (click)="cancelarCita(cita)">
                    <mat-icon>cancel</mat-icon>
                    Cancelar
                  </button>
                  <button mat-menu-item *ngIf="cita.esCompletada" (click)="calificarCita(cita)">
                    <mat-icon>star</mat-icon>
                    Calificar
                  </button>
                </mat-menu>
              </div>
            </div>

            <div class="cita-details" *ngIf="cita.comentarios">
              <p><strong>Comentarios:</strong> {{ cita.comentarios }}</p>
            </div>

            <div class="cita-footer">
              <div class="precio" *ngIf="cita.precio">
                <strong>{{ cita.precioFormateado }}</strong>
              </div>
              <div class="tiempo-restante" [class]="'tiempo-' + getTiempoRestanteClass(cita)">
                {{ cita.tiempoRestante }}
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Paginación -->
      <mat-paginator
        *ngIf="totalCitas > 0"
        [length]="totalCitas"
        [pageSize]="tamanoPagina"
        [pageIndex]="paginaActual"
        [pageSizeOptions]="[5, 10, 25, 50]"
        (page)="onPageChange($event)"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .citas-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #1976d2;
    }

    .stat-label {
      color: #666;
      margin-top: 4px;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .quick-filters {
      flex: 1;
    }

    .quick-filters mat-chip {
      margin-right: 8px;
      cursor: pointer;
    }

    .quick-filters mat-chip.selected {
      background-color: #1976d2;
      color: white;
    }

    .advanced-filters {
      border-top: 1px solid #e0e0e0;
      padding-top: 16px;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .filter-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: #666;
    }

    .loading p {
      margin-top: 16px;
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
      margin-bottom: 16px;
      color: #ccc;
    }

    .citas-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cita-card {
      transition: box-shadow 0.2s;
    }

    .cita-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .cita-card.estado-pendiente {
      border-left: 4px solid #ff9800;
    }

    .cita-card.estado-confirmada {
      border-left: 4px solid #2196f3;
    }

    .cita-card.estado-en_curso {
      border-left: 4px solid #9c27b0;
    }

    .cita-card.estado-completada {
      border-left: 4px solid #4caf50;
    }

    .cita-card.estado-cancelada {
      border-left: 4px solid #f44336;
    }

    .cita-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .date-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #f5f5f5;
      border-radius: 8px;
      padding: 12px;
      min-width: 60px;
    }

    .day {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
      line-height: 1;
    }

    .month {
      font-size: 0.75rem;
      color: #666;
      font-weight: 500;
    }

    .cita-info {
      flex: 1;
    }

    .cita-info h3 {
      margin: 0 0 4px 0;
      color: #333;
      font-size: 1.1rem;
    }

    .categoria {
      color: #666;
      margin: 0 0 2px 0;
      font-size: 0.9rem;
    }

    .negocio {
      color: #999;
      margin: 0 0 8px 0;
      font-size: 0.85rem;
    }

    .time-info {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #333;
      font-weight: 500;
    }

    .time-info mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
    }

    .duration {
      color: #666;
      font-weight: normal;
    }

    .cita-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .chip-primary { background-color: #2196f3; color: white; }
    .chip-success { background-color: #4caf50; color: white; }
    .chip-warning { background-color: #ff9800; color: white; }
    .chip-danger { background-color: #f44336; color: white; }
    .chip-info { background-color: #00bcd4; color: white; }
    .chip-secondary { background-color: #9e9e9e; color: white; }

    .cita-details {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 0.9rem;
    }

    .cita-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e0e0e0;
    }

    .precio {
      font-size: 1.1rem;
      color: #4caf50;
    }

    .tiempo-restante {
      font-size: 0.85rem;
      font-weight: 500;
    }

    .tiempo-normal { color: #666; }
    .tiempo-proxima { color: #ff9800; }
    .tiempo-pasada { color: #999; }

    mat-paginator {
      margin-top: 24px;
    }

    @media (max-width: 768px) {
      .citas-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .header-actions {
        justify-content: center;
      }

      .stats-cards {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .filters-row {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .cita-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .cita-status {
        align-items: flex-start;
      }
    }
  `]
})
export class CitasComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  citas: Cita[] = [];
  cargando = false;
  totalCitas = 0;
  paginaActual = 0;
  tamanoPagina = 10;
  mostrarFiltrosAvanzados = false;
  estadisticas: any = null;

  filtrosForm: FormGroup;
  filtrosRapidos = [
    { key: 'todas', label: 'Todas', active: true },
    { key: 'proximas', label: 'Próximas', active: false },
    { key: 'completadas', label: 'Completadas', active: false },
    { key: 'pendientes', label: 'Pendientes', active: false }
  ];

  constructor(
    private citaService: CitaService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.filtrosForm = this.fb.group({
      estado: [[]],
      tipoServicio: [[]],
      fechaDesde: [null],
      fechaHasta: [null],
      esUrgente: [null]
    });
  }

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarCitas();

    // Reactivo a cambios en filtros
    this.filtrosForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.mostrarFiltrosAvanzados) {
          this.aplicarFiltros();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarEstadisticas(): void {
    this.citaService.obtenerEstadisticasCitas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.estadisticas = stats;
        },
        error: (error) => {
          console.error('Error al cargar estadísticas:', error);
        }
      });
  }

  cargarCitas(): void {
    this.cargando = true;

    const filtros = this.construirFiltros();

    this.citaService.obtenerCitasPaginadas(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.citas = response.citas;
          this.totalCitas = response.total;
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar citas:', error);
          this.snackBar.open('Error al cargar las citas', 'Cerrar', { duration: 3000 });
          this.cargando = false;
        }
      });
  }

  construirFiltros(): CitaFiltrosDTO {
    const formValues = this.filtrosForm.value;
    const filtroActivo = this.filtrosRapidos.find(f => f.active);

    let filtros: CitaFiltrosDTO = {
      page: this.paginaActual,
      size: this.tamanoPagina,
      sortBy: 'fechaCompleta',
      sortDirection: 'DESC'
    };

    // Aplicar filtro rápido
    if (filtroActivo) {
      switch (filtroActivo.key) {
        case 'proximas':
          const ahora = new Date();
          filtros.fechaDesde = ahora.toISOString().split('T')[0];
          filtros.estado = ['PENDIENTE', 'CONFIRMADA'];
          break;
        case 'completadas':
          filtros.estado = ['COMPLETADA'];
          break;
        case 'pendientes':
          filtros.estado = ['PENDIENTE'];
          break;
      }
    }

    // Aplicar filtros avanzados
    if (formValues.estado?.length) {
      filtros.estado = formValues.estado;
    }
    if (formValues.tipoServicio?.length) {
      filtros.tipoServicio = formValues.tipoServicio;
    }
    if (formValues.fechaDesde) {
      filtros.fechaDesde = formValues.fechaDesde.toISOString().split('T')[0];
    }
    if (formValues.fechaHasta) {
      filtros.fechaHasta = formValues.fechaHasta.toISOString().split('T')[0];
    }
    if (formValues.esUrgente !== null) {
      filtros.esUrgente = formValues.esUrgente;
    }

    return filtros;
  }

  aplicarFiltroRapido(filtro: any): void {
    // Desactivar todos los filtros
    this.filtrosRapidos.forEach(f => f.active = false);
    // Activar el seleccionado
    filtro.active = true;
    // Limpiar filtros avanzados
    this.filtrosForm.reset();
    this.mostrarFiltrosAvanzados = false;
    // Recargar citas
    this.paginaActual = 0;
    this.cargarCitas();
  }

  aplicarFiltros(): void {
    this.paginaActual = 0;
    this.cargarCitas();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.filtrosRapidos.forEach(f => f.active = f.key === 'todas');
    this.mostrarFiltrosAvanzados = false;
    this.paginaActual = 0;
    this.cargarCitas();
  }

  onPageChange(event: PageEvent): void {
    this.paginaActual = event.pageIndex;
    this.tamanoPagina = event.pageSize;
    this.cargarCitas();
  }

  verDetalleCita(cita: Cita): void {
    this.router.navigate(['/citas', cita.id]);
  }

  modificarCita(cita: Cita): void {
    this.router.navigate(['/citas', cita.id, 'editar']);
  }

  cancelarCita(cita: Cita): void {
    // TODO: Implementar diálogo de cancelación
    console.log('Cancelar cita:', cita.id);
  }

  calificarCita(cita: Cita): void {
    // TODO: Implementar diálogo de calificación
    console.log('Calificar cita:', cita.id);
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
          link.download = `mis-citas-${new Date().toISOString().split('T')[0]}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          this.snackBar.open('Error al exportar citas', 'Cerrar', { duration: 3000 });
        }
      });
  }

  getTiempoRestanteClass(cita: Cita): string {
    if (cita.esPasada) return 'pasada';
    if (cita.esProxima) return 'proxima';
    return 'normal';
  }
}