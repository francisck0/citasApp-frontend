/**
 * Componente para agendar nueva cita
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, map, startWith } from 'rxjs';

import { CitaService } from '../../services/cita.service';
import { NegocioService } from '../../services/negocio.service';
import { ProfesionalService } from '../../services/profesional.service';
import { CitaCreateDTO, TipoServicio } from '../../interfaces/cita-dtos.interface';
import { Negocio } from '../../models/negocio.model';
import { Profesional } from '../../models/profesional.model';

@Component({
  selector: 'app-nueva-cita',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="nueva-cita-container">
      <div class="header">
        <h1>Agendar Nueva Cita</h1>
        <p>Selecciona tu profesional favorito y agenda tu cita en unos sencillos pasos</p>
      </div>

      <mat-horizontal-stepper #stepper linear="true" labelPosition="bottom">
        <!-- Paso 1: Selección de Negocio/Profesional -->
        <mat-step label="Profesional" [stepControl]="paso1Form">
          <form [formGroup]="paso1Form">
            <div class="step-content">
              <h2>¿Con quién quieres agendar tu cita?</h2>

              <!-- Buscar por negocio o profesional -->
              <mat-form-field class="full-width">
                <mat-label>Buscar negocio o profesional</mat-label>
                <input
                  matInput
                  formControlName="busqueda"
                  placeholder="Ej. Salón María, Dr. García..."
                  [matAutocomplete]="auto">
                <mat-icon matSuffix>search</mat-icon>
                <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onProfesionalSelected($event)">
                  <mat-option *ngFor="let profesional of profesionalesFiltrados" [value]="profesional">
                    <div class="profesional-option">
                      <div class="profesional-info">
                        <strong>{{ profesional.usuario.nombre }} {{ profesional.usuario.apellidos }}</strong>
                        <span class="categoria">{{ profesional.categorias[0]?.nombre }}</span>
                        <span class="negocio">{{ profesional.negocio.nombre }}</span>
                      </div>
                      <div class="profesional-rating" *ngIf="profesional.calificacion">
                        <mat-icon>star</mat-icon>
                        <span>{{ profesional.calificacion.toFixed(1) }}</span>
                      </div>
                    </div>
                  </mat-option>
                </mat-autocomplete>
              </mat-form-field>

              <!-- Profesional seleccionado -->
              <mat-card *ngIf="profesionalSeleccionado" class="profesional-card">
                <mat-card-content>
                  <div class="profesional-header">
                    <img
                      [src]="profesionalSeleccionado.foto || '/assets/default-avatar.png'"
                      [alt]="profesionalSeleccionado.usuario.nombre"
                      class="profesional-avatar">
                    <div class="profesional-details">
                      <h3>{{ profesionalSeleccionado.usuario.nombre }} {{ profesionalSeleccionado.usuario.apellidos }}</h3>
                      <p class="categoria">{{ profesionalSeleccionado.categorias[0]?.nombre }}</p>
                      <p class="negocio">
                        <mat-icon>location_on</mat-icon>
                        {{ profesionalSeleccionado.negocio.nombre }}
                      </p>
                      <div class="rating" *ngIf="profesionalSeleccionado.calificacion">
                        <mat-icon>star</mat-icon>
                        <span>{{ profesionalSeleccionado.calificacion.toFixed(1) }}</span>
                        <span class="reviews">({{ profesionalSeleccionado['totalReseñas'] }} reseñas)</span>
                      </div>
                    </div>
                    <button mat-icon-button (click)="limpiarProfesional()">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>

                  <div class="profesional-info" *ngIf="profesionalSeleccionado.biografia">
                    <p>{{ profesionalSeleccionado.biografia }}</p>
                  </div>

                  <div class="servicios-disponibles">
                    <h4>Servicios disponibles:</h4>
                    <mat-chip-set>
                      <mat-chip *ngFor="let servicio of profesionalSeleccionado.servicios">
                        {{ servicio.nombre }} - {{ servicio.precio }}€
                      </mat-chip>
                    </mat-chip-set>
                  </div>
                </mat-card-content>
              </mat-card>

              <div class="step-actions">
                <button mat-raised-button color="primary" [disabled]="!profesionalSeleccionado" matStepperNext>
                  Siguiente
                </button>
              </div>
            </div>
          </form>
        </mat-step>

        <!-- Paso 2: Selección de Servicio -->
        <mat-step label="Servicio" [stepControl]="paso2Form">
          <form [formGroup]="paso2Form">
            <div class="step-content">
              <h2>¿Qué servicio necesitas?</h2>

              <div class="servicios-grid" *ngIf="profesionalSeleccionado">
                <mat-card
                  *ngFor="let servicio of profesionalSeleccionado.servicios"
                  class="servicio-card"
                  [class.selected]="servicioSeleccionado?.id === servicio.id"
                  (click)="seleccionarServicio(servicio)">
                  <mat-card-content>
                    <div class="servicio-header">
                      <h3>{{ servicio.nombre }}</h3>
                      <span class="precio">{{ servicio.precio }}€</span>
                    </div>
                    <p class="duracion">
                      <mat-icon>schedule</mat-icon>
                      {{ servicio.duracionMinutos }} min
                    </p>
                    <p *ngIf="servicio.descripcion" class="descripcion">{{ servicio.descripcion }}</p>
                  </mat-card-content>
                </mat-card>
              </div>

              <mat-form-field class="full-width">
                <mat-label>Tipo de servicio</mat-label>
                <mat-select formControlName="tipoServicio" required>
                  <mat-option value="PRIMERA_VEZ">Primera vez</mat-option>
                  <mat-option value="MANTENIMIENTO">Mantenimiento</mat-option>
                  <mat-option value="SEGUIMIENTO">Seguimiento</mat-option>
                  <mat-option value="SESION_COMPLETA">Sesión completa</mat-option>
                  <mat-option value="CONSULTA">Consulta</mat-option>
                </mat-select>
                <mat-error *ngIf="paso2Form.get('tipoServicio')?.hasError('required')">
                  Selecciona el tipo de servicio
                </mat-error>
              </mat-form-field>

              <mat-checkbox formControlName="esUrgente" class="urgente-checkbox">
                ¿Es urgente? (Priorizaremos tu cita)
              </mat-checkbox>

              <div class="step-actions">
                <button mat-button matStepperPrevious>Anterior</button>
                <button mat-raised-button color="primary" [disabled]="!servicioSeleccionado" matStepperNext>
                  Siguiente
                </button>
              </div>
            </div>
          </form>
        </mat-step>

        <!-- Paso 3: Fecha y Hora -->
        <mat-step label="Fecha y Hora" [stepControl]="paso3Form">
          <form [formGroup]="paso3Form">
            <div class="step-content">
              <h2>¿Cuándo te gustaría tu cita?</h2>

              <div class="fecha-hora-container">
                <div class="fecha-section">
                  <mat-form-field>
                    <mat-label>Fecha</mat-label>
                    <input
                      matInput
                      [matDatepicker]="picker"
                      formControlName="fecha"
                      [min]="fechaMinima"
                      [max]="fechaMaxima"
                      (dateChange)="onFechaChange($event)"
                      required>
                    <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                    <mat-error *ngIf="paso3Form.get('fecha')?.hasError('required')">
                      Selecciona una fecha
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="hora-section" *ngIf="horariosDisponibles.length > 0">
                  <h3>Horarios disponibles</h3>
                  <div class="horarios-grid">
                    <mat-chip-set>
                      <mat-chip
                        *ngFor="let horario of horariosDisponibles"
                        [class.selected]="horaSeleccionada === horario.hora"
                        (click)="seleccionarHora(horario.hora)">
                        {{ horario.hora }}
                      </mat-chip>
                    </mat-chip-set>
                  </div>
                </div>

                <div class="no-horarios" *ngIf="fechaSeleccionada && horariosDisponibles.length === 0">
                  <mat-icon>event_busy</mat-icon>
                  <p>No hay horarios disponibles para esta fecha</p>
                  <p>Selecciona otra fecha o contacta directamente con el profesional</p>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>Anterior</button>
                <button mat-raised-button color="primary" [disabled]="!horaSeleccionada" matStepperNext>
                  Siguiente
                </button>
              </div>
            </div>
          </form>
        </mat-step>

        <!-- Paso 4: Información adicional -->
        <mat-step label="Detalles">
          <form [formGroup]="paso4Form">
            <div class="step-content">
              <h2>Información adicional</h2>

              <mat-form-field class="full-width">
                <mat-label>Comentarios o peticiones especiales</mat-label>
                <textarea
                  matInput
                  formControlName="comentarios"
                  rows="4"
                  placeholder="Describe cualquier detalle importante para tu cita...">
                </textarea>
              </mat-form-field>

              <div class="resumen-cita">
                <h3>Resumen de tu cita</h3>
                <mat-card>
                  <mat-card-content>
                    <div class="resumen-item">
                      <strong>Profesional:</strong>
                      <span>{{ profesionalSeleccionado?.usuario?.nombre }} {{ profesionalSeleccionado?.usuario?.apellidos }}</span>
                    </div>
                    <div class="resumen-item">
                      <strong>Servicio:</strong>
                      <span>{{ servicioSeleccionado?.nombre }}</span>
                    </div>
                    <div class="resumen-item">
                      <strong>Fecha:</strong>
                      <span>{{ fechaSeleccionada | date:'fullDate' }}</span>
                    </div>
                    <div class="resumen-item">
                      <strong>Hora:</strong>
                      <span>{{ horaSeleccionada }}</span>
                    </div>
                    <div class="resumen-item">
                      <strong>Duración:</strong>
                      <span>{{ servicioSeleccionado?.duracionMinutos }} minutos</span>
                    </div>
                    <div class="resumen-item total">
                      <strong>Total:</strong>
                      <span>{{ servicioSeleccionado?.precio }}€</span>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>Anterior</button>
                <button
                  mat-raised-button
                  color="primary"
                  (click)="confirmarCita()"
                  [disabled]="creandoCita">
                  <mat-spinner diameter="20" *ngIf="creandoCita"></mat-spinner>
                  {{ creandoCita ? 'Agendando...' : 'Confirmar Cita' }}
                </button>
              </div>
            </div>
          </form>
        </mat-step>
      </mat-horizontal-stepper>
    </div>
  `,
  styles: [`
    .nueva-cita-container {
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 32px;
    }

    .header h1 {
      color: #333;
      margin-bottom: 8px;
    }

    .header p {
      color: #666;
      font-size: 1.1rem;
    }

    .step-content {
      padding: 24px 0;
    }

    .step-content h2 {
      color: #333;
      margin-bottom: 24px;
    }

    .full-width {
      width: 100%;
    }

    .profesional-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .profesional-info {
      display: flex;
      flex-direction: column;
    }

    .categoria {
      color: #666;
      font-size: 0.9rem;
    }

    .negocio {
      color: #999;
      font-size: 0.85rem;
    }

    .profesional-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ff9800;
    }

    .profesional-card {
      margin: 16px 0;
      border: 2px solid #e0e0e0;
    }

    .profesional-card.selected {
      border-color: #1976d2;
    }

    .profesional-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .profesional-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
    }

    .profesional-details {
      flex: 1;
    }

    .profesional-details h3 {
      margin: 0 0 4px 0;
      color: #333;
    }

    .profesional-details p {
      margin: 2px 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ff9800;
    }

    .reviews {
      color: #666;
      font-size: 0.9rem;
    }

    .profesional-info {
      margin: 16px 0;
      color: #666;
    }

    .servicios-disponibles h4 {
      margin: 16px 0 8px 0;
      color: #333;
    }

    .servicios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin: 16px 0;
    }

    .servicio-card {
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid #e0e0e0;
    }

    .servicio-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .servicio-card.selected {
      border-color: #1976d2;
      background-color: #e3f2fd;
    }

    .servicio-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .servicio-header h3 {
      margin: 0;
      color: #333;
    }

    .precio {
      font-size: 1.2rem;
      font-weight: bold;
      color: #4caf50;
    }

    .duracion {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      margin: 0 0 8px 0;
    }

    .descripcion {
      color: #666;
      font-size: 0.9rem;
      margin: 0;
    }

    .urgente-checkbox {
      margin: 16px 0;
    }

    .fecha-hora-container {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 32px;
      margin: 16px 0;
    }

    .fecha-section mat-form-field {
      width: 100%;
    }

    .hora-section h3 {
      color: #333;
      margin-bottom: 16px;
    }

    .horarios-grid mat-chip {
      margin: 4px;
      cursor: pointer;
    }

    .horarios-grid mat-chip.selected {
      background-color: #1976d2;
      color: white;
    }

    .no-horarios {
      text-align: center;
      color: #666;
      padding: 32px;
    }

    .no-horarios mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .resumen-cita {
      margin: 24px 0;
    }

    .resumen-cita h3 {
      color: #333;
      margin-bottom: 16px;
    }

    .resumen-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .resumen-item.total {
      border-bottom: none;
      border-top: 2px solid #e0e0e0;
      margin-top: 8px;
      padding-top: 16px;
      font-size: 1.1rem;
      color: #4caf50;
    }

    .step-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .nueva-cita-container {
        padding: 16px;
      }

      .servicios-grid {
        grid-template-columns: 1fr;
      }

      .fecha-hora-container {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .profesional-header {
        flex-direction: column;
        text-align: center;
      }

      .step-actions {
        flex-direction: column;
      }
    }
  `]
})
export class NuevaCitaComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Forms
  paso1Form!: FormGroup;
  paso2Form!: FormGroup;
  paso3Form!: FormGroup;
  paso4Form!: FormGroup;

  // Data
  profesionalesFiltrados: Profesional[] = [];
  profesionalSeleccionado: Profesional | null = null;
  servicioSeleccionado: any = null;
  horariosDisponibles: any[] = [];
  fechaSeleccionada: Date | null = null;
  horaSeleccionada: string | null = null;
  creandoCita = false;

  // Date constraints
  fechaMinima = new Date();
  fechaMaxima = new Date();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private citaService: CitaService,
    private negocioService: NegocioService,
    private profesionalService: ProfesionalService
  ) {
    this.inicializarForms();
    this.fechaMaxima.setMonth(this.fechaMaxima.getMonth() + 3); // 3 meses adelante
  }

  ngOnInit(): void {
    this.configurarBusquedaProfesional();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  inicializarForms(): void {
    this.paso1Form = this.fb.group({
      busqueda: ['', Validators.required]
    });

    this.paso2Form = this.fb.group({
      tipoServicio: ['', Validators.required]
    });

    this.paso3Form = this.fb.group({
      fecha: ['', Validators.required],
      hora: ['', Validators.required]
    });

    this.paso4Form = this.fb.group({
      comentarios: ['']
    });
  }

  configurarBusquedaProfesional(): void {
    this.paso1Form.get('busqueda')?.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(valor => {
          if (typeof valor === 'string' && valor.length >= 2) {
            return this.profesionalService.buscarProfesionales({ textoBusqueda: valor });
          }
          return [];
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (profesionales) => {
          this.profesionalesFiltrados = profesionales.slice(0, 10); // Limitar resultados
        },
        error: (error) => {
          console.error('Error buscando profesionales:', error);
        }
      });
  }

  onProfesionalSelected(event: any): void {
    this.profesionalSeleccionado = event.option.value;
    this.paso1Form.patchValue({ busqueda: '' });
  }

  limpiarProfesional(): void {
    this.profesionalSeleccionado = null;
    this.servicioSeleccionado = null;
    this.paso1Form.patchValue({ busqueda: '' });
  }

  seleccionarServicio(servicio: any): void {
    this.servicioSeleccionado = servicio;
  }

  filtrarFechas = (date: Date | null): boolean => {
    if (!date) return false;
    const day = date.getDay();
    // Bloquear domingos (0) por ejemplo
    return day !== 0;
  };

  onFechaChange(event: any): void {
    this.fechaSeleccionada = event.value;
    this.horaSeleccionada = null;
    this.horariosDisponibles = [];

    if (this.fechaSeleccionada && this.profesionalSeleccionado && this.servicioSeleccionado) {
      this.cargarHorariosDisponibles();
    }
  }

  cargarHorariosDisponibles(): void {
    if (!this.fechaSeleccionada || !this.profesionalSeleccionado || !this.servicioSeleccionado) return;

    const fecha = this.fechaSeleccionada.toISOString().split('T')[0];

    // Simular horarios disponibles (en una implementación real vendrían del backend)
    const horariosBase = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
    ];

    // Filtrar horarios ocupados (esto vendría del servicio real)
    this.horariosDisponibles = horariosBase.map(hora => ({
      hora,
      disponible: Math.random() > 0.3 // Simular disponibilidad
    })).filter(h => h.disponible);
  }

  seleccionarHora(hora: string): void {
    this.horaSeleccionada = hora;
    this.paso3Form.patchValue({ hora });
  }

  confirmarCita(): void {
    if (!this.profesionalSeleccionado || !this.servicioSeleccionado || !this.fechaSeleccionada || !this.horaSeleccionada) {
      this.snackBar.open('Faltan datos para confirmar la cita', 'Cerrar', { duration: 3000 });
      return;
    }

    this.creandoCita = true;

    const citaData: CitaCreateDTO = {
      profesionalId: this.profesionalSeleccionado.id,
      fecha: this.fechaSeleccionada.toISOString().split('T')[0],
      hora: this.horaSeleccionada,
      tipoServicio: this.paso2Form.value.tipoServicio as TipoServicio,
      comentarios: this.paso4Form.value.comentarios,
      esUrgente: this.paso2Form.value.esUrgente || false
    };

    this.citaService.crearCita(citaData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cita) => {
          this.snackBar.open('¡Cita agendada con éxito!', 'Cerrar', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/citas', cita.id]);
        },
        error: (error) => {
          console.error('Error al crear cita:', error);
          this.snackBar.open(
            error.message || 'Error al agendar la cita',
            'Cerrar',
            { duration: 5000 }
          );
          this.creandoCita = false;
        }
      });
  }
}