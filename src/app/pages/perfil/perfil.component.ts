/**
 * Componente de Perfil de Usuario Editable
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { UsuarioUpdateDTO, NotificacionesPreferenciasDTO, ContactoEmergenciaDTO } from '../../interfaces/usuario-dtos.interface';
import { APP_CONFIG } from '../../config/app.config';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="perfil-container">
      <!-- Loading State -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner></mat-spinner>
        <p>Cargando perfil...</p>
      </div>

      <!-- Header del Perfil -->
      <div class="perfil-header" *ngIf="!loading && usuario">
        <div class="avatar-section">
          <div class="avatar-container" (click)="fileInput.click()">
            <img
              *ngIf="usuario.foto; else defaultAvatar"
              [src]="usuario.foto"
              [alt]="usuario.nombreCompleto"
              class="user-avatar">
            <ng-template #defaultAvatar>
              <div class="avatar-placeholder">
                {{ usuario.iniciales }}
              </div>
            </ng-template>
            <div class="avatar-overlay">
              <mat-icon>photo_camera</mat-icon>
            </div>
          </div>
          <input
            #fileInput
            type="file"
            accept="image/*"
            (change)="onFileSelected($event)"
            style="display: none">
        </div>

        <div class="user-info">
          <h1>{{ usuario.nombreCompleto }}</h1>
          <p class="email">{{ usuario.email }}</p>
          <div class="user-badges">
            <mat-chip [color]="getStatusColor()" selected>
              {{ usuario.estadoDisplay }}
            </mat-chip>
            <mat-chip>{{ usuario.generoDisplay }}</mat-chip>
            <mat-chip *ngIf="usuario.edad">{{ usuario.edad }} años</mat-chip>
          </div>
          <p class="member-since">
            Miembro desde {{ usuario.fechaRegistroFormateada }}
          </p>
        </div>
      </div>

      <!-- Contenido en Tabs -->
      <mat-tab-group class="perfil-tabs" *ngIf="!loading">
        <!-- Tab: Información Personal -->
        <mat-tab label="Información Personal">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>person</mat-icon>
                  Información Personal
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="informacionPersonalForm" (ngSubmit)="guardarInformacionPersonal()">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Nombre</mat-label>
                      <input matInput formControlName="nombre">
                      <mat-icon matSuffix>person</mat-icon>
                      <mat-error *ngIf="informacionPersonalForm.get('nombre')?.hasError('required')">
                        El nombre es requerido
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Apellidos</mat-label>
                      <input matInput formControlName="apellidos">
                      <mat-icon matSuffix>person</mat-icon>
                      <mat-error *ngIf="informacionPersonalForm.get('apellidos')?.hasError('required')">
                        Los apellidos son requeridos
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="form-field full-width">
                    <mat-label>Email</mat-label>
                    <input matInput formControlName="email" type="email" readonly>
                    <mat-icon matSuffix>email</mat-icon>
                    <mat-hint>El email no se puede cambiar</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="form-field full-width">
                    <mat-label>Teléfono</mat-label>
                    <input matInput formControlName="telefono">
                    <mat-icon matSuffix>phone</mat-icon>
                    <mat-error *ngIf="informacionPersonalForm.get('telefono')?.hasError('pattern')">
                      Formato de teléfono inválido
                    </mat-error>
                  </mat-form-field>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Fecha de Nacimiento</mat-label>
                      <input matInput [matDatepicker]="picker" formControlName="fechaNacimiento">
                      <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                      <mat-datepicker #picker></mat-datepicker>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Género</mat-label>
                      <mat-select formControlName="genero">
                        <mat-option value="MASCULINO">Masculino</mat-option>
                        <mat-option value="FEMENINO">Femenino</mat-option>
                        <mat-option value="OTRO">Otro</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="form-actions">
                    <button
                      mat-raised-button
                      color="primary"
                      type="submit"
                      [disabled]="informacionPersonalForm.invalid || guardandoPersonal">
                      <mat-icon *ngIf="guardandoPersonal">hourglass_empty</mat-icon>
                      {{ guardandoPersonal ? 'Guardando...' : 'Guardar Cambios' }}
                    </button>
                    <button
                      mat-button
                      type="button"
                      (click)="resetearInformacionPersonal()">
                      Cancelar
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Tab: Información Adicional -->
        <mat-tab label="Preferencias">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>settings</mat-icon>
                  Preferencias y Observaciones
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="informacionAdicionalForm" (ngSubmit)="guardarInformacionAdicional()">
                  <mat-form-field appearance="outline" class="form-field full-width">
                    <mat-label>Preferencias de Servicio</mat-label>
                    <textarea
                      matInput
                      formControlName="preferencias"
                      rows="3"
                      placeholder="Describe tus preferencias para los servicios...">
                    </textarea>
                    <mat-icon matSuffix>favorite</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="form-field full-width">
                    <mat-label>Comentarios Especiales</mat-label>
                    <textarea
                      matInput
                      formControlName="comentarios"
                      rows="3"
                      placeholder="Comentarios adicionales...">
                    </textarea>
                    <mat-icon matSuffix>comment</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="form-field full-width">
                    <mat-label>Observaciones</mat-label>
                    <textarea
                      matInput
                      formControlName="observaciones"
                      rows="3"
                      placeholder="Observaciones importantes...">
                    </textarea>
                    <mat-icon matSuffix>note</mat-icon>
                  </mat-form-field>

                  <div class="form-actions">
                    <button
                      mat-raised-button
                      color="primary"
                      type="submit"
                      [disabled]="guardandoAdicional">
                      <mat-icon *ngIf="guardandoAdicional">hourglass_empty</mat-icon>
                      {{ guardandoAdicional ? 'Guardando...' : 'Guardar Preferencias' }}
                    </button>
                    <button
                      mat-button
                      type="button"
                      (click)="resetearInformacionAdicional()">
                      Cancelar
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Tab: Contacto de Emergencia -->
        <mat-tab label="Contacto de Emergencia">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>contact_phone</mat-icon>
                  Contacto de Emergencia
                </mat-card-title>
                <mat-card-subtitle>
                  Información de contacto en caso de emergencia
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="contactoEmergenciaForm" (ngSubmit)="guardarContactoEmergencia()">
                  <mat-form-field appearance="outline" class="form-field full-width">
                    <mat-label>Nombre Completo</mat-label>
                    <input matInput formControlName="nombre">
                    <mat-icon matSuffix>person</mat-icon>
                    <mat-error *ngIf="contactoEmergenciaForm.get('nombre')?.hasError('required')">
                      El nombre es requerido
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="form-field full-width">
                    <mat-label>Teléfono</mat-label>
                    <input matInput formControlName="telefono">
                    <mat-icon matSuffix>phone</mat-icon>
                    <mat-error *ngIf="contactoEmergenciaForm.get('telefono')?.hasError('required')">
                      El teléfono es requerido
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="form-field full-width">
                    <mat-label>Relación</mat-label>
                    <mat-select formControlName="relacion">
                      <mat-option value="PADRE">Padre</mat-option>
                      <mat-option value="MADRE">Madre</mat-option>
                      <mat-option value="HERMANO">Hermano/a</mat-option>
                      <mat-option value="CONYUGE">Cónyuge</mat-option>
                      <mat-option value="HIJO">Hijo/a</mat-option>
                      <mat-option value="AMIGO">Amigo/a</mat-option>
                      <mat-option value="OTRO">Otro</mat-option>
                    </mat-select>
                    <mat-error *ngIf="contactoEmergenciaForm.get('relacion')?.hasError('required')">
                      La relación es requerida
                    </mat-error>
                  </mat-form-field>

                  <div class="form-actions">
                    <button
                      mat-raised-button
                      color="primary"
                      type="submit"
                      [disabled]="contactoEmergenciaForm.invalid || guardandoContacto">
                      <mat-icon *ngIf="guardandoContacto">hourglass_empty</mat-icon>
                      {{ guardandoContacto ? 'Guardando...' : 'Guardar Contacto' }}
                    </button>
                    <button
                      mat-button
                      type="button"
                      (click)="resetearContactoEmergencia()">
                      Cancelar
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Tab: Notificaciones -->
        <mat-tab label="Notificaciones">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>notifications</mat-icon>
                  Preferencias de Notificaciones
                </mat-card-title>
                <mat-card-subtitle>
                  Configura cómo quieres recibir notificaciones
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="notificacionesForm" (ngSubmit)="guardarNotificaciones()">
                  <div class="checkbox-group">
                    <mat-checkbox formControlName="email">
                      Notificaciones por email
                      <span class="checkbox-description">Recibir notificaciones generales por correo electrónico</span>
                    </mat-checkbox>

                    <mat-checkbox formControlName="sms">
                      Notificaciones por SMS
                      <span class="checkbox-description">Recibir notificaciones urgentes por mensaje de texto</span>
                    </mat-checkbox>

                    <mat-checkbox formControlName="recordatoriosCitas">
                      Recordatorios de citas
                      <span class="checkbox-description">Recibir recordatorios antes de tus citas programadas</span>
                    </mat-checkbox>

                    <mat-checkbox formControlName="promociones">
                      Ofertas y promociones
                      <span class="checkbox-description">Recibir información sobre ofertas especiales y descuentos</span>
                    </mat-checkbox>

                    <mat-checkbox formControlName="newsletter">
                      Boletín informativo
                      <span class="checkbox-description">Recibir nuestro boletín con noticias y consejos</span>
                    </mat-checkbox>
                  </div>

                  <div class="form-actions">
                    <button
                      mat-raised-button
                      color="primary"
                      type="submit"
                      [disabled]="guardandoNotificaciones">
                      <mat-icon *ngIf="guardandoNotificaciones">hourglass_empty</mat-icon>
                      {{ guardandoNotificaciones ? 'Guardando...' : 'Guardar Preferencias' }}
                    </button>
                    <button
                      mat-button
                      type="button"
                      (click)="resetearNotificaciones()">
                      Cancelar
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Tab: Seguridad -->
        <mat-tab label="Seguridad">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>security</mat-icon>
                  Cambiar Contraseña
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="passwordForm" (ngSubmit)="cambiarPassword()">
                  <mat-form-field appearance="outline" class="form-field full-width">
                    <mat-label>Contraseña Actual</mat-label>
                    <input
                      matInput
                      formControlName="passwordActual"
                      [type]="hideCurrentPassword ? 'password' : 'text'">
                    <button
                      mat-icon-button
                      matSuffix
                      (click)="hideCurrentPassword = !hideCurrentPassword"
                      type="button">
                      <mat-icon>{{ hideCurrentPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('passwordActual')?.hasError('required')">
                      La contraseña actual es requerida
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="form-field full-width">
                    <mat-label>Nueva Contraseña</mat-label>
                    <input
                      matInput
                      formControlName="passwordNueva"
                      [type]="hideNewPassword ? 'password' : 'text'">
                    <button
                      mat-icon-button
                      matSuffix
                      (click)="hideNewPassword = !hideNewPassword"
                      type="button">
                      <mat-icon>{{ hideNewPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('passwordNueva')?.hasError('required')">
                      La nueva contraseña es requerida
                    </mat-error>
                    <mat-error *ngIf="passwordForm.get('passwordNueva')?.hasError('minlength')">
                      Mínimo {{ appConfig.validation.password.minLength }} caracteres
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="form-field full-width">
                    <mat-label>Confirmar Nueva Contraseña</mat-label>
                    <input
                      matInput
                      formControlName="confirmarPassword"
                      [type]="hideConfirmPassword ? 'password' : 'text'">
                    <button
                      mat-icon-button
                      matSuffix
                      (click)="hideConfirmPassword = !hideConfirmPassword"
                      type="button">
                      <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('confirmarPassword')?.hasError('required')">
                      Confirma la nueva contraseña
                    </mat-error>
                    <mat-error *ngIf="passwordForm.get('confirmarPassword')?.hasError('mismatch')">
                      Las contraseñas no coinciden
                    </mat-error>
                  </mat-form-field>

                  <div class="form-actions">
                    <button
                      mat-raised-button
                      color="warn"
                      type="submit"
                      [disabled]="passwordForm.invalid || cambiandoPassword">
                      <mat-icon *ngIf="cambiandoPassword">hourglass_empty</mat-icon>
                      {{ cambiandoPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
                    </button>
                    <button
                      mat-button
                      type="button"
                      (click)="resetearPassword()">
                      Cancelar
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>

            <mat-divider></mat-divider>

            <mat-card class="danger-zone">
              <mat-card-header>
                <mat-card-title class="danger-title">
                  <mat-icon>warning</mat-icon>
                  Zona de Peligro
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p>Las siguientes acciones son irreversibles. Úsalas con precaución.</p>

                <div class="danger-actions">
                  <button
                    mat-stroked-button
                    color="warn"
                    (click)="solicitarEliminacionCuenta()">
                    <mat-icon>delete_forever</mat-icon>
                    Eliminar Cuenta
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .perfil-container {
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .perfil-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px;
      border-radius: 16px;
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      gap: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .avatar-section {
      position: relative;
    }

    .avatar-container {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      position: relative;
      transition: transform 0.2s;
    }

    .avatar-container:hover {
      transform: scale(1.05);
    }

    .user-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 500;
    }

    .avatar-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .avatar-container:hover .avatar-overlay {
      opacity: 1;
    }

    .user-info h1 {
      margin: 0 0 8px 0;
      font-size: 2.5rem;
      font-weight: 500;
    }

    .email {
      margin: 0 0 16px 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .user-badges {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .member-since {
      margin: 0;
      opacity: 0.8;
      font-size: 0.9rem;
    }

    .perfil-tabs {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .tab-content {
      padding: 0;
    }

    .tab-content mat-card {
      margin: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .tab-content mat-card-header {
      background-color: #fafafa;
      border-radius: 12px 12px 0 0;
      padding: 24px;
    }

    .tab-content mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      justify-content: flex-end;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .checkbox-group mat-checkbox {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .checkbox-description {
      font-size: 0.85rem;
      color: #666;
      margin-top: 4px;
      display: block;
    }

    .danger-zone {
      margin-top: 24px;
      border: 2px solid #f44336;
    }

    .danger-zone mat-card-header {
      background-color: #ffebee;
    }

    .danger-title {
      color: #f44336;
    }

    .danger-actions {
      margin-top: 16px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .perfil-container {
        padding: 16px;
      }

      .perfil-header {
        flex-direction: column;
        text-align: center;
        gap: 20px;
        padding: 24px;
      }

      .user-info h1 {
        font-size: 2rem;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .tab-content mat-card {
        margin: 16px;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions button {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .avatar-container {
        width: 80px;
        height: 80px;
      }

      .avatar-placeholder {
        font-size: 24px;
      }

      .user-info h1 {
        font-size: 1.5rem;
      }

      .user-badges {
        justify-content: center;
      }
    }
  `]
})
export class PerfilComponent implements OnInit, OnDestroy {
  usuario: Usuario | null = null;
  loading = true;

  // Formularios
  informacionPersonalForm!: FormGroup;
  informacionAdicionalForm!: FormGroup;
  contactoEmergenciaForm!: FormGroup;
  notificacionesForm!: FormGroup;
  passwordForm!: FormGroup;

  // Estados de carga
  guardandoPersonal = false;
  guardandoAdicional = false;
  guardandoContacto = false;
  guardandoNotificaciones = false;
  cambiandoPassword = false;

  // Estados de visibilidad de contraseñas
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  // Configuración
  appConfig = APP_CONFIG;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.cargarDatosUsuario();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa todos los formularios
   */
  private initializeForms(): void {
    this.informacionPersonalForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: [{value: '', disabled: true}],
      telefono: ['', [Validators.pattern(APP_CONFIG.validation.phone.pattern)]],
      fechaNacimiento: [''],
      genero: ['']
    });

    this.informacionAdicionalForm = this.fb.group({
      preferencias: [''],
      comentarios: [''],
      observaciones: ['']
    });

    this.contactoEmergenciaForm = this.fb.group({
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      relacion: ['', Validators.required]
    });

    this.notificacionesForm = this.fb.group({
      email: [true],
      sms: [false],
      recordatoriosCitas: [true],
      promociones: [false],
      newsletter: [false]
    });

    this.passwordForm = this.fb.group({
      passwordActual: ['', Validators.required],
      passwordNueva: ['', [
        Validators.required,
        Validators.minLength(APP_CONFIG.validation.password.minLength)
      ]],
      confirmarPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Carga los datos del usuario
   */
  private cargarDatosUsuario(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.usuario = user;
        if (user) {
          this.cargarPerfilCompleto();
        }
      });
  }

  /**
   * Carga el perfil completo del usuario
   */
  private cargarPerfilCompleto(): void {
    this.usuarioService.obtenerPerfil()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (usuario) => {
          this.usuario = usuario;
          this.llenarFormularios();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando perfil:', error);
          this.mostrarError('Error al cargar el perfil');
          this.loading = false;
        }
      });
  }

  /**
   * Llena los formularios con los datos del usuario
   */
  private llenarFormularios(): void {
    if (!this.usuario) return;

    // Información personal
    this.informacionPersonalForm.patchValue({
      nombre: this.usuario.nombre,
      apellidos: this.usuario.apellidos,
      email: this.usuario.email,
      telefono: this.usuario.telefono,
      fechaNacimiento: this.usuario.fechaNacimiento,
      genero: this.usuario.genero
    });

    // Información adicional
    this.informacionAdicionalForm.patchValue({
      preferencias: this.usuario.preferencias,
      comentarios: this.usuario.comentarios,
      observaciones: this.usuario.observaciones
    });

    // Contacto de emergencia
    if (this.usuario.contactoEmergencia) {
      this.contactoEmergenciaForm.patchValue(this.usuario.contactoEmergencia);
    }

    // Notificaciones
    this.notificacionesForm.patchValue(this.usuario.notificaciones);
  }

  /**
   * Validador de coincidencia de contraseñas
   */
  private passwordMatchValidator(group: FormGroup): any {
    const nueva = group.get('passwordNueva')?.value;
    const confirmar = group.get('confirmarPassword')?.value;

    if (nueva !== confirmar) {
      group.get('confirmarPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
  }

  /**
   * Obtiene el color del estado del usuario
   */
  getStatusColor(): 'primary' | 'accent' | 'warn' | undefined {
    if (!this.usuario) return undefined;

    switch (this.usuario.estado) {
      case 'ACTIVO':
        return 'primary';
      case 'SUSPENDIDO':
        return 'warn';
      default:
        return 'accent';
    }
  }

  /**
   * Maneja la selección de archivo para la foto de perfil
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      this.mostrarError('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño
    if (file.size > APP_CONFIG.files.maxSize) {
      this.mostrarError('El archivo es demasiado grande. Máximo 5MB');
      return;
    }

    // Subir archivo
    this.usuarioService.subirFotoPerfil(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (url) => {
          if (this.usuario) {
            this.usuario.foto = url;
          }
          this.mostrarExito('Foto de perfil actualizada');
        },
        error: (error) => {
          console.error('Error subiendo foto:', error);
          this.mostrarError('Error al subir la foto');
        }
      });
  }

  /**
   * Guarda la información personal
   */
  guardarInformacionPersonal(): void {
    if (this.informacionPersonalForm.invalid || this.guardandoPersonal) return;

    this.guardandoPersonal = true;

    const datos: UsuarioUpdateDTO = {
      nombre: this.informacionPersonalForm.get('nombre')?.value,
      apellidos: this.informacionPersonalForm.get('apellidos')?.value,
      telefono: this.informacionPersonalForm.get('telefono')?.value,
      fechaNacimiento: this.informacionPersonalForm.get('fechaNacimiento')?.value?.toISOString().split('T')[0],
      genero: this.informacionPersonalForm.get('genero')?.value
    };

    this.usuarioService.actualizarPerfil(datos)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (usuario) => {
          this.usuario = usuario;
          this.mostrarExito('Información personal actualizada');
          this.guardandoPersonal = false;
        },
        error: (error) => {
          console.error('Error guardando información personal:', error);
          this.mostrarError('Error al guardar la información');
          this.guardandoPersonal = false;
        }
      });
  }

  /**
   * Guarda la información adicional
   */
  guardarInformacionAdicional(): void {
    if (this.guardandoAdicional) return;

    this.guardandoAdicional = true;

    const datos = {
      preferencias: this.informacionAdicionalForm.get('preferencias')?.value,
      comentarios: this.informacionAdicionalForm.get('comentarios')?.value,
      observaciones: this.informacionAdicionalForm.get('observaciones')?.value
    };

    this.usuarioService.actualizarInformacionAdicional(datos)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (usuario) => {
          this.usuario = usuario;
          this.mostrarExito('Preferencias actualizadas');
          this.guardandoAdicional = false;
        },
        error: (error) => {
          console.error('Error guardando información adicional:', error);
          this.mostrarError('Error al guardar las preferencias');
          this.guardandoAdicional = false;
        }
      });
  }

  /**
   * Guarda el contacto de emergencia
   */
  guardarContactoEmergencia(): void {
    if (this.contactoEmergenciaForm.invalid || this.guardandoContacto) return;

    this.guardandoContacto = true;

    const contacto: ContactoEmergenciaDTO = this.contactoEmergenciaForm.value;

    this.usuarioService.actualizarInformacionAdicional({ contactoEmergencia: contacto })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (usuario) => {
          this.usuario = usuario;
          this.mostrarExito('Contacto de emergencia guardado');
          this.guardandoContacto = false;
        },
        error: (error) => {
          console.error('Error guardando contacto de emergencia:', error);
          this.mostrarError('Error al guardar el contacto');
          this.guardandoContacto = false;
        }
      });
  }

  /**
   * Guarda las preferencias de notificaciones
   */
  guardarNotificaciones(): void {
    if (this.guardandoNotificaciones) return;

    this.guardandoNotificaciones = true;

    const preferencias: NotificacionesPreferenciasDTO = this.notificacionesForm.value;

    this.usuarioService.actualizarPreferenciasNotificaciones(preferencias)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.mostrarExito('Preferencias de notificaciones guardadas');
          this.guardandoNotificaciones = false;
        },
        error: (error) => {
          console.error('Error guardando notificaciones:', error);
          this.mostrarError('Error al guardar las preferencias');
          this.guardandoNotificaciones = false;
        }
      });
  }

  /**
   * Cambia la contraseña
   */
  cambiarPassword(): void {
    if (this.passwordForm.invalid || this.cambiandoPassword) return;

    this.cambiandoPassword = true;

    const datos = {
      passwordActual: this.passwordForm.get('passwordActual')?.value,
      passwordNueva: this.passwordForm.get('passwordNueva')?.value,
      confirmarPassword: this.passwordForm.get('confirmarPassword')?.value
    };

    this.usuarioService.cambiarPassword(datos)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.mostrarExito('Contraseña cambiada exitosamente');
          this.passwordForm.reset();
          this.cambiandoPassword = false;
        },
        error: (error) => {
          console.error('Error cambiando contraseña:', error);
          this.mostrarError('Error al cambiar la contraseña');
          this.cambiandoPassword = false;
        }
      });
  }

  /**
   * Solicita la eliminación de la cuenta
   */
  solicitarEliminacionCuenta(): void {
    const confirmacion = confirm(
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.'
    );

    if (confirmacion) {
      this.usuarioService.solicitarEliminacionCuenta()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.mostrarExito('Solicitud de eliminación enviada. Revisa tu email.');
          },
          error: (error) => {
            console.error('Error solicitando eliminación:', error);
            this.mostrarError('Error al solicitar la eliminación');
          }
        });
    }
  }

  // Métodos de reset
  resetearInformacionPersonal(): void {
    this.llenarFormularios();
  }

  resetearInformacionAdicional(): void {
    this.llenarFormularios();
  }

  resetearContactoEmergencia(): void {
    this.llenarFormularios();
  }

  resetearNotificaciones(): void {
    this.llenarFormularios();
  }

  resetearPassword(): void {
    this.passwordForm.reset();
  }

  // Métodos de utilidad
  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 8000,
      panelClass: ['error-snackbar']
    });
  }
}