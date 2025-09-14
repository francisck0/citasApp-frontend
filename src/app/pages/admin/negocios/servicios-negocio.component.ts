/**
 * Componente para gestión de servicios ofrecidos por el negocio
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';

import { NegocioService } from '../../../services/negocio.service';
import { Negocio } from '../../../models/negocio.model';
import { ServicioDTO } from '../../../interfaces/negocio-dtos.interface';
import { ModalidadConsulta } from '../../../interfaces/profesional-dtos.interface';

@Component({
  selector: 'app-servicios-negocio',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <div class="servicios-container">
      <!-- Header -->
      <div class="header">
        <button mat-icon-button (click)="volver()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h1>Gestión de Servicios</h1>
          <p *ngIf="negocio">{{ negocio.nombre }}</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="abrirDialogoServicio()">
            <mat-icon>add</mat-icon>
            Nuevo Servicio
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="cargando">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Cargando servicios...</p>
      </div>

      <!-- Content -->
      <div *ngIf="!cargando">
        <!-- Stats -->
        <div class="stats-cards">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon activos">
                  <mat-icon>medical_services</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ serviciosActivos }}</h3>
                  <p>Servicios Activos</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon precio">
                  <mat-icon>euro_symbol</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ precioPromedio | currency:'EUR' }}</h3>
                  <p>Precio Promedio</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon duracion">
                  <mat-icon>schedule</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ duracionPromedio }}min</h3>
                  <p>Duración Promedio</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon categorias">
                  <mat-icon>category</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ totalCategorias }}</h3>
                  <p>Categorías</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Services Grid -->
        <div class="servicios-grid">
          <mat-card
            *ngFor="let servicio of servicios; trackBy: trackByServicio"
            class="servicio-card"
            [class.inactivo]="!servicio.activo">
            <mat-card-header>
              <div class="servicio-header">
                <div class="servicio-info">
                  <h3>{{ servicio.nombre }}</h3>
                  <p class="categoria">{{ getCategoriaDisplay(servicio.categoriaId) }}</p>
                </div>
                <div class="servicio-actions">
                  <mat-slide-toggle
                    [checked]="servicio.activo"
                    (change)="toggleServicioActivo(servicio, $event)">
                  </mat-slide-toggle>
                  <button mat-icon-button [matMenuTriggerFor]="menu" [matMenuTriggerData]="{servicio: servicio}">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                </div>
              </div>
            </mat-card-header>

            <mat-card-content>
              <div class="servicio-details">
                <div class="detail-row">
                  <mat-icon>schedule</mat-icon>
                  <span>{{ servicio.duracionMinutos }} minutos</span>
                </div>
                <div class="detail-row">
                  <mat-icon>euro_symbol</mat-icon>
                  <span>{{ servicio.precio | currency:'EUR' }}</span>
                </div>
                <div class="detail-row">
                  <mat-icon>location_on</mat-icon>
                  <span>{{ getModalidadDisplay(servicio.modalidad || 'PRESENCIAL') }}</span>
                </div>
              </div>

              <p *ngIf="servicio.descripcion" class="descripcion">
                {{ servicio.descripcion }}
              </p>

              <div class="servicio-badges">
                <mat-chip color="primary" *ngIf="servicio.destacado">
                  <mat-icon matChipAvatar>star</mat-icon>
                  Destacado
                </mat-chip>
                <mat-chip *ngIf="servicio.requierePreparacion">
                  <mat-icon matChipAvatar>build</mat-icon>
                  Preparación
                </mat-chip>
                <mat-chip *ngIf="servicio.admiteUrgencias">
                  <mat-icon matChipAvatar>priority_high</mat-icon>
                  Urgencias
                </mat-chip>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button (click)="editarServicio(servicio)">
                <mat-icon>edit</mat-icon>
                Editar
              </button>
              <button mat-button (click)="duplicarServicio(servicio)">
                <mat-icon>content_copy</mat-icon>
                Duplicar
              </button>
              <button mat-button (click)="verEstadisticas(servicio)">
                <mat-icon>analytics</mat-icon>
                Estadísticas
              </button>
            </mat-card-actions>
          </mat-card>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="servicios.length === 0">
            <mat-card class="empty-card">
              <mat-card-content>
                <mat-icon>medical_services</mat-icon>
                <h3>No hay servicios configurados</h3>
                <p>Comienza agregando los servicios que ofrece tu negocio</p>
                <button mat-raised-button color="primary" (click)="abrirDialogoServicio()">
                  <mat-icon>add</mat-icon>
                  Crear Primer Servicio
                </button>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- Menu Actions -->
        <mat-menu #menu="matMenu">
          <ng-template matMenuContent let-servicio="servicio">
            <button mat-menu-item (click)="editarServicio(servicio)">
              <mat-icon>edit</mat-icon>
              Editar
            </button>
            <button mat-menu-item (click)="duplicarServicio(servicio)">
              <mat-icon>content_copy</mat-icon>
              Duplicar
            </button>
            <button mat-menu-item (click)="verEstadisticas(servicio)">
              <mat-icon>analytics</mat-icon>
              Ver Estadísticas
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="eliminarServicio(servicio)" class="delete-action">
              <mat-icon>delete</mat-icon>
              Eliminar
            </button>
          </ng-template>
        </mat-menu>
      </div>
    </div>

    <!-- Diálogo Servicio -->
    <div *ngIf="mostrandoDialogo" class="dialog-overlay" (click)="cerrarDialogo()">
      <div class="dialog-content" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h2>{{ servicioEditando ? 'Editar' : 'Nuevo' }} Servicio</h2>
          <button mat-icon-button (click)="cerrarDialogo()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <form [formGroup]="servicioForm" (ngSubmit)="guardarServicio()">
          <div class="dialog-body">
            <!-- Información básica -->
            <div class="form-section">
              <h3>Información Básica</h3>
              <div class="form-row">
                <mat-form-field>
                  <mat-label>Nombre del servicio</mat-label>
                  <input matInput formControlName="nombre" required>
                  <mat-error>El nombre es obligatorio</mat-error>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Categoría</mat-label>
                  <mat-select formControlName="categoriaId" required>
                    <mat-option *ngFor="let categoria of categorias" [value]="categoria.id">
                      {{ categoria.nombre }}
                    </mat-option>
                  </mat-select>
                  <mat-error>La categoría es obligatoria</mat-error>
                </mat-form-field>
              </div>

              <mat-form-field class="full-width">
                <mat-label>Descripción</mat-label>
                <textarea matInput formControlName="descripcion" rows="3"
                  placeholder="Describe el servicio que ofreces..."></textarea>
              </mat-form-field>
            </div>

            <!-- Detalles del servicio -->
            <div class="form-section">
              <h3>Detalles del Servicio</h3>
              <div class="form-row">
                <mat-form-field>
                  <mat-label>Duración (minutos)</mat-label>
                  <mat-select formControlName="duracionMinutos" required>
                    <mat-option value="15">15 minutos</mat-option>
                    <mat-option value="30">30 minutos</mat-option>
                    <mat-option value="45">45 minutos</mat-option>
                    <mat-option value="60">1 hora</mat-option>
                    <mat-option value="90">1.5 horas</mat-option>
                    <mat-option value="120">2 horas</mat-option>
                    <mat-option value="180">3 horas</mat-option>
                  </mat-select>
                  <mat-error>La duración es obligatoria</mat-error>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Precio (€)</mat-label>
                  <input matInput type="number" formControlName="precio" min="0" step="0.01" required>
                  <mat-error>El precio es obligatorio</mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field>
                  <mat-label>Modalidad</mat-label>
                  <mat-select formControlName="modalidad" required>
                    <mat-option value="PRESENCIAL">Presencial</mat-option>
                    <mat-option value="VIRTUAL">Virtual</mat-option>
                    <mat-option value="HIBRIDA">Híbrida</mat-option>
                  </mat-select>
                  <mat-error>La modalidad es obligatoria</mat-error>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Tiempo de preparación (min)</mat-label>
                  <mat-select formControlName="tiempoPreparacion">
                    <mat-option value="0">Sin preparación</mat-option>
                    <mat-option value="5">5 minutos</mat-option>
                    <mat-option value="10">10 minutos</mat-option>
                    <mat-option value="15">15 minutos</mat-option>
                    <mat-option value="30">30 minutos</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>

            <!-- Configuración -->
            <div class="form-section">
              <h3>Configuración</h3>
              <div class="form-toggles">
                <mat-slide-toggle formControlName="activo">
                  Servicio activo (visible para clientes)
                </mat-slide-toggle>
                <mat-slide-toggle formControlName="destacado">
                  Servicio destacado (aparece primero)
                </mat-slide-toggle>
                <mat-slide-toggle formControlName="requierePreparacion">
                  Requiere tiempo de preparación
                </mat-slide-toggle>
                <mat-slide-toggle formControlName="admiteUrgencias">
                  Admite citas urgentes
                </mat-slide-toggle>
                <mat-slide-toggle formControlName="requiereConfirmacion">
                  Requiere confirmación manual
                </mat-slide-toggle>
              </div>
            </div>
          </div>

          <div class="dialog-actions">
            <button type="button" mat-button (click)="cerrarDialogo()">
              Cancelar
            </button>
            <button type="submit" mat-raised-button color="primary" [disabled]="!servicioForm.valid || guardando">
              <mat-spinner diameter="20" *ngIf="guardando"></mat-spinner>
              {{ guardando ? 'Guardando...' : (servicioEditando ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .servicios-container {
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

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: #666;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
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

    .stat-icon.activos { background: linear-gradient(135deg, #4caf50, #45a049); }
    .stat-icon.precio { background: linear-gradient(135deg, #2196f3, #1976d2); }
    .stat-icon.duracion { background: linear-gradient(135deg, #ff9800, #f57c00); }
    .stat-icon.categorias { background: linear-gradient(135deg, #9c27b0, #7b1fa2); }

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

    .servicios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .servicio-card {
      transition: all 0.3s;
    }

    .servicio-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .servicio-card.inactivo {
      opacity: 0.6;
      background-color: #fafafa;
    }

    .servicio-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .servicio-info h3 {
      margin: 0 0 4px 0;
      color: #333;
    }

    .categoria {
      color: #666;
      font-size: 0.85rem;
      margin: 0;
    }

    .servicio-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .servicio-details {
      margin: 16px 0;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      color: #666;
    }

    .detail-row mat-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
    }

    .descripcion {
      color: #666;
      font-size: 0.9rem;
      margin: 12px 0;
      line-height: 1.4;
    }

    .servicio-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 12px;
    }

    .servicio-badges mat-chip {
      font-size: 0.75rem;
    }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      justify-content: center;
    }

    .empty-card {
      max-width: 400px;
      text-align: center;
    }

    .empty-card mat-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-card h3 {
      margin-bottom: 8px;
      color: #333;
    }

    .empty-card p {
      margin-bottom: 24px;
      color: #666;
    }

    .delete-action {
      color: #f44336;
    }

    /* Dialog Styles */
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog-content {
      background: white;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 0 24px;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 24px;
    }

    .dialog-header h2 {
      margin: 0;
      color: #333;
    }

    .dialog-body {
      padding: 0 24px;
    }

    .form-section {
      margin-bottom: 32px;
    }

    .form-section h3 {
      color: #333;
      margin: 0 0 16px 0;
      font-size: 1.1rem;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 8px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .form-toggles {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid #e0e0e0;
      margin-top: 24px;
    }

    @media (max-width: 768px) {
      .servicios-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .stats-cards {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .servicios-grid {
        grid-template-columns: 1fr;
      }

      .servicio-header {
        flex-direction: column;
        gap: 12px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .dialog-content {
        width: 95%;
        margin: 20px;
      }
    }
  `]
})
export class ServiciosNegocioComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  negocioId: number | null = null;
  negocio: Negocio | null = null;
  cargando = true;
  guardando = false;

  // Data
  servicios: ServicioDTO[] = [];
  categorias: any[] = [];

  // Dialog
  mostrandoDialogo = false;
  servicioEditando: ServicioDTO | null = null;
  servicioForm!: FormGroup;

  // Stats
  serviciosActivos = 0;
  precioPromedio = 0;
  duracionPromedio = 0;
  totalCategorias = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private negocioService: NegocioService
  ) {
    this.inicializarForm();
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.negocioId = +params['id'];
      if (this.negocioId) {
        this.cargarNegocio();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  inicializarForm(): void {
    this.servicioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      categoriaId: ['', Validators.required],
      duracionMinutos: [60, [Validators.required, Validators.min(15)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      modalidad: ['PRESENCIAL', Validators.required],
      tiempoPreparacion: [0],
      activo: [true],
      destacado: [false],
      requierePreparacion: [false],
      admiteUrgencias: [true],
      requiereConfirmacion: [false]
    });
  }

  cargarNegocio(): void {
    if (!this.negocioId) return;

    this.cargando = true;
    this.negocioService.obtenerNegocioPorId(this.negocioId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (negocio) => {
          this.negocio = negocio;
          this.servicios = negocio.servicios || [];
          this.categorias = negocio.categorias || [];
          this.calcularEstadisticas();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar negocio:', error);
          this.snackBar.open('Error al cargar negocio', 'Cerrar', { duration: 3000 });
          this.cargando = false;
        }
      });
  }

  calcularEstadisticas(): void {
    this.serviciosActivos = this.servicios.filter(s => s.activo).length;
    this.precioPromedio = this.servicios.length > 0 ?
      this.servicios.reduce((sum, s) => sum + (s.precio || 0), 0) / this.servicios.length : 0;
    this.duracionPromedio = this.servicios.length > 0 ?
      this.servicios.reduce((sum, s) => sum + s.duracionMinutos, 0) / this.servicios.length : 0;
    this.totalCategorias = this.categorias.length;
  }

  volver(): void {
    this.router.navigate(['/admin/negocios', this.negocioId]);
  }

  abrirDialogoServicio(servicio?: ServicioDTO): void {
    this.servicioEditando = servicio || null;
    this.mostrandoDialogo = true;

    if (servicio) {
      this.servicioForm.patchValue(servicio);
    } else {
      this.servicioForm.reset({
        activo: true,
        modalidad: 'PRESENCIAL',
        duracionMinutos: 60,
        precio: 0,
        tiempoPreparacion: 0,
        destacado: false,
        requierePreparacion: false,
        admiteUrgencias: true,
        requiereConfirmacion: false
      });
    }
  }

  cerrarDialogo(): void {
    this.mostrandoDialogo = false;
    this.servicioEditando = null;
    this.servicioForm.reset();
  }

  guardarServicio(): void {
    if (!this.servicioForm.valid) {
      this.markFormGroupTouched(this.servicioForm);
      return;
    }

    this.guardando = true;
    const servicioData = this.servicioForm.value;

    // TODO: Implementar llamada al servicio
    console.log('Guardando servicio:', servicioData);

    setTimeout(() => {
      if (this.servicioEditando) {
        // Actualizar servicio existente
        const index = this.servicios.findIndex(s => s.id === this.servicioEditando!.id);
        if (index >= 0) {
          this.servicios[index] = { ...this.servicioEditando, ...servicioData };
        }
        this.snackBar.open('Servicio actualizado', 'Cerrar', { duration: 3000 });
      } else {
        // Crear nuevo servicio
        const nuevoServicio: ServicioDTO = {
          id: Date.now(), // ID temporal
          ...servicioData
        };
        this.servicios.push(nuevoServicio);
        this.snackBar.open('Servicio creado', 'Cerrar', { duration: 3000 });
      }

      this.calcularEstadisticas();
      this.guardando = false;
      this.cerrarDialogo();
    }, 1500);
  }

  editarServicio(servicio: ServicioDTO): void {
    this.abrirDialogoServicio(servicio);
  }

  duplicarServicio(servicio: ServicioDTO): void {
    const duplicado = {
      ...servicio,
      id: Date.now(),
      nombre: `${servicio.nombre} (Copia)`
    };
    this.servicios.push(duplicado);
    this.calcularEstadisticas();
    this.snackBar.open('Servicio duplicado', 'Cerrar', { duration: 2000 });
  }

  eliminarServicio(servicio: ServicioDTO): void {
    const index = this.servicios.findIndex(s => s.id === servicio.id);
    if (index >= 0) {
      this.servicios.splice(index, 1);
      this.calcularEstadisticas();
      this.snackBar.open('Servicio eliminado', 'Cerrar', { duration: 2000 });
    }
  }

  toggleServicioActivo(servicio: ServicioDTO, event: any): void {
    servicio.activo = event.checked;
    this.calcularEstadisticas();
    this.snackBar.open(
      `Servicio ${servicio.activo ? 'activado' : 'desactivado'}`,
      'Cerrar',
      { duration: 2000 }
    );
  }

  verEstadisticas(servicio: ServicioDTO): void {
    this.snackBar.open('Estadísticas próximamente disponibles', 'Cerrar', { duration: 2000 });
  }

  trackByServicio(index: number, servicio: ServicioDTO): any {
    return servicio.id;
  }

  getCategoriaDisplay(categoriaId: number): string {
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria?.nombre || 'Sin categoría';
  }

  getModalidadDisplay(modalidad: ModalidadConsulta): string {
    const modalidades = {
      'PRESENCIAL': 'Presencial',
      'VIRTUAL': 'Virtual',
      'HIBRIDA': 'Híbrida'
    };
    return modalidades[modalidad] || modalidad;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}