/**
 * Componente reutilizable para mostrar errores de campos de formulario
 */

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { FormErrorService } from '../../services/form-error.service';

@Component({
  selector: 'app-form-field-error',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  template: `
    <div
      class="form-field-error"
      [class.visible]="shouldShow"
      [class.warning]="isWarning"
      *ngIf="shouldShow">

      <div class="error-content">
        <!-- Icon -->
        <mat-icon class="error-icon">
          {{ isWarning ? 'warning' : 'error_outline' }}
        </mat-icon>

        <!-- Error message -->
        <div class="error-text">
          <span class="error-message">{{ errorMessage }}</span>

          <!-- Suggestion -->
          <span class="error-suggestion" *ngIf="suggestion">
            {{ suggestion }}
          </span>
        </div>
      </div>

      <!-- Progress indicator for password strength -->
      <div
        class="password-strength"
        *ngIf="showPasswordStrength && control?.errors?.['password']">
        <div class="strength-bars">
          <div
            class="strength-bar"
            *ngFor="let bar of strengthBars; let i = index"
            [class]="getStrengthBarClass(i)">
          </div>
        </div>
        <span class="strength-text">{{ strengthText }}</span>
      </div>

      <!-- Validation requirements checklist -->
      <div
        class="validation-checklist"
        *ngIf="showChecklist && control?.errors?.['password']">
        <div class="checklist-title">Requisitos de contraseña:</div>
        <ul class="checklist">
          <li
            class="checklist-item"
            [class.valid]="!control?.errors?.['password']?.minLength"
            *ngIf="passwordRequirements.minLength">
            <mat-icon class="check-icon">
              {{ !control?.errors?.['password']?.minLength ? 'check' : 'close' }}
            </mat-icon>
            Al menos {{ passwordRequirements.minLength }} caracteres
          </li>
          <li
            class="checklist-item"
            [class.valid]="!control?.errors?.['password']?.uppercase"
            *ngIf="passwordRequirements.requireUppercase">
            <mat-icon class="check-icon">
              {{ !control?.errors?.['password']?.uppercase ? 'check' : 'close' }}
            </mat-icon>
            Una letra mayúscula
          </li>
          <li
            class="checklist-item"
            [class.valid]="!control?.errors?.['password']?.lowercase"
            *ngIf="passwordRequirements.requireLowercase">
            <mat-icon class="check-icon">
              {{ !control?.errors?.['password']?.lowercase ? 'check' : 'close' }}
            </mat-icon>
            Una letra minúscula
          </li>
          <li
            class="checklist-item"
            [class.valid]="!control?.errors?.['password']?.numbers"
            *ngIf="passwordRequirements.requireNumbers">
            <mat-icon class="check-icon">
              {{ !control?.errors?.['password']?.numbers ? 'check' : 'close' }}
            </mat-icon>
            Un número
          </li>
          <li
            class="checklist-item"
            [class.valid]="!control?.errors?.['password']?.specialChars"
            *ngIf="passwordRequirements.requireSpecialChars">
            <mat-icon class="check-icon">
              {{ !control?.errors?.['password']?.specialChars ? 'check' : 'close' }}
            </mat-icon>
            Un carácter especial
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .form-field-error {
      margin-top: 4px;
      overflow: hidden;
      transition: all 0.3s ease;
      max-height: 0;
      opacity: 0;
    }

    .form-field-error.visible {
      max-height: 300px;
      opacity: 1;
    }

    .error-content {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      padding: 8px 0;
    }

    .error-icon {
      color: #f44336;
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-top: 1px;
      flex-shrink: 0;
    }

    .form-field-error.warning .error-icon {
      color: #ff9800;
    }

    .error-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }

    .error-message {
      color: #f44336;
      font-size: 12px;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .form-field-error.warning .error-message {
      color: #ff9800;
    }

    .error-suggestion {
      color: #666;
      font-size: 11px;
      font-style: italic;
      line-height: 1.3;
    }

    /* Password strength indicator */
    .password-strength {
      margin-top: 8px;
      padding: 8px 0;
      border-top: 1px solid #eee;
    }

    .strength-bars {
      display: flex;
      gap: 2px;
      margin-bottom: 6px;
    }

    .strength-bar {
      height: 4px;
      flex: 1;
      background-color: #e0e0e0;
      border-radius: 2px;
      transition: background-color 0.3s ease;
    }

    .strength-bar.weak {
      background-color: #f44336;
    }

    .strength-bar.medium {
      background-color: #ff9800;
    }

    .strength-bar.strong {
      background-color: #4caf50;
    }

    .strength-text {
      font-size: 11px;
      color: #666;
    }

    /* Validation checklist */
    .validation-checklist {
      margin-top: 8px;
      padding: 8px 0;
      border-top: 1px solid #eee;
    }

    .checklist-title {
      font-size: 11px;
      color: #666;
      margin-bottom: 6px;
      font-weight: 500;
    }

    .checklist {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .checklist-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #f44336;
      margin-bottom: 4px;
      transition: color 0.3s ease;
    }

    .checklist-item.valid {
      color: #4caf50;
    }

    .check-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .checklist-item .check-icon {
      color: #f44336;
    }

    .checklist-item.valid .check-icon {
      color: #4caf50;
    }

    /* Animation */
    @keyframes slideDown {
      from {
        max-height: 0;
        opacity: 0;
      }
      to {
        max-height: 300px;
        opacity: 1;
      }
    }

    .form-field-error.visible {
      animation: slideDown 0.3s ease-out;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .error-content {
        padding: 6px 0;
      }

      .error-message {
        font-size: 11px;
      }

      .error-suggestion {
        font-size: 10px;
      }

      .checklist-item {
        font-size: 10px;
      }

      .strength-bars {
        height: 3px;
      }
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
      .password-strength,
      .validation-checklist {
        border-top-color: #444;
      }

      .error-suggestion {
        color: #ccc;
      }

      .checklist-title {
        color: #ccc;
      }

      .strength-text {
        color: #ccc;
      }

      .strength-bar {
        background-color: #444;
      }
    }
  `]
})
export class FormFieldErrorComponent implements OnInit, OnDestroy {
  @Input() control?: AbstractControl;
  @Input() formGroup?: FormGroup;
  @Input() fieldName?: string;
  @Input() showOnPristine = false;
  @Input() isWarning = false;
  @Input() customMessage?: string;
  @Input() showPasswordStrength = false;
  @Input() showChecklist = false;

