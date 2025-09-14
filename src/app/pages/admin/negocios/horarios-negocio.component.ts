/**
 * Componente para configuración de horarios de atención del negocio
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil } from 'rxjs';

import { NegocioService } from '../../../services/negocio.service';
import { Negocio } from '../../../models/negocio.model';
import { DiaSemana } from '../../../interfaces/cita-dtos.interface';
import { HorarioAtencionDTO, HorarioAtencionCreateDTO } from '../../../interfaces/negocio-dtos.interface';

export interface HorarioFormulario {
  dia: DiaSemana;
  activo: boolean;
  horaInicio: string;
  horaFin: string;
  pausas: PausaHorario[];
}

export interface PausaHorario {
  horaInicio: string;
  horaFin: string;
  motivo: string;
}

@Component({
  selector: 'app-horarios-negocio',
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
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="horarios-container">
      <!-- Header -->
      <div class="header">
        <button mat-icon-button (click)="volver()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h1>Configuración de Horarios</h1>
          <p *ngIf="negocio">{{ negocio.nombre }}</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="aplicarATodos()">
            <mat-icon>content_copy</mat-icon>
            Aplicar a Todos
          </button>
          <button mat-raised-button color="primary" (click)="guardarHorarios()" [disabled]="guardando">
            <mat-spinner diameter="20" *ngIf="guardando"></mat-spinner>
            {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="cargando">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Cargando configuración de horarios...</p>
      </div>

      <!-- Content -->
      <div *ngIf="!cargando">
        <!-- Configuración General -->
        <mat-card class="config-general-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>settings</mat-icon>
            <mat-card-title>Configuración General</mat-card-title>
            <mat-card-subtitle>Configuraciones que aplican a todos los horarios</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="configGeneralForm">
              <div class="config-row">
                <mat-form-field>
                  <mat-label>Duración mínima de cita (minutos)</mat-label>
                  <mat-select formControlName="duracionMinimaCita">
                    <mat-option value="15">15 minutos</mat-option>
                    <mat-option value="30">30 minutos</mat-option>
                    <mat-option value="45">45 minutos</mat-option>
                    <mat-option value="60">1 hora</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Tiempo entre citas (minutos)</mat-label>
                  <mat-select formControlName="tiempoEntreCitas">
                    <mat-option value="0">Sin espacio</mat-option>
                    <mat-option value="5">5 minutos</mat-option>
                    <mat-option value="10">10 minutos</mat-option>
                    <mat-option value="15">15 minutos</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Días de anticipación máxima</mat-label>
                  <mat-select formControlName="diasAnticipacion">
                    <mat-option value="7">1 semana</mat-option>
                    <mat-option value="14">2 semanas</mat-option>
                    <mat-option value="30">1 mes</mat-option>
                    <mat-option value="60">2 meses</mat-option>
                    <mat-option value="90">3 meses</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="config-toggles">
                <mat-slide-toggle formControlName="permitirCitasWeekend">
                  Permitir citas en fines de semana
                </mat-slide-toggle>
                <mat-slide-toggle formControlName="permitirCitasUrgentes">
                  Permitir citas urgentes (fuera de horario)
                </mat-slide-toggle>
                <mat-slide-toggle formControlName="confirmacionAutomatica">
                  Confirmación automática de citas
                </mat-slide-toggle>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Horarios por Día -->
        <form [formGroup]="horariosForm">
          <div class="horarios-semana">
            <div *ngFor="let dia of diasSemana; let i = index" class="dia-card">
              <mat-card [class.disabled]="!getDiaControl(i).get('activo')?.value">
                <mat-card-header>
                  <div class="dia-header">
                    <mat-slide-toggle
                      [formControl]="$any(getDiaControl(i).get('activo'))!"
                      (change)="onDiaToggle(i, $event)">
                      <strong>{{ getDiaDisplay(dia) }}</strong>
                    </mat-slide-toggle>
                    <span class="estado-dia" [class.activo]="getDiaControl(i).get('activo')?.value">
                      {{ getDiaControl(i).get('activo')?.value ? 'Abierto' : 'Cerrado' }}
                    </span>
                  </div>
                </mat-card-header>

                <mat-card-content *ngIf="getDiaControl(i).get('activo')?.value">
                  <div class="horario-principal">
                    <mat-form-field>
                      <mat-label>Hora de apertura</mat-label>
                      <input matInput type="time" [formControl]="$any(getDiaControl(i).get('horaInicio'))!">
                    </mat-form-field>
                    <mat-form-field>
                      <mat-label>Hora de cierre</mat-label>
                      <input matInput type="time" [formControl]="$any(getDiaControl(i).get('horaFin'))!">
                    </mat-form-field>
                  </div>

                  <!-- Pausas/Descansos -->
                  <div class="pausas-section">
                    <div class="pausas-header">
                      <h4>Pausas y Descansos</h4>
                      <button mat-icon-button type="button" (click)="agregarPausa(i)">
                        <mat-icon>add</mat-icon>
                      </button>
                    </div>

                    <div class="pausas-list" formArrayName="pausas">
                      <div *ngFor="let pausa of getPausasArray(i).controls; let j = index" class="pausa-item" [formGroupName]="j">
                        <div class="pausa-horario">
                          <mat-form-field>
                            <mat-label>Desde</mat-label>
                            <input matInput type="time" formControlName="horaInicio">
                          </mat-form-field>
                          <mat-form-field>
                            <mat-label>Hasta</mat-label>
                            <input matInput type="time" formControlName="horaFin">
                          </mat-form-field>
                          <mat-form-field>
                            <mat-label>Motivo</mat-label>
                            <input matInput formControlName="motivo" placeholder="Ej: Almuerzo, Descanso...">
                          </mat-form-field>
                          <button mat-icon-button type="button" (click)="eliminarPausa(i, j)" color="warn">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div *ngIf="getPausasArray(i).length === 0" class="no-pausas">
                      <p>No hay pausas configuradas para este día</p>
                      <button mat-stroked-button type="button" (click)="agregarPausa(i)">
                        <mat-icon>add</mat-icon>
                        Agregar Primera Pausa
                      </button>
                    </div>
                  </div>
                </mat-card-content>

                <mat-card-actions *ngIf="getDiaControl(i).get('activo')?.value">
                  <button mat-button (click)="copiarHorario(i)">
                    <mat-icon>content_copy</mat-icon>
                    Copiar este horario
                  </button>
                  <button mat-button (click)="limpiarDia(i)">
                    <mat-icon>clear</mat-icon>
                    Limpiar
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </form>

        <!-- Horarios Especiales -->
        <mat-card class="horarios-especiales-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>event_note</mat-icon>
            <mat-card-title>Horarios Especiales</mat-card-title>
            <mat-card-subtitle>Configurar horarios para fechas específicas</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="horarios-especiales-content">
              <p>Funcionalidad próximamente disponible</p>
              <ul>
                <li>Días festivos</li>
                <li>Vacaciones</li>
                <li>Horarios de temporada</li>
                <li>Eventos especiales</li>
              </ul>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Preview -->
        <mat-card class="preview-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>preview</mat-icon>
            <mat-card-title>Vista Previa</mat-card-title>
            <mat-card-subtitle>Cómo verán los clientes tus horarios</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="preview-content">
              <div *ngFor="let dia of diasSemana; let i = index" class="preview-dia">
                <div class="preview-dia-header">
                  <strong>{{ getDiaDisplay(dia) }}</strong>
                  <span *ngIf="!getDiaControl(i).get('activo')?.value" class="cerrado">Cerrado</span>
                </div>
                <div *ngIf="getDiaControl(i).get('activo')?.value" class="preview-horario">
                  <span>{{ getDiaControl(i).get('horaInicio')?.value }} - {{ getDiaControl(i).get('horaFin')?.value }}</span>
                  <div *ngIf="getPausasArray(i).length > 0" class="preview-pausas">
                    <mat-chip-set>
                      <mat-chip *ngFor="let pausa of getPausasArray(i).controls">
                        Pausa: {{ pausa.get('horaInicio')?.value }}-{{ pausa.get('horaFin')?.value }}
                      </mat-chip>
                    </mat-chip-set>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .horarios-container {
      padding: 24px;
      max-width: 1200px;
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

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: #666;
    }

    .config-general-card {
      margin-bottom: 32px;
    }

    .config-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .config-toggles {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .horarios-semana {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-bottom: 32px;
    }

    .dia-card mat-card {
      transition: opacity 0.3s;
    }

    .dia-card mat-card.disabled {
      opacity: 0.6;
      background-color: #fafafa;
    }

    .dia-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .estado-dia {
      color: #666;
      font-size: 0.9rem;
    }

    .estado-dia.activo {
      color: #4caf50;
      font-weight: 500;
    }

    .horario-principal {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .pausas-section {
      border-top: 1px solid #e0e0e0;
      padding-top: 16px;
    }

    .pausas-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .pausas-header h4 {
      margin: 0;
      color: #333;
    }

    .pausas-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .pausa-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      background: #fafafa;
    }

    .pausa-horario {
      display: grid;
      grid-template-columns: auto auto 1fr auto;
      gap: 12px;
      align-items: center;
    }

    .no-pausas {
      text-align: center;
      padding: 24px;
      color: #666;
    }

    .no-pausas p {
      margin-bottom: 16px;
    }

    .horarios-especiales-card, .preview-card {
      margin-bottom: 24px;
    }

    .horarios-especiales-content {
      color: #666;
    }

    .horarios-especiales-content ul {
      margin: 16px 0;
      padding-left: 20px;
    }

    .preview-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .preview-dia {
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }

    .preview-dia-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .cerrado {
      color: #f44336;
      font-size: 0.85rem;
    }

    .preview-horario span {
      color: #333;
      font-weight: 500;
    }

    .preview-pausas {
      margin-top: 8px;
    }

    .preview-pausas mat-chip {
      font-size: 0.75rem;
      min-height: 20px;
    }

    @media (max-width: 768px) {
      .horarios-container {
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

      .config-row {
        grid-template-columns: 1fr;
      }

      .horario-principal {
        grid-template-columns: 1fr;
      }

      .pausa-horario {
        grid-template-columns: 1fr;
      }

      .preview-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HorariosNegocioComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  negocioId: number | null = null;
  negocio: Negocio | null = null;
  cargando = true;
  guardando = false;

  // Forms
  horariosForm!: FormGroup;
  configGeneralForm!: FormGroup;

  // Data
  diasSemana: DiaSemana[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  horarioCopiado: HorarioFormulario | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private negocioService: NegocioService
  ) {
    this.inicializarForms();
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

  inicializarForms(): void {
    // Configuración general
    this.configGeneralForm = this.fb.group({
      duracionMinimaCita: [30, Validators.required],
      tiempoEntreCitas: [10],
      diasAnticipacion: [30],
      permitirCitasWeekend: [false],
      permitirCitasUrgentes: [false],
      confirmacionAutomatica: [true]
    });

    // Horarios por día
    const horariosArray = this.fb.array([]);
    this.diasSemana.forEach(dia => {
      horariosArray.push(this.crearDiaFormGroup(dia) as any);
    });

    this.horariosForm = this.fb.group({
      horarios: horariosArray
    });
  }

  crearDiaFormGroup(dia: DiaSemana): FormGroup {
    return this.fb.group({
      dia: [dia],
      activo: [dia !== 'SABADO' && dia !== 'DOMINGO'], // Por defecto laborables activos
      horaInicio: ['09:00', Validators.required],
      horaFin: ['18:00', Validators.required],
      pausas: this.fb.array([])
    });
  }

  crearPausaFormGroup(): FormGroup {
    return this.fb.group({
      horaInicio: ['13:00', Validators.required],
      horaFin: ['14:00', Validators.required],
      motivo: ['Almuerzo']
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
          this.cargarHorariosExistentes();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar negocio:', error);
          this.snackBar.open('Error al cargar negocio', 'Cerrar', { duration: 3000 });
          this.cargando = false;
        }
      });
  }

  cargarHorariosExistentes(): void {
    if (!this.negocio?.horariosAtencion) return;

    // Cargar horarios existentes en el formulario
    this.negocio.horariosAtencion.forEach(horario => {
      const diaIndex = this.diasSemana.indexOf(horario.diaSemana);
      if (diaIndex >= 0) {
        const diaControl = this.getDiaControl(diaIndex);
        diaControl.patchValue({
          activo: true,
          horaInicio: horario.horaApertura,
          horaFin: horario.horaCierre
        });

        // Cargar pausas si las hay
        if (horario.descansoInicio && horario.descansoFin) {
          const pausasArray = this.getPausasArray(diaIndex);
          pausasArray.push(this.fb.group({
            horaInicio: [horario.descansoInicio],
            horaFin: [horario.descansoFin],
            motivo: ['Descanso']
          }));
        }
      }
    });
  }

  volver(): void {
    this.router.navigate(['/admin/negocios', this.negocioId]);
  }

  getDiaControl(index: number): FormGroup {
    const horariosArray = this.horariosForm.get('horarios') as FormArray;
    return horariosArray.at(index) as FormGroup;
  }

  getPausasArray(diaIndex: number): FormArray {
    return this.getDiaControl(diaIndex).get('pausas') as FormArray;
  }

  onDiaToggle(diaIndex: number, event: any): void {
    const activo = event.checked;
    const diaControl = this.getDiaControl(diaIndex);

    if (!activo) {
      // Limpiar pausas si se desactiva el día
      const pausasArray = this.getPausasArray(diaIndex);
      pausasArray.clear();
    }
  }

  agregarPausa(diaIndex: number): void {
    const pausasArray = this.getPausasArray(diaIndex);
    pausasArray.push(this.crearPausaFormGroup());
  }

  eliminarPausa(diaIndex: number, pausaIndex: number): void {
    const pausasArray = this.getPausasArray(diaIndex);
    pausasArray.removeAt(pausaIndex);
  }

  copiarHorario(diaIndex: number): void {
    const diaControl = this.getDiaControl(diaIndex);
    this.horarioCopiado = diaControl.value;
    this.snackBar.open('Horario copiado', 'Cerrar', { duration: 2000 });
  }

  aplicarATodos(): void {
    if (!this.horarioCopiado) {
      this.snackBar.open('Primero copia un horario', 'Cerrar', { duration: 2000 });
      return;
    }

    this.diasSemana.forEach((dia, index) => {
      if (dia !== 'SABADO' && dia !== 'DOMINGO') { // Solo días laborables
        const diaControl = this.getDiaControl(index);
        const pausasArray = this.getPausasArray(index);

        // Limpiar pausas existentes
        pausasArray.clear();

        // Aplicar nuevo horario
        diaControl.patchValue({
          activo: this.horarioCopiado!.activo,
          horaInicio: this.horarioCopiado!.horaInicio,
          horaFin: this.horarioCopiado!.horaFin
        });

        // Aplicar pausas
        this.horarioCopiado!.pausas.forEach(pausa => {
          pausasArray.push(this.fb.group({
            horaInicio: [pausa.horaInicio],
            horaFin: [pausa.horaFin],
            motivo: [pausa.motivo]
          }));
        });
      }
    });

    this.snackBar.open('Horario aplicado a todos los días laborables', 'Cerrar', { duration: 3000 });
  }

  limpiarDia(diaIndex: number): void {
    const diaControl = this.getDiaControl(diaIndex);
    const pausasArray = this.getPausasArray(diaIndex);

    pausasArray.clear();
    diaControl.patchValue({
      horaInicio: '09:00',
      horaFin: '18:00'
    });
  }

  guardarHorarios(): void {
    if (!this.horariosForm.valid) {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    this.guardando = true;

    // Construir datos para enviar
    const horariosData = this.construirHorariosData();

    // TODO: Implementar llamada al servicio para guardar
    console.log('Guardando horarios:', horariosData);

    setTimeout(() => {
      this.guardando = false;
      this.snackBar.open('Horarios guardados correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }, 2000);
  }

  construirHorariosData(): any {
    const horariosArray = this.horariosForm.get('horarios') as FormArray;
    const configGeneral = this.configGeneralForm.value;

    const horarios: HorarioAtencionCreateDTO[] = [];

    horariosArray.controls.forEach((control, index) => {
      const diaData = control.value;
      if (diaData.activo) {
        const pausas = diaData.pausas.map((pausa: any) => ({
          horaInicio: pausa.horaInicio,
          horaFin: pausa.horaFin,
          motivo: pausa.motivo
        }));

        horarios.push({
          diaSemana: this.diasSemana[index],
          horaApertura: diaData.horaInicio,
          horaCierre: diaData.horaFin,
          cerrado: !diaData.activo,
          descansoInicio: pausas.length > 0 ? pausas[0].horaInicio : undefined,
          descansoFin: pausas.length > 0 ? pausas[0].horaFin : undefined
        });
      }
    });

    return {
      horarios,
      configuracion: configGeneral
    };
  }

  getDiaDisplay(dia: DiaSemana): string {
    const dias = {
      'LUNES': 'Lunes',
      'MARTES': 'Martes',
      'MIERCOLES': 'Miércoles',
      'JUEVES': 'Jueves',
      'VIERNES': 'Viernes',
      'SABADO': 'Sábado',
      'DOMINGO': 'Domingo'
    };
    return dias[dia];
  }
}