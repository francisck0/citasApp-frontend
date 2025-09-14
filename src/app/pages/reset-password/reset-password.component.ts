/**
 * Componente para restablecer contraseña
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { FormErrorService } from '../../services/form-error.service';
import { CustomValidators } from '../../validators/custom-validators';
import { FormFieldErrorComponent } from '../../components/form-field-error/form-field-error.component';
import { ResponsiveService } from '../../services/responsive.service';
import { RESPONSIVE_DIRECTIVES } from '../../directives/responsive.directive';

// Validador para confirmar password
function confirmPasswordValidator(formGroup: FormGroup) {
  const password = formGroup.get('password')?.value;
  const confirmPassword = formGroup.get('confirmPassword')?.value;

  if (password !== confirmPassword) {
    formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
  } else {
    const confirmControl = formGroup.get('confirmPassword');
    if (confirmControl?.hasError('passwordMismatch')) {
      delete confirmControl.errors?.['passwordMismatch'];
      if (Object.keys(confirmControl.errors || {}).length === 0) {
        confirmControl.setErrors(null);
      }
    }
  }

  return null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormFieldErrorComponent
  ],
  template: `
    <div class="reset-password-container">
      <div class="reset-password-card">
        <mat-card>
          <mat-card-header>
            <div class="header-content">
              <mat-icon class="header-icon">lock_open</mat-icon>
              <mat-card-title>Restablecer contraseña</mat-card-title>
              <mat-card-subtitle>
                Ingresa tu nueva contraseña
              </mat-card-subtitle>
            </div>
          </mat-card-header>

          <mat-card-content>
            <!-- Loading state mientras se valida el token -->
            <div *ngIf="validatingToken" class="loading-state">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Validando enlace...</p>
            </div>

            <!-- Token inválido o expirado -->
            <div *ngIf="tokenInvalid" class="error-state">
              <mat-icon class="error-icon">error</mat-icon>
              <h3>Enlace inválido o expirado</h3>
              <p>
                El enlace de restablecimiento no es válido o ha expirado.
                Por favor, solicita un nuevo enlace.
              </p>
              <button
                mat-raised-button
                color="primary"
                routerLink="/forgot-password"
                class="full-width"
              >
                Solicitar nuevo enlace
              </button>
            </div>

            <!-- Formulario de reset -->
            <form
              *ngIf="!validatingToken && !tokenInvalid && !resetComplete"
              [formGroup]="resetForm"
              (ngSubmit)="onSubmit()"
            >
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nueva contraseña</mat-label>
                <input
                  matInput
                  [type]="hidePassword ? 'password' : 'text'"
                  formControlName="password"
                  placeholder="Ingresa tu nueva contraseña"
                >
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="hidePassword = !hidePassword"
                  [attr.aria-label]="'Hide password'"
                  [attr.aria-pressed]="hidePassword"
                >
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>

                <app-form-field-error
                  [control]="resetForm.get('password')!"
                  fieldName="password"
                  [showPasswordStrength]="true"
                  [showChecklist]="true">
                </app-form-field-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirmar contraseña</mat-label>
                <input
                  matInput
                  [type]="hideConfirmPassword ? 'password' : 'text'"
                  formControlName="confirmPassword"
                  placeholder="Confirma tu nueva contraseña"
                >
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="hideConfirmPassword = !hideConfirmPassword"
                  [attr.aria-label]="'Hide password'"
                  [attr.aria-pressed]="hideConfirmPassword"
                >
                  <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>

                <app-form-field-error
                  [control]="resetForm.get('confirmPassword')!"
                  fieldName="confirmPassword">
                </app-form-field-error>
              </mat-form-field>

              <div class="form-actions">
                <button
                  mat-raised-button
                  color="primary"
                  type="submit"
                  class="full-width"
                  [disabled]="resetForm.invalid || loading"
                >
                  <mat-spinner *ngIf="loading" diameter="20" class="spinner"></mat-spinner>
                  <span *ngIf="!loading">Restablecer contraseña</span>
                  <span *ngIf="loading">Procesando...</span>
                </button>
              </div>
            </form>

            <!-- Confirmación de reset exitoso -->
            <div *ngIf="resetComplete" class="success-state">
              <mat-icon class="success-icon">check_circle</mat-icon>
              <h3>¡Contraseña restablecida!</h3>
              <p>
                Tu contraseña ha sido actualizada correctamente.
                Ahora puedes iniciar sesión con tu nueva contraseña.
              </p>
              <button
                mat-raised-button
                color="primary"
                routerLink="/login"
                class="full-width"
              >
                Ir al login
              </button>
            </div>
          </mat-card-content>

          <mat-card-actions class="card-actions" *ngIf="!resetComplete">
            <button mat-button routerLink="/login" class="back-button">
              <mat-icon>arrow_back</mat-icon>
              Volver al login
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .reset-password-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .reset-password-card {
      width: 100%;
      max-width: 480px;
    }

    mat-card {
      padding: 0;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    mat-card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 24px;
      border-radius: 12px 12px 0 0;
    }

    .header-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      width: 100%;
    }

    .header-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    mat-card-title {
      color: white !important;
      font-size: 24px;
      font-weight: 500;
      margin-bottom: 8px;
    }

    mat-card-subtitle {
      color: rgba(255, 255, 255, 0.8) !important;
      font-size: 14px;
    }

    mat-card-content {
      padding: 32px 24px;
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      margin-bottom: 16px;
    }

    .form-actions {
      margin-top: 24px;
    }

    .loading-state,
    .error-state,
    .success-state {
      text-align: center;
      padding: 20px 0;
    }

    .loading-state p {
      margin-top: 16px;
      color: #666;
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
      margin-bottom: 16px;
    }

    .success-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #4caf50;
      margin-bottom: 16px;
    }

    .error-state h3 {
      color: #f44336;
      margin: 0 0 16px 0;
      font-size: 24px;
    }

    .success-state h3 {
      color: #4caf50;
      margin: 0 0 16px 0;
      font-size: 24px;
    }

    .error-state p,
    .success-state p {
      margin: 8px 0 24px 0;
      color: #666;
      line-height: 1.5;
    }

    .password-requirements {
      margin-top: 8px;
    }

    .password-requirements p {
      margin-bottom: 8px;
      font-weight: 500;
    }

    .password-requirements ul {
      margin: 0;
      padding-left: 16px;
      list-style: none;
    }

    .password-requirements li {
      margin: 4px 0;
      color: #f44336;
      font-size: 12px;
      position: relative;
    }

    .password-requirements li:before {
      content: '✗';
      margin-right: 8px;
      font-weight: bold;
    }

    .password-requirements li.valid {
      color: #4caf50;
    }

    .password-requirements li.valid:before {
      content: '✓';
    }

    .card-actions {
      padding: 16px 24px 24px;
      justify-content: center;
    }

    .back-button {
      color: #666;
    }

    .spinner {
      margin-right: 8px;
    }

    mat-error {
      font-size: 12px;
    }

    button:disabled {
      opacity: 0.6;
    }

    @media (max-width: 480px) {
      .reset-password-container {
        padding: 16px;
      }

      mat-card-header {
        padding: 24px 20px;
      }

      mat-card-content {
        padding: 24px 20px;
      }

      .header-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
      }

      mat-card-title {
        font-size: 20px;
      }
    }
  `]
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  resetForm: FormGroup;
  loading = false;
  validatingToken = true;
  tokenInvalid = false;
  resetComplete = false;
  hidePassword = true;
  hideConfirmPassword = true;
  private resetToken = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private loadingService: LoadingService,
    private formErrorService: FormErrorService
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, CustomValidators.password()]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: CustomValidators.confirmPassword('password', 'confirmPassword')
    });
  }

  ngOnInit(): void {
    // Si el usuario ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Obtener token de la URL
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.resetToken = params.get('token') || '';
        if (this.resetToken) {
          this.validateToken();
        } else {
          this.tokenInvalid = true;
          this.validatingToken = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private validateToken(): void {
    this.authService.validateResetToken(this.resetToken)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.validatingToken = false;
          this.tokenInvalid = false;
        },
        error: (error) => {
          this.validatingToken = false;
          this.tokenInvalid = true;

          let message = 'El enlace de restablecimiento no es válido';
          if (error.status === 404 || error.status === 410) {
            message = 'El enlace de restablecimiento ha expirado';
          }

          this.snackBar.open(message, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  onSubmit(): void {
    if (this.resetForm.valid && !this.loading) {
      this.loading = true;
      const password = this.resetForm.get('password')?.value;

      this.authService.resetPassword(this.resetToken, password)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.loading = false;
            this.resetComplete = true;
            this.snackBar.open(
              'Contraseña restablecida correctamente',
              'Cerrar',
              { duration: 5000, panelClass: ['success-snackbar'] }
            );
          },
          error: (error) => {
            this.loading = false;
            let message = 'Error al restablecer la contraseña';

            if (error.status === 400) {
              message = 'Los datos proporcionados no son válidos';
            } else if (error.status === 404 || error.status === 410) {
              message = 'El enlace de restablecimiento ha expirado';
              this.tokenInvalid = true;
            } else if (error.message) {
              message = error.message;
            }

            this.snackBar.open(message, 'Cerrar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }
}