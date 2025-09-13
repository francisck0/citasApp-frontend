/**
 * Componente de Registro de Usuarios
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';

import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { UsuarioCreateDTO } from '../../interfaces/usuario-dtos.interface';
import { APP_CONFIG } from '../../config/app.config';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatStepperModule
  ],
  template: `
    <div class="registro-container">
      <div class="registro-wrapper">
        <mat-card class="registro-card">
          <mat-card-header>
            <div class="header-content">
              <img [src]="appConfig.app.logo" [alt]="appConfig.app.name" class="app-logo">
              <div>
                <mat-card-title>Crear Cuenta</mat-card-title>
                <mat-card-subtitle>Únete a {{ appConfig.app.name }} y encuentra los mejores servicios</mat-card-subtitle>
              </div>
            </div>
          </mat-card-header>

          <mat-card-content>
            <mat-stepper #stepper [linear]="true" orientation="vertical" class="registro-stepper">
              <!-- Paso 1: Información Básica -->
              <mat-step [stepControl]="informacionBasicaForm" label="Información Básica">
                <form [formGroup]="informacionBasicaForm" class="step-form">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Nombre</mat-label>
                      <input matInput formControlName="nombre" placeholder="Tu nombre">
                      <mat-icon matSuffix>person</mat-icon>
                      <mat-error *ngIf="informacionBasicaForm.get('nombre')?.hasError('required')">
                        El nombre es requerido
                      </mat-error>
                      <mat-error *ngIf="informacionBasicaForm.get('nombre')?.hasError('pattern')">
                        Solo se permiten letras y espacios
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Apellidos</mat-label>
                      <input matInput formControlName="apellidos" placeholder="Tus apellidos">
                      <mat-icon matSuffix>person</mat-icon>
                      <mat-error *ngIf="informacionBasicaForm.get('apellidos')?.hasError('required')">
                        Los apellidos son requeridos
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="form-field full-width">
                    <mat-label>Email</mat-label>
                    <input matInput formControlName="email" type="email" placeholder="tu@email.com">
                    <mat-icon matSuffix>email</mat-icon>
                    <mat-error *ngIf="informacionBasicaForm.get('email')?.hasError('required')">
                      El email es requerido
                    </mat-error>
                    <mat-error *ngIf="informacionBasicaForm.get('email')?.hasError('email')">
                      Ingresa un email válido
                    </mat-error>
                    <mat-error *ngIf="informacionBasicaForm.get('email')?.hasError('emailTaken')">
                      Este email ya está registrado
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="form-field full-width">
                    <mat-label>Teléfono</mat-label>
                    <input matInput formControlName="telefono" placeholder="+34 666 123 456">
                    <mat-icon matSuffix>phone</mat-icon>
                    <mat-error *ngIf="informacionBasicaForm.get('telefono')?.hasError('pattern')">
                      Formato de teléfono inválido
                    </mat-error>
                  </mat-form-field>

                  <div class="step-actions">
                    <button mat-raised-button color="primary" matStepperNext [disabled]="informacionBasicaForm.invalid">
                      Siguiente
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Paso 2: Contraseña -->
              <mat-step [stepControl]="passwordForm" label="Contraseña">
                <form [formGroup]="passwordForm" class="step-form">
                  <mat-form-field appearance="outline" class="form-field full-width">
                    <mat-label>Contraseña</mat-label>
                    <input
                      matInput
                      formControlName="password"
                      [type]="hidePassword ? 'password' : 'text'"
                      placeholder="Contraseña segura">
                    <button
                      mat-icon-button
                      matSuffix
                      (click)="hidePassword = !hidePassword"
                      type="button">
                      <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('password')?.hasError('required')">
                      La contraseña es requerida
                    </mat-error>
                    <mat-error *ngIf="passwordForm.get('password')?.hasError('minlength')">
                      Mínimo {{ appConfig.validation.password.minLength }} caracteres
                    </mat-error>
                    <mat-error *ngIf="passwordForm.get('password')?.hasError('pattern')">
                      {{ appConfig.validation.password.message }}
                    </mat-error>
                  </mat-form-field>

                  <!-- Indicador de Fortaleza de Contraseña -->
                  <div class="password-strength" *ngIf="passwordForm.get('password')?.value">
                    <div class="strength-label">Fortaleza de la contraseña:</div>
                    <mat-progress-bar
                      [value]="passwordStrength.puntuacion"
                      [color]="getPasswordStrengthColor()"
                      mode="determinate">
                    </mat-progress-bar>
                    <div class="strength-text" [ngClass]="'strength-' + getPasswordStrengthLevel()">
                      {{ getPasswordStrengthText() }}
                    </div>
                    <ul class="strength-requirements" *ngIf="passwordStrength.errores.length > 0">
                      <li *ngFor="let error of passwordStrength.errores" class="requirement-error">
                        {{ error }}
                      </li>
                    </ul>
                  </div>

                  <mat-form-field appearance="outline" class="form-field full-width">
                    <mat-label>Confirmar Contraseña</mat-label>
                    <input
                      matInput
                      formControlName="confirmarPassword"
                      [type]="hideConfirmPassword ? 'password' : 'text'"
                      placeholder="Confirma tu contraseña">
                    <button
                      mat-icon-button
                      matSuffix
                      (click)="hideConfirmPassword = !hideConfirmPassword"
                      type="button">
                      <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('confirmarPassword')?.hasError('required')">
                      Confirma tu contraseña
                    </mat-error>
                    <mat-error *ngIf="passwordForm.get('confirmarPassword')?.hasError('mismatch')">
                      Las contraseñas no coinciden
                    </mat-error>
                  </mat-form-field>

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>Anterior</button>
                    <button mat-raised-button color="primary" matStepperNext [disabled]="passwordForm.invalid">
                      Siguiente
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Paso 3: Información Personal (Opcional) -->
              <mat-step [stepControl]="informacionPersonalForm" label="Información Personal" optional>
                <form [formGroup]="informacionPersonalForm" class="step-form">
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

                  <div class="optional-notice">
                    <mat-icon>info</mat-icon>
                    <span>Esta información es opcional y nos ayuda a personalizar tu experiencia</span>
                  </div>

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>Anterior</button>
                    <button mat-raised-button color="primary" matStepperNext>
                      Siguiente
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Paso 4: Términos y Confirmación -->
              <mat-step [stepControl]="terminosForm" label="Términos y Condiciones">
                <form [formGroup]="terminosForm" class="step-form">
                  <div class="terms-section">
                    <h3>Términos y Condiciones</h3>
                    <div class="terms-content">
                      <p>Al crear una cuenta en {{ appConfig.app.name }}, aceptas nuestros términos de servicio y política de privacidad.</p>

                      <h4>Términos Principales:</h4>
                      <ul>
                        <li>Proporcionar información veraz y actualizada</li>
                        <li>Usar la plataforma de manera responsable</li>
                        <li>Respetar las políticas de cancelación de cada negocio</li>
                        <li>No crear múltiples cuentas</li>
                      </ul>

                      <h4>Protección de Datos:</h4>
                      <ul>
                        <li>Tus datos personales están protegidos según GDPR</li>
                        <li>No compartimos tu información con terceros sin consentimiento</li>
                        <li>Puedes solicitar la eliminación de tu cuenta en cualquier momento</li>
                      </ul>
                    </div>

                    <div class="checkboxes">
                      <mat-checkbox formControlName="aceptaTerminos" required>
                        He leído y acepto los
                        <a href="/terminos" target="_blank">Términos de Servicio</a>
                      </mat-checkbox>

                      <mat-checkbox formControlName="aceptaPrivacidad" required>
                        He leído y acepto la
                        <a href="/privacidad" target="_blank">Política de Privacidad</a>
                      </mat-checkbox>

                      <mat-checkbox formControlName="aceptaNotificaciones">
                        Acepto recibir notificaciones por email sobre mis citas
                      </mat-checkbox>

                      <mat-checkbox formControlName="aceptaMarketing">
                        Acepto recibir ofertas y promociones por email (opcional)
                      </mat-checkbox>
                    </div>
                  </div>

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>Anterior</button>
                    <button
                      mat-raised-button
                      color="primary"
                      [disabled]="terminosForm.invalid || loading"
                      (click)="registrar()">
                      <mat-icon *ngIf="loading">hourglass_empty</mat-icon>
                      {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
                    </button>
                  </div>
                </form>
              </mat-step>
            </mat-stepper>
          </mat-card-content>
        </mat-card>

        <!-- Enlaces adicionales -->
        <div class="additional-links">
          <p>
            ¿Ya tienes cuenta?
            <a routerLink="/login" class="login-link">Inicia sesión aquí</a>
          </p>

          <div class="help-links">
            <a href="/ayuda" target="_blank">Ayuda</a>
            <span>•</span>
            <a href="/contacto" target="_blank">Contacto</a>
            <span>•</span>
            <a href="/soporte" target="_blank">Soporte</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .registro-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .registro-wrapper {
      width: 100%;
      max-width: 600px;
    }

    .registro-card {
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      border-radius: 12px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
    }

    .app-logo {
      height: 48px;
      width: auto;
    }

    .registro-stepper {
      margin-top: 20px;
    }

    .step-form {
      margin-top: 16px;
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

    .step-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      justify-content: flex-end;
    }

    .password-strength {
      margin: 16px 0;
    }

    .strength-label {
      font-size: 14px;
      margin-bottom: 8px;
      color: #666;
    }

    .strength-text {
      font-size: 12px;
      margin-top: 4px;
      font-weight: 500;
    }

    .strength-weak { color: #f44336; }
    .strength-fair { color: #ff9800; }
    .strength-good { color: #2196f3; }
    .strength-strong { color: #4caf50; }

    .strength-requirements {
      margin: 8px 0;
      padding-left: 16px;
    }

    .requirement-error {
      font-size: 12px;
      color: #f44336;
      margin: 2px 0;
    }

    .optional-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: #e3f2fd;
      border-radius: 4px;
      margin: 16px 0;
      font-size: 14px;
      color: #1976d2;
    }

    .terms-section {
      max-width: 100%;
    }

    .terms-content {
      max-height: 200px;
      overflow-y: auto;
      padding: 16px;
      background-color: #f9f9f9;
      border-radius: 4px;
      margin: 16px 0;
      font-size: 14px;
      line-height: 1.5;
    }

    .terms-content h4 {
      margin: 16px 0 8px 0;
      color: #333;
      font-size: 16px;
    }

    .terms-content ul {
      margin: 8px 0 16px 16px;
    }

    .terms-content li {
      margin: 4px 0;
    }

    .checkboxes {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 16px 0;
    }

    .checkboxes a {
      color: #1976d2;
      text-decoration: none;
    }

    .checkboxes a:hover {
      text-decoration: underline;
    }

    .additional-links {
      text-align: center;
      margin-top: 24px;
      color: white;
    }

    .login-link {
      color: #fff;
      text-decoration: none;
      font-weight: 500;
    }

    .login-link:hover {
      text-decoration: underline;
    }

    .help-links {
      margin-top: 12px;
      font-size: 14px;
    }

    .help-links a {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      margin: 0 4px;
    }

    .help-links a:hover {
      color: white;
      text-decoration: underline;
    }

    .help-links span {
      color: rgba(255, 255, 255, 0.6);
      margin: 0 4px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .registro-container {
        padding: 16px;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }

      .step-actions {
        flex-direction: column;
      }

      .step-actions button {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .registro-container {
        padding: 8px;
      }

      .terms-content {
        max-height: 150px;
        padding: 12px;
      }
    }
  `]
})
export class RegistroComponent implements OnInit {
  informacionBasicaForm!: FormGroup;
  passwordForm!: FormGroup;
  informacionPersonalForm!: FormGroup;
  terminosForm!: FormGroup;

  hidePassword = true;
  hideConfirmPassword = true;
  loading = false;
  passwordStrength = { esValida: false, puntuacion: 0, errores: [] as string[] };
  appConfig = APP_CONFIG;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForms();
  }

  /**
   * Inicializa todos los formularios
   */
  private initializeForms(): void {
    this.informacionBasicaForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(APP_CONFIG.validation.name.pattern)
      ]],
      apellidos: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(APP_CONFIG.validation.name.pattern)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(APP_CONFIG.validation.email.pattern)
      ], [this.emailValidator.bind(this)]],
      telefono: ['', [
        Validators.pattern(APP_CONFIG.validation.phone.pattern)
      ]]
    });

    this.passwordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(APP_CONFIG.validation.password.minLength),
        this.passwordStrengthValidator.bind(this)
      ]],
      confirmarPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.informacionPersonalForm = this.fb.group({
      fechaNacimiento: [''],
      genero: ['']
    });

    this.terminosForm = this.fb.group({
      aceptaTerminos: [false, Validators.requiredTrue],
      aceptaPrivacidad: [false, Validators.requiredTrue],
      aceptaNotificaciones: [true],
      aceptaMarketing: [false]
    });

    // Escuchar cambios en la contraseña para validar fortaleza
    this.passwordForm.get('password')?.valueChanges.subscribe(password => {
      if (password) {
        this.passwordStrength = this.usuarioService.validarPassword(password);
      }
    });
  }

  /**
   * Validador asíncrono de email
   */
  private async emailValidator(control: AbstractControl): Promise<any> {
    if (!control.value || !APP_CONFIG.validation.email.pattern.test(control.value)) {
      return null;
    }

    try {
      const disponible = await this.usuarioService.verificarEmailDisponible(control.value).toPromise();
      return disponible ? null : { emailTaken: true };
    } catch (error) {
      return null; // En caso de error, no bloquear
    }
  }

  /**
   * Validador de fortaleza de contraseña
   */
  private passwordStrengthValidator(control: AbstractControl): any {
    if (!control.value) return null;

    const validation = this.usuarioService.validarPassword(control.value);
    return validation.esValida ? null : { weakPassword: true };
  }

  /**
   * Validador de coincidencia de contraseñas
   */
  private passwordMatchValidator(group: AbstractControl): any {
    const password = group.get('password')?.value;
    const confirmarPassword = group.get('confirmarPassword')?.value;

    if (password !== confirmarPassword) {
      group.get('confirmarPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
  }

  /**
   * Obtiene el color de la barra de fortaleza
   */
  getPasswordStrengthColor(): 'primary' | 'accent' | 'warn' {
    if (this.passwordStrength.puntuacion < 30) return 'warn';
    if (this.passwordStrength.puntuacion < 70) return 'accent';
    return 'primary';
  }

  /**
   * Obtiene el nivel de fortaleza
   */
  getPasswordStrengthLevel(): string {
    if (this.passwordStrength.puntuacion < 30) return 'weak';
    if (this.passwordStrength.puntuacion < 50) return 'fair';
    if (this.passwordStrength.puntuacion < 80) return 'good';
    return 'strong';
  }

  /**
   * Obtiene el texto de fortaleza
   */
  getPasswordStrengthText(): string {
    const level = this.getPasswordStrengthLevel();
    switch (level) {
      case 'weak': return 'Débil';
      case 'fair': return 'Regular';
      case 'good': return 'Buena';
      case 'strong': return 'Fuerte';
      default: return '';
    }
  }

  /**
   * Registra al usuario
   */
  async registrar(): Promise<void> {
    if (this.loading) return;

    // Validar todos los formularios
    if (!this.informacionBasicaForm.valid || !this.passwordForm.valid || !this.terminosForm.valid) {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading = true;

    try {
      // Preparar datos de registro
      const datosRegistro: UsuarioCreateDTO = {
        email: this.informacionBasicaForm.get('email')?.value,
        password: this.passwordForm.get('password')?.value,
        nombre: this.informacionBasicaForm.get('nombre')?.value,
        apellidos: this.informacionBasicaForm.get('apellidos')?.value,
        telefono: this.informacionBasicaForm.get('telefono')?.value || undefined,
        fechaNacimiento: this.informacionPersonalForm.get('fechaNacimiento')?.value?.toISOString().split('T')[0] || undefined,
        genero: this.informacionPersonalForm.get('genero')?.value || undefined
      };

      // Registrar usuario
      const usuario = await this.usuarioService.registrar(datosRegistro).toPromise();

      if (usuario) {
        this.snackBar.open('¡Cuenta creada exitosamente! Por favor verifica tu email.', 'Cerrar', {
          duration: 8000,
          panelClass: ['success-snackbar']
        });

        // Redirigir a login o página de verificación
        this.router.navigate(['/login'], {
          queryParams: {
            email: datosRegistro.email,
            message: 'Por favor verifica tu email antes de iniciar sesión'
          }
        });
      }
    } catch (error: any) {
      console.error('Error en registro:', error);

      let errorMessage = 'Error al crear la cuenta. Inténtalo de nuevo.';

      if (error.message) {
        errorMessage = error.message;
      }

      this.snackBar.open(errorMessage, 'Cerrar', {
        duration: 8000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading = false;
    }
  }
}