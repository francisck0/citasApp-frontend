/**
 * Componente para ver detalle de cita con opciones de modificar/cancelar
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { Subject, takeUntil } from 'rxjs';

import { CitaService, CancelacionCitaDTO, ReagendarCitaDTO } from '../../services/cita.service';
import { Cita } from '../../models/cita.model';

@Component({
  selector: 'app-cita-detalle',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  template: `
    <div class="cita-detalle-container">
      <!-- Loading -->
      <div class="loading" *ngIf="cargando">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Cargando información de la cita...</p>
      </div>

      <!-- Contenido principal -->
      <div *ngIf="!cargando && cita">
        <!-- Header -->
        <div class="header">
          <button mat-icon-button (click)="volver()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>Detalle de Cita</h1>
          <div class="header-actions">
            <button mat-icon-button [matMenuTriggerFor]="menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item *ngIf="cita.puedeModificar" (click)="mostrarReagendar()">
                <mat-icon>edit_calendar</mat-icon>
                Reagendar
              </button>
              <button mat-menu-item *ngIf="cita.puedeCancelar" (click)="mostrarCancelar()">
                <mat-icon>cancel</mat-icon>
                Cancelar
              </button>
              <button mat-menu-item *ngIf="cita.esCompletada" (click)="calificarCita()">
                <mat-icon>star</mat-icon>
                Calificar
              </button>
              <button mat-menu-item (click)="compartirCita()">
                <mat-icon>share</mat-icon>
                Compartir
              </button>
            </mat-menu>
          </div>
        </div>

        <!-- Estado de la cita -->
        <mat-card class="estado-card" [class]="'estado-' + cita.estado.toLowerCase()">
          <mat-card-content>
            <div class="estado-info">
              <mat-icon [class]="'icon-' + cita.estadoColor">{{ getEstadoIcon() }}</mat-icon>
              <div>
                <h2>{{ cita.estadoDisplay }}</h2>
                <p>{{ getEstadoDescripcion() }}</p>
              </div>
            </div>
            <div class="tiempo-restante" *ngIf="!cita.esPasada">
              <strong>{{ cita.tiempoRestante }}</strong>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Información principal -->
        <div class="info-grid">
          <mat-card class="info-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>person</mat-icon>
              <mat-card-title>Profesional</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="profesional-info">
                <img
                  [src]="cita.profesional.foto || '/assets/default-avatar.png'"
                  [alt]="cita.profesionalNombre"
                  class="profesional-avatar">
                <div>
                  <h3>{{ cita.profesionalNombre }}</h3>
                  <p class="categoria">{{ cita.categoriaNombre }}</p>
                  <p class="negocio">
                    <mat-icon>location_on</mat-icon>
                    {{ cita.negocioNombre }}
                  </p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="info-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>event</mat-icon>
              <mat-card-title>Fecha y Hora</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="fecha-info">
                <div class="fecha-principal">
                  <span class="dia">{{ cita.fecha | date:'dd' }}</span>
                  <div>
                    <span class="mes">{{ cita.fecha | date:'MMMM' }}</span>
                    <span class="año">{{ cita.fecha | date:'yyyy' }}</span>
                  </div>
                </div>
                <div class="hora-info">
                  <p><strong>{{ cita.horaFormateada }}</strong></p>
                  <p class="duracion">{{ cita.duracionFormateada }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="info-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>medical_services</mat-icon>
              <mat-card-title>Servicio</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <h3>{{ cita.tipoServicioDisplay }}</h3>
              <div class="servicio-detalles">
                <mat-chip-set>
                  <mat-chip *ngIf="cita.esUrgente" color="warn">
                    <mat-icon matChipAvatar>priority_high</mat-icon>
                    Urgente
                  </mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="info-card" *ngIf="cita.precio">
            <mat-card-header>
              <mat-icon mat-card-avatar>payments</mat-icon>
              <mat-card-title>Precio</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="precio-info">
                <span class="precio-principal">{{ cita.precioFormateado }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Comentarios -->
        <mat-card *ngIf="cita.comentarios" class="comentarios-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>comment</mat-icon>
            <mat-card-title>Comentarios</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>{{ cita.comentarios }}</p>
          </mat-card-content>
        </mat-card>

        <!-- Información de cancelación -->
        <mat-card *ngIf="cita.esCancelada" class="cancelacion-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="warn">cancel</mat-icon>
            <mat-card-title>Información de Cancelación</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p><strong>Fecha:</strong> {{ cita.fechaCancelacion | date:'medium' }}</p>
            <p *ngIf="cita.motivoCancelacion"><strong>Motivo:</strong> {{ cita.motivoCancelacion }}</p>
            <p><strong>Cancelada por:</strong> {{ getCanceladoPor() }}</p>
          </mat-card-content>
        </mat-card>

        <!-- Notas del profesional -->
        <mat-card *ngIf="cita.notas && cita.esCompletada" class="notas-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>notes</mat-icon>
            <mat-card-title>Notas del Profesional</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>{{ cita.notas }}</p>
            <div *ngIf="cita.recomendaciones">
              <h4>Recomendaciones:</h4>
              <p>{{ cita.recomendaciones }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Acciones principales -->
        <div class="acciones-principales" *ngIf="!cita.esCancelada && !cita.esCompletada">
          <button
            mat-raised-button
            color="primary"
            *ngIf="cita.puedeModificar"
            (click)="mostrarReagendar()">
            <mat-icon>edit_calendar</mat-icon>
            Reagendar Cita
          </button>

          <button
            mat-stroked-button
            color="warn"
            *ngIf="cita.puedeCancelar"
            (click)="mostrarCancelar()">
            <mat-icon>cancel</mat-icon>
            Cancelar Cita
          </button>
        </div>
      </div>

      <!-- Error state -->
      <div *ngIf="!cargando && !cita" class="error-state">
        <mat-icon>error</mat-icon>
        <h2>Cita no encontrada</h2>
        <p>No se pudo cargar la información de la cita.</p>
        <button mat-raised-button (click)="volver()">Volver</button>
      </div>
    </div>

    <!-- Modal para reagendar -->
    <div *ngIf="mostrandoReagendar" class="modal-overlay" (click)="cerrarReagendar()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h2>Reagendar Cita</h2>
        <form [formGroup]="reagendarForm" (ngSubmit)="confirmarReagendar()">
          <mat-form-field>
            <mat-label>Nueva fecha</mat-label>
            <input
              matInput
              [matDatepicker]="pickerReagendar"
              formControlName="nuevaFecha"
              [min]="fechaMinima"
              required>
            <mat-datepicker-toggle matIconSuffix [for]="pickerReagendar"></mat-datepicker-toggle>
            <mat-datepicker #pickerReagendar></mat-datepicker>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Nueva hora</mat-label>
            <mat-select formControlName="nuevaHora" required>
              <mat-option *ngFor="let horario of horariosDisponibles" [value]="horario.hora">
                {{ horario.hora }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Motivo del cambio (opcional)</mat-label>
            <textarea matInput formControlName="motivo" rows="3"></textarea>
          </mat-form-field>

          <div class="modal-actions">
            <button type="button" mat-button (click)="cerrarReagendar()">Cancelar</button>
            <button type="submit" mat-raised-button color="primary" [disabled]="!reagendarForm.valid">
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal para cancelar -->
    <div *ngIf="mostrandoCancelar" class="modal-overlay" (click)="cerrarCancelar()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h2>Cancelar Cita</h2>
        <div class="cancelacion-info">
          <mat-icon color="warn">warning</mat-icon>
          <p>¿Estás seguro de que quieres cancelar esta cita?</p>
          <p class="advertencia">{{ getAdvertenciaCancelacion() }}</p>
        </div>

        <form [formGroup]="cancelarForm" (ngSubmit)="confirmarCancelacion()">
          <mat-form-field>
            <mat-label>Motivo de la cancelación</mat-label>
            <textarea matInput formControlName="motivo" rows="3" required></textarea>
            <mat-error>El motivo es obligatorio</mat-error>
          </mat-form-field>

          <div class="modal-actions">
            <button type="button" mat-button (click)="cerrarCancelar()">No, mantener cita</button>
            <button type="submit" mat-raised-button color="warn" [disabled]="!cancelarForm.valid">
              Sí, cancelar cita
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .cita-detalle-container {
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .loading, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
      color: #666;
    }

    .loading mat-spinner, .error-state mat-icon {
      margin-bottom: 16px;
    }

    .error-state mat-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: #f44336;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .header h1 {
      flex: 1;
      margin: 0;
      color: #333;
    }

    .estado-card {
      margin-bottom: 24px;
    }

    .estado-card.estado-pendiente { border-left: 4px solid #ff9800; }
    .estado-card.estado-confirmada { border-left: 4px solid #2196f3; }
    .estado-card.estado-en_curso { border-left: 4px solid #9c27b0; }
    .estado-card.estado-completada { border-left: 4px solid #4caf50; }
    .estado-card.estado-cancelada { border-left: 4px solid #f44336; }

    .estado-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .estado-info mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
    }

    .icon-warning { color: #ff9800; }
    .icon-info { color: #2196f3; }
    .icon-primary { color: #9c27b0; }
    .icon-success { color: #4caf50; }
    .icon-danger { color: #f44336; }

    .estado-info h2 {
      margin: 0 0 4px 0;
      color: #333;
    }

    .estado-info p {
      margin: 0;
      color: #666;
    }

    .tiempo-restante {
      text-align: right;
      color: #666;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .info-card mat-card-header {
      margin-bottom: 16px;
    }

    .profesional-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .profesional-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
    }

    .profesional-info h3 {
      margin: 0 0 4px 0;
      color: #333;
    }

    .categoria {
      color: #666;
      margin: 0 0 4px 0;
    }

    .negocio {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #999;
      margin: 0;
    }

    .fecha-info {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .fecha-principal {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dia {
      font-size: 2.5rem;
      font-weight: bold;
      color: #333;
    }

    .mes {
      display: block;
      color: #666;
      text-transform: capitalize;
    }

    .año {
      display: block;
      color: #999;
      font-size: 0.9rem;
    }

    .hora-info p {
      margin: 0;
    }

    .duracion {
      color: #666 !important;
    }

    .precio-principal {
      font-size: 2rem;
      font-weight: bold;
      color: #4caf50;
    }

    .comentarios-card, .cancelacion-card, .notas-card {
      margin-bottom: 24px;
    }

    .cancelacion-card {
      border-left: 4px solid #f44336;
    }

    .acciones-principales {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 32px;
    }

    /* Modal styles */
    .modal-overlay {
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

    .modal-content {
      background: white;
      padding: 24px;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-content h2 {
      margin: 0 0 24px 0;
      color: #333;
    }

    .modal-content mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .cancelacion-info {
      text-align: center;
      margin-bottom: 24px;
    }

    .cancelacion-info mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }

    .advertencia {
      color: #f44336;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .cita-detalle-container {
        padding: 16px;
      }

      .header {
        flex-wrap: wrap;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .acciones-principales {
        flex-direction: column;
      }

      .fecha-info {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .estado-info {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class CitaDetalleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  citaId: number | null = null;
  cita: Cita | null = null;
  cargando = true;

  // Modales
  mostrandoReagendar = false;
  mostrandoCancelar = false;

  // Forms
  reagendarForm!: FormGroup;
  cancelarForm!: FormGroup;

  horariosDisponibles: any[] = [];
  fechaMinima = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private citaService: CitaService
  ) {
    this.inicializarForms();
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.citaId = +params['id'];
      if (this.citaId) {
        this.cargarCita();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  inicializarForms(): void {
    this.reagendarForm = this.fb.group({
      nuevaFecha: ['', Validators.required],
      nuevaHora: ['', Validators.required],
      motivo: ['']
    });

    this.cancelarForm = this.fb.group({
      motivo: ['', Validators.required]
    });
  }

  cargarCita(): void {
    if (!this.citaId) return;

    this.cargando = true;
    this.citaService.obtenerCitaPorId(this.citaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cita) => {
          this.cita = cita;
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar cita:', error);
          this.cargando = false;
          this.snackBar.open('Error al cargar la cita', 'Cerrar', { duration: 3000 });
        }
      });
  }

  volver(): void {
    this.router.navigate(['/citas']);
  }

  getEstadoIcon(): string {
    if (!this.cita) return 'help';

    const icons = {
      'PENDIENTE': 'schedule',
      'CONFIRMADA': 'check_circle',
      'EN_CURSO': 'play_circle',
      'COMPLETADA': 'check_circle',
      'CANCELADA': 'cancel',
      'NO_ASISTIO': 'person_off'
    };
    return icons[this.cita.estado] || 'help';
  }

  getEstadoDescripcion(): string {
    if (!this.cita) return '';

    const descripciones = {
      'PENDIENTE': 'Tu cita está pendiente de confirmación',
      'CONFIRMADA': 'Tu cita ha sido confirmada',
      'EN_CURSO': 'Tu cita está en progreso',
      'COMPLETADA': 'Tu cita ha sido completada',
      'CANCELADA': 'Esta cita fue cancelada',
      'NO_ASISTIO': 'No se asistió a esta cita'
    };
    return descripciones[this.cita.estado] || '';
  }

  getCanceladoPor(): string {
    if (!this.cita?.usuarioCancelacion) return 'Usuario';

    const por = {
      'USUARIO': 'Ti',
      'PROFESIONAL': 'El profesional',
      'SISTEMA': 'El sistema'
    };
    return por[this.cita.usuarioCancelacion] || 'Usuario';
  }

  mostrarReagendar(): void {
    this.mostrandoReagendar = true;
    // En una implementación real, cargarías horarios disponibles aquí
    this.cargarHorariosDisponibles();
  }

  cerrarReagendar(): void {
    this.mostrandoReagendar = false;
    this.reagendarForm.reset();
  }

  mostrarCancelar(): void {
    this.mostrandoCancelar = true;
  }

  cerrarCancelar(): void {
    this.mostrandoCancelar = false;
    this.cancelarForm.reset();
  }

  cargarHorariosDisponibles(): void {
    // Simular horarios disponibles
    this.horariosDisponibles = [
      { hora: '09:00' },
      { hora: '10:00' },
      { hora: '11:00' },
      { hora: '14:00' },
      { hora: '15:00' },
      { hora: '16:00' }
    ];
  }

  confirmarReagendar(): void {
    if (!this.reagendarForm.valid || !this.cita) return;

    const formValue = this.reagendarForm.value;
    const reagendarData: ReagendarCitaDTO = {
      nuevaFecha: formValue.nuevaFecha.toISOString().split('T')[0],
      nuevaHora: formValue.nuevaHora,
      motivo: formValue.motivo
    };

    this.citaService.reagendarCita(this.cita.id, reagendarData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (citaActualizada) => {
          this.cita = citaActualizada;
          this.cerrarReagendar();
          this.snackBar.open('Cita reagendada con éxito', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Error al reagendar:', error);
          this.snackBar.open(error.message || 'Error al reagendar la cita', 'Cerrar', {
            duration: 3000
          });
        }
      });
  }

  confirmarCancelacion(): void {
    if (!this.cancelarForm.valid || !this.cita) return;

    const cancelacionData: CancelacionCitaDTO = {
      motivo: this.cancelarForm.value.motivo,
      anticipacion: this.calcularHorasAnticipacion()
    };

    this.citaService.cancelarCita(this.cita.id, cancelacionData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.cerrarCancelar();
          this.snackBar.open('Cita cancelada', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          // Recargar la cita para actualizar el estado
          this.cargarCita();
        },
        error: (error) => {
          console.error('Error al cancelar:', error);
          this.snackBar.open(error.message || 'Error al cancelar la cita', 'Cerrar', {
            duration: 3000
          });
        }
      });
  }

  calcularHorasAnticipacion(): number {
    if (!this.cita) return 0;
    const ahora = new Date();
    const fechaCita = this.cita.fechaCompleta;
    return Math.floor((fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60));
  }

  getAdvertenciaCancelacion(): string {
    const horasAnticipacion = this.calcularHorasAnticipacion();

    if (horasAnticipacion < 2) {
      return 'Cancelación con menos de 2 horas: Se cobrará el 100% del servicio.';
    } else if (horasAnticipacion < 24) {
      return 'Cancelación con menos de 24 horas: Se cobrará el 50% del servicio.';
    } else {
      return 'Cancelación gratuita.';
    }
  }

  calificarCita(): void {
    // TODO: Implementar modal de calificación
    this.snackBar.open('Función de calificación próximamente', 'Cerrar', { duration: 2000 });
  }

  compartirCita(): void {
    if (navigator.share && this.cita) {
      navigator.share({
        title: `Cita con ${this.cita.profesionalNombre}`,
        text: `Mi cita el ${this.cita.fechaHoraCorta}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.snackBar.open('Enlace copiado al portapapeles', 'Cerrar', { duration: 2000 });
    }
  }
}