  errorMessage = '';
  suggestion: string | null = null;
  strengthBars = [1, 2, 3, 4, 5];
  strengthText = '';

  passwordRequirements = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  };

  private destroy$ = new Subject<void>();

  constructor(private formErrorService: FormErrorService) {}

  ngOnInit(): void {
    this.setupControl();
    this.subscribeToChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get shouldShow(): boolean {
    if (this.customMessage) {
      return true;
    }

    if (!this.control) {
      return false;
    }

    const hasErrors = this.control.invalid;
    const shouldShowOnTouch = this.control.touched || this.control.dirty;

    return hasErrors && (shouldShowOnTouch || this.showOnPristine);
  }

  private setupControl(): void {
    // Si se proporciona formGroup y fieldName, obtener el control
    if (this.formGroup && this.fieldName && !this.control) {
      this.control = this.formGroup.get(this.fieldName) || undefined;
    }
  }

  private subscribeToChanges(): void {
    if (this.control) {
      // Suscribirse a cambios en el estado del control
      this.control.statusChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.updateErrorMessage();
          this.updatePasswordStrength();
        });

      // Suscribirse a cambios en el valor para password strength
      this.control.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.updatePasswordStrength();
        });
    }

    // Actualización inicial
    this.updateErrorMessage();
    this.updatePasswordStrength();
  }

  private updateErrorMessage(): void {
    if (this.customMessage) {
      this.errorMessage = this.customMessage;
      return;
    }

    if (this.control && this.control.errors) {
      this.errorMessage = this.formErrorService.getErrorMessage(this.control, this.fieldName) || '';
      this.suggestion = this.formErrorService.getErrorSuggestion(this.control);
    } else {
      this.errorMessage = '';
      this.suggestion = null;
    }
  }

  private updatePasswordStrength(): void {
    if (!this.showPasswordStrength || !this.control || !this.control.value) {
      this.strengthText = '';
      return;
    }

    const password = this.control.value.toString();
    const strength = this.calculatePasswordStrength(password);

    this.strengthText = this.getStrengthText(strength);
  }

  private calculatePasswordStrength(password: string): number {
    let score = 0;

    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password)) score += 1;

    return score;
  }

  private getStrengthText(strength: number): string {
    switch (strength) {
      case 0:
      case 1:
        return 'Muy débil';
      case 2:
        return 'Débil';
      case 3:
        return 'Regular';
      case 4:
        return 'Fuerte';
      case 5:
        return 'Muy fuerte';
      default:
        return '';
    }
  }

  getStrengthBarClass(index: number): string {
    if (!this.control || !this.control.value) {
      return '';
    }

    const password = this.control.value.toString();
    const strength = this.calculatePasswordStrength(password);

    if (index < strength) {
      if (strength <= 2) return 'weak';
      if (strength <= 3) return 'medium';
      return 'strong';
    }

    return '';
  }
}