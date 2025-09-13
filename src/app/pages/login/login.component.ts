import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, LoginRequest, AuthError } from '../../services/auth.service';

// Validador personalizado para email
export function emailValidator(control: AbstractControl): {[key: string]: any} | null {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const valid = emailRegex.test(control.value);
  return valid ? null : { invalidEmail: { value: control.value } };
}

// Validador personalizado para contraseña
export function passwordValidator(control: AbstractControl): {[key: string]: any} | null {
  const value = control.value;
  if (!value) {
    return null;
  }

  const hasMinLength = value.length >= 8;
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);

  const passwordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;

  if (!passwordValid) {
    return {
      invalidPassword: {
        hasMinLength,
        hasUpperCase,
        hasLowerCase,
        hasNumber
      }
    };
  }

  return null;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>Iniciar Sesión</h2>
          <p>Accede a tu cuenta de CitasApp</p>
        </div>

        <!-- Session message -->
        <div class="info-message" *ngIf="sessionMessage">
          <div class="info-icon">ℹ️</div>
          <span>{{ sessionMessage }}</span>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onLogin()" novalidate>
          <!-- Email field -->
          <div class="form-group">
            <label for="email">Correo electrónico *</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              [class.invalid]="isFieldInvalid('email')"
              placeholder="ejemplo@correo.com"
              autocomplete="email">

            <div class="field-errors" *ngIf="isFieldInvalid('email')">
              <small *ngIf="loginForm.get('email')?.hasError('required')">
                El correo electrónico es requerido
              </small>
              <small *ngIf="loginForm.get('email')?.hasError('invalidEmail')">
                Ingresa un correo electrónico válido
              </small>
            </div>
          </div>

          <!-- Password field -->
          <div class="form-group">
            <label for="password">Contraseña *</label>
            <div class="password-input">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                formControlName="password"
                [class.invalid]="isFieldInvalid('password')"
                placeholder="Tu contraseña"
                autocomplete="current-password">
              <button
                type="button"
                class="toggle-password"
                (click)="togglePasswordVisibility()">
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>

            <div class="field-errors" *ngIf="isFieldInvalid('password')">
              <small *ngIf="loginForm.get('password')?.hasError('required')">
                La contraseña es requerida
              </small>
              <div *ngIf="loginForm.get('password')?.hasError('invalidPassword')" class="password-requirements">
                <small>La contraseña debe tener:</small>
                <ul>
                  <li [class.valid]="loginForm.get('password')?.errors?.['invalidPassword']?.hasMinLength">
                    Mínimo 8 caracteres
                  </li>
                  <li [class.valid]="loginForm.get('password')?.errors?.['invalidPassword']?.hasUpperCase">
                    Al menos una mayúscula
                  </li>
                  <li [class.valid]="loginForm.get('password')?.errors?.['invalidPassword']?.hasLowerCase">
                    Al menos una minúscula
                  </li>
                  <li [class.valid]="loginForm.get('password')?.errors?.['invalidPassword']?.hasNumber">
                    Al menos un número
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Remember me checkbox -->
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="rememberMe">
              <span class="checkmark"></span>
              Recordar mi sesión
            </label>
          </div>

          <!-- Error message -->
          <div class="error-message" *ngIf="authError">
            <div class="error-icon">⚠️</div>
            <div class="error-content">
              <strong>{{ authError.message }}</strong>
              <ul *ngIf="authError.errors && authError.errors.length > 0">
                <li *ngFor="let error of authError.errors">{{ error }}</li>
              </ul>
            </div>
          </div>

          <!-- Success message -->
          <div class="success-message" *ngIf="loginSuccess">
            <div class="success-icon">✅</div>
            <span>¡Inicio de sesión exitoso! Redirigiendo...</span>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            class="login-btn"
            [disabled]="loginForm.invalid || isLoading">
            <span *ngIf="isLoading" class="loading-spinner"></span>
            {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <div class="login-footer">
          <p>¿No tienes cuenta?</p>
          <button type="button" class="link-btn" (click)="onRegister()">
            Regístrate aquí
          </button>
          <br>
          <button type="button" class="link-btn" (click)="onForgotPassword()">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      padding: 40px;
      width: 100%;
      max-width: 450px;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .login-header h2 {
      color: #333;
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 700;
    }

    .login-header p {
      color: #666;
      margin: 0;
      font-size: 16px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    input[type="email"], input[type="password"], input[type="text"] {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s ease;
      box-sizing: border-box;
      background: #fafbfc;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    input.invalid {
      border-color: #e74c3c;
      background: #fdf2f2;
    }

    input.invalid:focus {
      border-color: #e74c3c;
      box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
    }

    .password-input {
      position: relative;
    }

    .toggle-password {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .toggle-password:hover {
      background-color: #f0f0f0;
    }

    .field-errors {
      margin-top: 6px;
    }

    .field-errors small {
      color: #e74c3c;
      font-size: 13px;
      display: block;
      margin-bottom: 2px;
    }

    .password-requirements {
      margin-top: 8px;
      background: #fff5f5;
      padding: 10px;
      border-radius: 6px;
      border-left: 3px solid #e74c3c;
    }

    .password-requirements ul {
      margin: 5px 0 0 0;
      padding-left: 20px;
    }

    .password-requirements li {
      font-size: 12px;
      color: #e74c3c;
      margin-bottom: 2px;
    }

    .password-requirements li.valid {
      color: #27ae60;
    }

    .checkbox-group {
      margin: 25px 0;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 14px;
      font-weight: 400;
    }

    .checkbox-label input[type="checkbox"] {
      margin-right: 10px;
      width: auto;
    }

    .error-message {
      background: #fdf2f2;
      border: 1px solid #f5c6cb;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 20px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .error-icon {
      font-size: 18px;
      flex-shrink: 0;
    }

    .error-content strong {
      color: #721c24;
      font-size: 14px;
      display: block;
      margin-bottom: 4px;
    }

    .error-content ul {
      margin: 4px 0 0 0;
      padding-left: 20px;
      color: #721c24;
      font-size: 13px;
    }

    .success-message {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #155724;
      font-size: 14px;
    }

    .success-icon {
      font-size: 18px;
    }

    .info-message {
      background: #d1ecf1;
      border: 1px solid #bee5eb;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #0c5460;
      font-size: 14px;
    }

    .info-icon {
      font-size: 18px;
    }

    .login-btn {
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 14px 20px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .login-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .loading-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff40;
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 8px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .login-footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .login-footer p {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
    }

    .link-btn {
      background: none;
      border: none;
      color: #667eea;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      text-decoration: underline;
      transition: color 0.3s ease;
      margin: 5px 0;
    }

    .link-btn:hover {
      color: #764ba2;
    }

    /* Responsive design */
    @media (max-width: 480px) {
      .login-container {
        padding: 15px;
      }

      .login-card {
        padding: 30px 20px;
      }

      .login-header h2 {
        font-size: 24px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  authError: AuthError | null = null;
  loginSuccess = false;
  returnUrl = '/dashboard';
  sessionMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.createForm();

    // Obtener URL de retorno y mensajes de query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    const message = this.route.snapshot.queryParams['message'];

    if (message === 'session-expired') {
      this.sessionMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    }

    // Redirigir si ya está autenticado
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  private createForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, emailValidator]],
      password: ['', [Validators.required, passwordValidator]],
      rememberMe: [false]
    });

    // Limpiar errores cuando el usuario empiece a escribir
    this.loginForm.valueChanges.subscribe(() => {
      if (this.authError) {
        this.authError = null;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (this.loginForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.authError = null;

    const loginData: LoginRequest = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.loginSuccess = true;

        // Simular un pequeño delay para mostrar el mensaje de éxito
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 1000);
      },
      error: (error: AuthError) => {
        this.isLoading = false;
        this.authError = error;

        // Limpiar contraseña en caso de error de autenticación
        if (error.status === 401) {
          this.loginForm.get('password')?.setValue('');
        }
      }
    });
  }

  onRegister() {
    // Aquí se implementaría la navegación al registro
    alert('Funcionalidad de registro en desarrollo. Te notificaremos cuando esté lista.');
  }

  onForgotPassword() {
    // Aquí se implementaría la recuperación de contraseña
    alert('Funcionalidad de recuperación de contraseña en desarrollo.');
  }
}