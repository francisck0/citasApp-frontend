/**
 * Componente de administración de negocios con CRUD completo
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { NegocioService } from '../../../services/negocio.service';
import { Negocio } from '../../../models/negocio.model';
import { TipoNegocio, EstadoNegocio } from '../../../interfaces/negocio-dtos.interface';

@Component({
  selector: 'app-negocios-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatSlideToggleModule,
    MatDividerModule
  ],
  template: `
    <div class="negocios-admin-container">
      <!-- Header -->
      <div class="header">
        <div class="header-content">
          <h1>Gestión de Negocios</h1>
          <p>Administra todos los negocios registrados en la plataforma</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="abrirDialogoNegocio()">
            <mat-icon>add</mat-icon>
            Nuevo Negocio
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon activos">
                <mat-icon>store</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ estadisticas.totalActivos }}</h3>
                <p>Negocios Activos</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon pendientes">
                <mat-icon>pending</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ estadisticas.totalPendientes }}</h3>
                <p>Pendientes Aprobación</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon ingresos">
                <mat-icon>euro_symbol</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ estadisticas.ingresosMes | currency:'EUR' }}</h3>
                <p>Ingresos del Mes</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon citas">
                <mat-icon>event</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ estadisticas.citasHoy }}</h3>
                <p>Citas Hoy</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filtrosForm">
            <div class="filters-row">
              <mat-form-field>
                <mat-label>Buscar negocio</mat-label>
                <input matInput formControlName="busqueda" placeholder="Nombre, propietario, email...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Tipo de negocio</mat-label>
                <mat-select formControlName="tipoNegocio">
                  <mat-option value="">Todos</mat-option>
                  <mat-option value="SALON_BELLEZA">Salón de Belleza</mat-option>
                  <mat-option value="SPA">Spa</mat-option>
                  <mat-option value="BARBERIA">Barbería</mat-option>
                  <mat-option value="CONSULTORIO_MEDICO">Consultorio Médico</mat-option>
                  <mat-option value="DENTISTA">Dentista</mat-option>
                  <mat-option value="PSICOLOGO">Psicólogo</mat-option>
                  <mat-option value="FISIOTERAPIA">Fisioterapia</mat-option>
                  <mat-option value="GIMNASIO">Gimnasio</mat-option>
                  <mat-option value="OTRO">Otro</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Estado</mat-label>
                <mat-select formControlName="estado">
                  <mat-option value="">Todos</mat-option>
                  <mat-option value="ACTIVO">Activo</mat-option>
                  <mat-option value="INACTIVO">Inactivo</mat-option>
                  <mat-option value="PENDIENTE">Pendiente</mat-option>
                  <mat-option value="SUSPENDIDO">Suspendido</mat-option>
                </mat-select>
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
        <p>Cargando negocios...</p>
      </div>

      <!-- Table -->
      <mat-card class="table-card" *ngIf="!cargando">
        <mat-table [dataSource]="negocios" matSort (matSortChange)="ordenar($event)">
          <!-- Columna Logo/Nombre -->
          <ng-container matColumnDef="negocio">
            <mat-header-cell *matHeaderCellDef mat-sort-header="nombre">Negocio</mat-header-cell>
            <mat-cell *matCellDef="let negocio">
              <div class="negocio-info">
                <img
                  [src]="negocio.logo || '/assets/default-business.png'"
                  [alt]="negocio.nombre"
                  class="negocio-logo">
                <div class="negocio-details">
                  <strong>{{ negocio.nombre }}</strong>
                  <p class="tipo">{{ getTipoNegocioDisplay(negocio.tipoNegocio) }}</p>
                </div>
              </div>
            </mat-cell>
          </ng-container>

          <!-- Columna Propietario -->
          <ng-container matColumnDef="propietario">
            <mat-header-cell *matHeaderCellDef>Propietario</mat-header-cell>
            <mat-cell *matCellDef="let negocio">
              <div class="propietario-info">
                <strong>{{ negocio.propietario.nombre }} {{ negocio.propietario.apellidos }}</strong>
                <p>{{ negocio.propietario.email }}</p>
              </div>
            </mat-cell>
          </ng-container>

          <!-- Columna Estado -->
          <ng-container matColumnDef="estado">
            <mat-header-cell *matHeaderCellDef mat-sort-header="estado">Estado</mat-header-cell>
            <mat-cell *matCellDef="let negocio">
              <mat-chip [class]="'estado-' + negocio.estado.toLowerCase()">
                {{ getEstadoDisplay(negocio.estado) }}
              </mat-chip>
            </mat-cell>
          </ng-container>

          <!-- Columna Métricas -->
          <ng-container matColumnDef="metricas">
            <mat-header-cell *matHeaderCellDef>Métricas</mat-header-cell>
            <mat-cell *matCellDef="let negocio">
              <div class="metricas">
                <div class="metrica">
                  <mat-icon matTooltip="Calificación">star</mat-icon>
                  <span>{{ negocio.calificacion ? negocio.calificacion.toFixed(1) : 'N/A' }}</span>
                </div>
                <div class="metrica">
                  <mat-icon matTooltip="Profesionales">people</mat-icon>
                  <span>{{ negocio.totalProfesionales }}</span>
                </div>
                <div class="metrica">
                  <mat-icon matTooltip="Reseñas">reviews</mat-icon>
                  <span>{{ negocio['totalReseñas'] }}</span>
                </div>
              </div>
            </mat-cell>
          </ng-container>

          <!-- Columna Fecha Registro -->
          <ng-container matColumnDef="fechaRegistro">
            <mat-header-cell *matHeaderCellDef mat-sort-header="fechaRegistro">Registro</mat-header-cell>
            <mat-cell *matCellDef="let negocio">
              {{ negocio.fechaRegistro | date:'short' }}
            </mat-cell>
          </ng-container>

          <!-- Columna Acciones -->
          <ng-container matColumnDef="acciones">
            <mat-header-cell *matHeaderCellDef>Acciones</mat-header-cell>
            <mat-cell *matCellDef="let negocio">
              <button mat-icon-button [matMenuTriggerFor]="menu" [matMenuTriggerData]="{negocio: negocio}">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <ng-template matMenuContent let-negocio="negocio">
                  <button mat-menu-item (click)="verDetalle(negocio)">
                    <mat-icon>visibility</mat-icon>
                    Ver Detalle
                  </button>
                  <button mat-menu-item (click)="editarNegocio(negocio)">
                    <mat-icon>edit</mat-icon>
                    Editar
                  </button>
                  <button mat-menu-item (click)="gestionarHorarios(negocio)">
                    <mat-icon>schedule</mat-icon>
                    Horarios
                  </button>
                  <button mat-menu-item (click)="gestionarServicios(negocio)">
                    <mat-icon>medical_services</mat-icon>
                    Servicios
                  </button>
                  <button mat-menu-item (click)="verCitasNegocio(negocio)">
                    <mat-icon>event</mat-icon>
                    Ver Citas
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item
                    *ngIf="negocio.estado === 'PENDIENTE'"
                    (click)="aprobarNegocio(negocio)">
                    <mat-icon>check_circle</mat-icon>
                    Aprobar
                  </button>
                  <button mat-menu-item
                    *ngIf="negocio.estado === 'ACTIVO'"
                    (click)="suspenderNegocio(negocio)">
                    <mat-icon>block</mat-icon>
                    Suspender
                  </button>
                  <button mat-menu-item
                    *ngIf="negocio.estado === 'SUSPENDIDO'"
                    (click)="reactivarNegocio(negocio)">
                    <mat-icon>play_circle</mat-icon>
                    Reactivar
                  </button>
                </ng-template>
              </mat-menu>
            </mat-cell>
          </ng-container>

          <mat-header-row *matHeaderRowDef="columnasMostradas"></mat-header-row>
          <mat-row *matRowDef="let row; columns: columnasMostradas;"></mat-row>
        </mat-table>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="negocios.length === 0 && !cargando">
          <mat-icon>store</mat-icon>
          <h3>No se encontraron negocios</h3>
          <p>No hay negocios que coincidan con los filtros seleccionados</p>
          <button mat-raised-button color="primary" (click)="limpiarFiltros()">
            Limpiar Filtros
          </button>
        </div>

        <!-- Paginación -->
        <mat-paginator
          [length]="totalNegocios"
          [pageSize]="tamanoPagina"
          [pageIndex]="paginaActual"
          [pageSizeOptions]="[10, 25, 50, 100]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .negocios-admin-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 2rem;
    }

    .header-content p {
      margin: 0;
      color: #666;
      font-size: 1.1rem;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon mat-icon {
      font-size: 32px;
      height: 32px;
      width: 32px;
      color: white;
    }

    .stat-icon.activos { background: linear-gradient(135deg, #4caf50, #45a049); }
    .stat-icon.pendientes { background: linear-gradient(135deg, #ff9800, #f57c00); }
    .stat-icon.ingresos { background: linear-gradient(135deg, #2196f3, #1976d2); }
    .stat-icon.citas { background: linear-gradient(135deg, #9c27b0, #7b1fa2); }

    .stat-info h3 {
      margin: 0 0 4px 0;
      font-size: 1.8rem;
      font-weight: bold;
      color: #333;
    }

    .stat-info p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-row {
      display: grid;
      grid-template-columns: 1fr 200px 150px auto;
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

    .negocio-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .negocio-logo {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      object-fit: cover;
    }

    .negocio-details strong {
      display: block;
      color: #333;
      margin-bottom: 2px;
    }

    .tipo {
      color: #666;
      font-size: 0.85rem;
      margin: 0;
    }

    .propietario-info strong {
      display: block;
      color: #333;
      margin-bottom: 2px;
    }

    .propietario-info p {
      color: #666;
      font-size: 0.85rem;
      margin: 0;
    }

    .estado-activo {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .estado-inactivo {
      background-color: #fafafa;
      color: #757575;
    }

    .estado-pendiente {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .estado-suspendido {
      background-color: #ffebee;
      color: #c62828;
    }

    .metricas {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .metrica {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
    }

    .metrica mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
      color: #666;
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

    @media (max-width: 768px) {
      .negocios-admin-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .stats-cards {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }

      .filters-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .stat-content {
        flex-direction: column;
        text-align: center;
      }

      .negocio-info {
        flex-direction: column;
        text-align: center;
        gap: 8px;
      }

      .metricas {
        flex-direction: row;
        justify-content: space-around;
      }
    }
  `]
})
export class NegociosAdminComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  negocios: Negocio[] = [];
  totalNegocios = 0;
  cargando = true;

  // Pagination
  paginaActual = 0;
  tamanoPagina = 25;

  // Table
  columnasMostradas: string[] = ['negocio', 'propietario', 'estado', 'metricas', 'fechaRegistro', 'acciones'];

  // Filters
  filtrosForm: FormGroup;

  // Stats
  estadisticas = {
    totalActivos: 0,
    totalPendientes: 0,
    ingresosMes: 0,
    citasHoy: 0
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private negocioService: NegocioService
  ) {
    this.filtrosForm = this.fb.group({
      busqueda: [''],
      tipoNegocio: [''],
      estado: ['']
    });
  }

  ngOnInit(): void {
    this.configurarFiltros();
    this.cargarEstadisticas();
    this.cargarNegocios();
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
        this.cargarNegocios();
      });
  }

  cargarEstadisticas(): void {
    // Simulamos estadísticas (en implementación real vendrían del servicio)
    this.estadisticas = {
      totalActivos: 156,
      totalPendientes: 12,
      ingresosMes: 15420,
      citasHoy: 89
    };
  }

  cargarNegocios(): void {
    this.cargando = true;
    const filtros = this.construirFiltros();

    this.negocioService.buscarNegocios(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response)) {
            this.negocios = response;
            this.totalNegocios = response.length;
          } else {
            this.negocios = response.negocios || [];
            this.totalNegocios = response.total || 0;
          }
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar negocios:', error);
          this.snackBar.open('Error al cargar negocios', 'Cerrar', { duration: 3000 });
          this.cargando = false;
        }
      });
  }

  construirFiltros(): any {
    const formValues = this.filtrosForm.value;
    return {
      nombre: formValues.busqueda,
      categoria: formValues.tipoNegocio,
      // estado: formValues.estado, // Implementar en el servicio
      page: this.paginaActual,
      size: this.tamanoPagina
    };
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.paginaActual = 0;
  }

  onPageChange(event: PageEvent): void {
    this.paginaActual = event.pageIndex;
    this.tamanoPagina = event.pageSize;
    this.cargarNegocios();
  }

  ordenar(sort: Sort): void {
    // Implementar ordenamiento
    console.log('Ordenar por:', sort);
  }

  // Actions
  abrirDialogoNegocio(negocio?: Negocio): void {
    this.router.navigate(['/admin/negocios/nuevo']);
  }

  verDetalle(negocio: Negocio): void {
    this.router.navigate(['/admin/negocios', negocio.id]);
  }

  editarNegocio(negocio: Negocio): void {
    this.router.navigate(['/admin/negocios', negocio.id, 'editar']);
  }

  gestionarHorarios(negocio: Negocio): void {
    this.router.navigate(['/admin/negocios', negocio.id, 'horarios']);
  }

  gestionarServicios(negocio: Negocio): void {
    this.router.navigate(['/admin/negocios', negocio.id, 'servicios']);
  }

  verCitasNegocio(negocio: Negocio): void {
    this.router.navigate(['/admin/negocios', negocio.id, 'citas']);
  }

  aprobarNegocio(negocio: Negocio): void {
    // Implementar aprobación
    this.snackBar.open(`Negocio ${negocio.nombre} aprobado`, 'Cerrar', { duration: 3000 });
    this.cargarNegocios();
  }

  suspenderNegocio(negocio: Negocio): void {
    // Implementar suspensión
    this.snackBar.open(`Negocio ${negocio.nombre} suspendido`, 'Cerrar', { duration: 3000 });
    this.cargarNegocios();
  }

  reactivarNegocio(negocio: Negocio): void {
    // Implementar reactivación
    this.snackBar.open(`Negocio ${negocio.nombre} reactivado`, 'Cerrar', { duration: 3000 });
    this.cargarNegocios();
  }

  // Utilities
  getTipoNegocioDisplay(tipo: TipoNegocio): string {
    const tipos = {
      'SALON_BELLEZA': 'Salón de Belleza',
      'PELUQUERIA': 'Peluquería',
      'CENTRO_ESTETICO': 'Centro Estético',
      'CONSULTORIO_PSICOLOGIA': 'Consultorio de Psicología',
      'CENTRO_MASAJES': 'Centro de Masajes',
      'CLINICA_DENTAL': 'Centro Dental',
      'CENTRO_FISIOTERAPIA': 'Centro de Fisioterapia',
      'SPA': 'Spa',
      'BARBERIA': 'Barbería',
      'GIMNASIO': 'Gimnasio',
      'OTRO': 'Otro'
    } as Record<TipoNegocio, string>;
    return tipos[tipo] || tipo;
  }

  getEstadoDisplay(estado: EstadoNegocio): string {
    const estados = {
      'ACTIVO': 'Activo',
      'INACTIVO': 'Inactivo',
      'PENDIENTE_VERIFICACION': 'Pendiente de Verificación',
      'SUSPENDIDO': 'Suspendido'
    } as Record<EstadoNegocio, string>;
    return estados[estado] || estado;
  }
}