/**
 * Componente para solicitar reset de contraseña
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { FormErrorService } from '../../services/form-error.service';
import { CustomValidators } from '../../validators/custom-validators';
import { FormFieldErrorComponent } from '../../components/form-field-error/form-field-error.component';
import { ResponsiveService } from '../../services/responsive.service';
import { RESPONSIVE_DIRECTIVES } from '../../directives/responsive.directive';

@Component({
  selector: 'app-forgot-password',
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
    FormFieldErrorComponent,
    ...RESPONSIVE_DIRECTIVES
  ],
  template: `
    <div class="forgot-password-container">
      <div class="forgot-password-card">
        <mat-card>
          <mat-card-header>
            <div class="header-content">
              <mat-icon class="header-icon">lock_reset</mat-icon>
              <mat-card-title>¿Olvidaste tu contraseña?</mat-card-title>
              <mat-card-subtitle>
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
              </mat-card-subtitle>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" *ngIf="!emailSent">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Correo electrónico</mat-label>
                <input
                  matInput
                  type="email"
                  formControlName="email"
                  placeholder="ejemplo@correo.com"
                  [class.error]="resetForm.get('email')?.invalid && resetForm.get('email')?.touched"
                >
                <mat-icon matSuffix>email</mat-icon>
                <app-form-field-error
                  [control]="resetForm.get('email')!"
                  fieldName="email">
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
                  <span *ngIf="!loading">Enviar enlace de restablecimiento</span>
                  <span *ngIf="loading">Enviando...</span>
                </button>
              </div>
            </form>

            <!-- Mensaje de confirmación después de enviar -->
            <div *ngIf="emailSent" class="success-message">
              <mat-icon class="success-icon">check_circle</mat-icon>
              <h3>¡Correo enviado!</h3>
              <p>
                Hemos enviado un enlace de restablecimiento de contraseña a
                <strong>{{ sentToEmail }}</strong>
              </p>
              <p class="instruction">
                Revisa tu bandeja de entrada y sigue las instrucciones del correo.
                Si no ves el correo, revisa tu carpeta de spam.
              </p>

              <div class="resend-section">
                <p>¿No recibiste el correo?</p>
                <button
                  mat-stroked-button
                  color="primary"
                  (click)="resendEmail()"
                  [disabled]="resendLoading || resendCooldown > 0"
                >
                  <mat-spinner *ngIf="resendLoading" diameter="20" class="spinner"></mat-spinner>
                  <span *ngIf="!resendLoading && resendCooldown === 0">Reenviar correo</span>
                  <span *ngIf="!resendLoading && resendCooldown > 0">
                    Reenviar en {{ resendCooldown }}s
                  </span>
                </button>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions class="card-actions">
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
    .forgot-password-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .forgot-password-card {
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
      line-height: 1.4;
      text-align: center;
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

    .success-message {
      text-align: center;
      padding: 20px 0;
    }

    .success-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #4caf50;
      margin-bottom: 16px;
    }

    .success-message h3 {
      color: #4caf50;
      margin: 0 0 16px 0;
      font-size: 24px;
    }

    .success-message p {
      margin: 8px 0;
      color: #666;
      line-height: 1.5;
    }

    .instruction {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0 !important;
      border-left: 4px solid #2196f3;
    }

    .resend-section {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .resend-section p {
      margin-bottom: 12px;
      font-size: 14px;
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

    .error {
      border-color: #f44336 !important;
    }

    button:disabled {
      opacity: 0.6;
    }

    /* Responsive Design Mejorado */

    /* Móviles pequeños (< 576px) */
    @media (max-width: 575.98px) {
      .forgot-password-container {
        padding: 12px;
        min-height: 100vh;
        align-items: stretch;
      }

      .forgot-password-card {
        max-width: none;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 100vh;
      }

      mat-card {
        margin: 0;
        border-radius: 0;
        box-shadow: none;
        background: transparent;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      mat-card-header {
        padding: 20px 16px;
        background: none;
        color: white;
        text-align: center;
      }

      mat-card-content {
        padding: 20px 16px;
        background: white;
        border-radius: 16px 16px 0 0;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        margin-top: auto;
      }

      .header-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 12px;
      }

      mat-card-title {
        font-size: 22px;
        margin-bottom: 8px;
        line-height: 1.3;
      }

      mat-card-subtitle {
        font-size: 14px !important;
        line-height: 1.4;
        margin-bottom: 0;
      }

      mat-form-field {
        margin-bottom: 12px;
        width: 100%;
      }

      .full-width {
        width: 100%;
      }

      button {
        height: 48px;
        font-size: 16px;
        font-weight: 500;
        border-radius: 8px;
      }

      .success-message {
        padding: 16px 0;
      }

      .success-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      .success-message h3 {
        font-size: 20px;
      }

      .instruction {
        padding: 12px;
        font-size: 13px;
      }

      .resend-section {
        margin-top: 20px;
        padding-top: 16px;
      }

      .card-actions {
        padding: 16px;
        background: white;
        border-radius: 0 0 16px 16px;
        margin-top: 0;
      }

      .back-button {
        font-size: 14px;
        min-height: 44px;
      }
    }

    /* Móviles grandes (576px - 767.98px) */
    @media (min-width: 576px) and (max-width: 767.98px) {
      .forgot-password-container {
        padding: 16px;
      }

      .forgot-password-card {
        max-width: 440px;
      }

      mat-card-header {
        padding: 28px 24px;
      }

      mat-card-content {
        padding: 28px 24px;
      }

      .header-icon {
        font-size: 44px;
        width: 44px;
        height: 44px;
      }

      mat-card-title {
        font-size: 22px;
      }

      mat-card-subtitle {
        font-size: 14px !important;
      }

      button {
        height: 46px;
        font-size: 15px;
      }
    }

    /* Tablets (768px - 991.98px) */
    @media (min-width: 768px) and (max-width: 991.98px) {
      .forgot-password-container {
        padding: 20px;
      }

      .forgot-password-card {
        max-width: 500px;
      }

      mat-card-header {
        padding: 32px 28px;
      }

      mat-card-content {
        padding: 32px 28px;
      }

      button {
        height: 44px;
      }
    }

    /* Orientación landscape en móviles */
    @media (max-height: 500px) and (orientation: landscape) and (max-width: 767.98px) {
      .forgot-password-container {
        align-items: flex-start;
        padding: 8px;
        overflow-y: auto;
      }

      .forgot-password-card {
        width: 100%;
        max-width: 600px;
      }

      mat-card {
        display: flex;
        flex-direction: row;
        min-height: auto;
        max-height: 90vh;
        border-radius: 12px;
      }

      mat-card-header {
        flex: 0 0 40%;
        display: flex;
        align-items: center;
        padding: 16px;
        border-radius: 12px 0 0 12px;
      }

      mat-card-content {
        flex: 1;
        padding: 16px;
        border-radius: 0 12px 12px 0;
        overflow-y: auto;
      }

      .header-content {
        text-align: left;
      }

      .header-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        margin-bottom: 8px;
      }

      mat-card-title {
        font-size: 18px;
      }

      mat-card-subtitle {
        font-size: 12px !important;
      }
    }

    /* Mejoras para dispositivos táctiles */
    @media (hover: none) and (pointer: coarse) {
      button {
        min-height: 44px;
        padding: 12px 24px;
        font-weight: 500;
      }

      mat-form-field {
        margin-bottom: 16px;
      }

      /* Inputs más grandes para fácil toque */
      input {
        font-size: 16px; /* Evita zoom en iOS */
      }

      .resend-section button {
        min-height: 44px;
        padding: 10px 20px;
      }
    }

    /* Soporte para safe area (notch) */
    @supports (padding: env(safe-area-inset-top)) {
      @media (max-width: 575.98px) {
        .forgot-password-container {
          padding-top: max(12px, env(safe-area-inset-top));
          padding-bottom: max(12px, env(safe-area-inset-bottom));
          padding-left: max(12px, env(safe-area-inset-left));
          padding-right: max(12px, env(safe-area-inset-right));
        }
      }
    }

    /* Dark mode responsivo */
    @media (prefers-color-scheme: dark) {
      @media (max-width: 575.98px) {
        .forgot-password-container {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        }

        mat-card-content {
          background: #2d2d2d;
          color: white;
        }

        .card-actions {
          background: #2d2d2d;
        }
      }
    }

    /* Reducir motion para accesibilidad */
    @media (prefers-reduced-motion: reduce) {
      mat-card {
        animation: none;
      }

      .spinner {
        animation-duration: 2s;
      }
    }

    /* Alto contraste */
    @media (prefers-contrast: high) {
      mat-card {
        border: 2px solid currentColor;
      }

      button {
        border: 2px solid currentColor;
      }

      .instruction {
        border: 2px solid currentColor;
      }
    }
  `]
})
export class ForgotPasswordComponent implements OnInit {
  resetForm: FormGroup;
  loading = false;
  emailSent = false;
  sentToEmail = '';
  resendLoading = false;
  resendCooldown = 0;
  private cooldownInterval?: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private loadingService: LoadingService,
    private formErrorService: FormErrorService
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, CustomValidators.email]]
    });
  }

  ngOnInit(): void {
    // Si el usuario ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.resetForm.valid && !this.loading) {
      this.loading = true;
      const email = this.resetForm.get('email')?.value;

      // El loading ya se maneja en el AuthService
      this.authService.requestPasswordReset(email).subscribe({
        next: (response) => {
          this.loading = false;
          this.emailSent = true;
          this.sentToEmail = email;
          this.snackBar.open(
            'Correo de restablecimiento enviado correctamente',
            'Cerrar',
            { duration: 5000, panelClass: ['success-snackbar'] }
          );
        },
        error: (error) => {
          this.loading = false;
          let message = 'Error al enviar el correo de restablecimiento';

          if (error.status === 404) {
            message = 'No encontramos una cuenta con ese correo electrónico';
          } else if (error.status === 429) {
            message = 'Has solicitado demasiados correos. Inténtalo más tarde';
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

  resendEmail(): void {
    if (this.resendLoading || this.resendCooldown > 0) return;

    this.resendLoading = true;
    const email = this.sentToEmail;

    this.authService.requestPasswordReset(email).subscribe({
      next: (response) => {
        this.resendLoading = false;
        this.startResendCooldown();
        this.snackBar.open(
          'Correo reenviado correctamente',
          'Cerrar',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      },
      error: (error) => {
        this.resendLoading = false;
        let message = 'Error al reenviar el correo';

        if (error.status === 429) {
          message = 'Debes esperar antes de solicitar otro correo';
          this.startResendCooldown();
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

  private startResendCooldown(): void {
    this.resendCooldown = 60; // 60 segundos
    this.cooldownInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownInterval);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }
}