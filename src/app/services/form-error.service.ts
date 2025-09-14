/**
 * Servicio para manejo centralizado de errores de formularios
 */

import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, FormArray } from '@angular/forms';

export interface FormFieldError {
  field: string;
  error: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class FormErrorService {
  private readonly errorMessages: Record<string, (error: any) => string> = {
    // Errores básicos
    required: () => 'Este campo es obligatorio',
    minlength: (error) => `Mínimo ${error.requiredLength} caracteres`,
    maxlength: (error) => `Máximo ${error.requiredLength} caracteres`,
    min: (error) => `El valor mínimo es ${error.min}`,
    max: (error) => `El valor máximo es ${error.max}`,
    pattern: () => 'El formato no es válido',

    // Errores de email
    email: (error) => error.message || 'El email no es válido',
    emailExists: (error) => error.message || 'Este email ya está registrado',

    // Errores de contraseña
    password: (error) => this.formatPasswordError(error),
    confirmPassword: (error) => error.message || 'Las contraseñas no coinciden',

    // Errores de teléfono
    phone: (error) => error.message || 'El teléfono no es válido',

    // Errores de fecha
    birthDate: (error) => error.message || 'Fecha de nacimiento no válida',
    dateRange: (error) => error.message || 'El rango de fechas no es válido',

    // Errores de documentos
    nifNie: (error) => error.message || 'NIF/NIE no válido',

    // Errores de código postal
    postalCode: (error) => error.message || 'Código postal no válido',

    // Errores de URL
    url: (error) => error.message || 'URL no válida',

    // Errores asíncronos
    usernameExists: (error) => error.message || 'Este nombre de usuario no está disponible',

    // Errores personalizados
    custom: (error) => error.message || 'Error de validación'
  };

  /**
   * Obtiene el mensaje de error para un control específico
   */
  getErrorMessage(control: AbstractControl, fieldName?: string): string | null {
    if (!control || !control.errors) {
      return null;
    }

    // Obtener el primer error
    const errorKey = Object.keys(control.errors)[0];
    const error = control.errors[errorKey];

    // Verificar si hay un mensaje personalizado
    if (error && typeof error === 'object' && error.message) {
      return error.message;
    }

    // Usar el generador de mensajes
    const messageGenerator = this.errorMessages[errorKey];
    if (messageGenerator) {
      return messageGenerator(error);
    }

    // Mensaje genérico
    return `Error en ${fieldName || 'el campo'}`;
  }

  /**
   * Obtiene todos los errores de un FormGroup
   */
  getFormErrors(formGroup: FormGroup): FormFieldError[] {
    const errors: FormFieldError[] = [];

    Object.keys(formGroup.controls).forEach(fieldName => {
      const control = formGroup.get(fieldName);
      if (control && control.errors) {
        const message = this.getErrorMessage(control, fieldName);
        if (message) {
          errors.push({
            field: fieldName,
            error: Object.keys(control.errors)[0],
            message
          });
        }
      }

      // Manejar FormGroups anidados
      if (control instanceof FormGroup) {
        const nestedErrors = this.getFormErrors(control);
        nestedErrors.forEach(error => {
          error.field = `${fieldName}.${error.field}`;
        });
        errors.push(...nestedErrors);
      }

      // Manejar FormArrays
      if (control instanceof FormArray) {
        control.controls.forEach((arrayControl, index) => {
          if (arrayControl instanceof FormGroup) {
            const arrayErrors = this.getFormErrors(arrayControl);
            arrayErrors.forEach(error => {
              error.field = `${fieldName}[${index}].${error.field}`;
            });
            errors.push(...arrayErrors);
          } else if (arrayControl.errors) {
            const message = this.getErrorMessage(arrayControl, `${fieldName}[${index}]`);
            if (message) {
              errors.push({
                field: `${fieldName}[${index}]`,
                error: Object.keys(arrayControl.errors)[0],
                message
              });
            }
          }
        });
      }
    });

    return errors;
  }

  /**
   * Verifica si un formulario tiene errores
   */
  hasErrors(formGroup: FormGroup): boolean {
    return this.getFormErrors(formGroup).length > 0;
  }

  /**
   * Marca todos los campos como touched para mostrar errores
   */
  markAllFieldsAsTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(fieldName => {
      const control = formGroup.get(fieldName);
      if (control) {
        control.markAsTouched();

        if (control instanceof FormGroup) {
          this.markAllFieldsAsTouched(control);
        }

        if (control instanceof FormArray) {
          control.controls.forEach(arrayControl => {
            arrayControl.markAsTouched();
            if (arrayControl instanceof FormGroup) {
              this.markAllFieldsAsTouched(arrayControl);
            }
          });
        }
      }
    });
  }

  /**
   * Limpia todos los errores de un formulario
   */
  clearErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(fieldName => {
      const control = formGroup.get(fieldName);
      if (control) {
        control.setErrors(null);

        if (control instanceof FormGroup) {
          this.clearErrors(control);
        }

        if (control instanceof FormArray) {
          control.controls.forEach(arrayControl => {
            if (arrayControl instanceof FormGroup) {
              this.clearErrors(arrayControl);
            } else {
              arrayControl.setErrors(null);
            }
          });
        }
      }
    });
  }

  /**
   * Establece errores personalizados en campos específicos
   */
  setFieldErrors(formGroup: FormGroup, errors: Record<string, string>): void {
    Object.keys(errors).forEach(fieldName => {
      const control = formGroup.get(fieldName);
      if (control) {
        control.setErrors({
          custom: { message: errors[fieldName] }
        });
      }
    });
  }

  /**
   * Obtiene sugerencias de corrección para errores comunes
   */
  getErrorSuggestion(control: AbstractControl): string | null {
    if (!control || !control.errors) {
      return null;
    }

    const errors = control.errors;

    // Sugerencias para email
    if (errors['email'] && errors['email'].suggestion) {
      return `¿Quisiste decir ${errors['email'].suggestion}?`;
    }

    // Sugerencias para contraseña
    if (errors['password']) {
      return 'Intenta usar una combinación de letras mayúsculas, minúsculas, números y símbolos';
    }

    // Sugerencias para teléfono
    if (errors['phone']) {
      return 'Usa el formato: 612345678 o +34612345678';
    }

    return null;
  }

  /**
   * Formatea específicamente errores de contraseña
   */
  private formatPasswordError(error: any): string {
    if (!error || typeof error !== 'object') {
      return 'La contraseña no es válida';
    }

    const issues: string[] = [];

    if (error.minLength) {
      issues.push(`al menos ${error.minLength.requiredLength} caracteres`);
    }
    if (error.uppercase) {
      issues.push('una letra mayúscula');
    }
    if (error.lowercase) {
      issues.push('una letra minúscula');
    }
    if (error.numbers) {
      issues.push('un número');
    }
    if (error.specialChars) {
      issues.push('un carácter especial');
    }
    if (error.forbiddenPattern) {
      return `La contraseña no puede contener "${error.forbiddenPattern.pattern}"`;
    }
    if (error.commonSequence) {
      return 'Evita secuencias comunes como 123 o abc';
    }
    if (error.excessiveRepetition) {
      return 'Evita repetir el mismo carácter muchas veces';
    }

    if (issues.length === 1) {
      return `La contraseña debe tener ${issues[0]}`;
    } else if (issues.length > 1) {
      const lastIssue = issues.pop();
      return `La contraseña debe tener ${issues.join(', ')} y ${lastIssue}`;
    }

    return 'La contraseña no cumple con los requisitos';
  }

  /**
   * Registra un mensaje de error personalizado
   */
  registerErrorMessage(errorKey: string, messageGenerator: (error: any) => string): void {
    this.errorMessages[errorKey] = messageGenerator;
  }

  /**
   * Verifica si un campo específico es válido
   */
  isFieldValid(formGroup: FormGroup, fieldName: string): boolean {
    const control = formGroup.get(fieldName);
    return control ? control.valid : false;
  }

  /**
   * Verifica si un campo específico debe mostrar errores
   */
  shouldShowError(formGroup: FormGroup, fieldName: string): boolean {
    const control = formGroup.get(fieldName);
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }

  /**
   * Obtiene estadísticas de validación del formulario
   */
  getValidationStats(formGroup: FormGroup): {
    totalFields: number;
    validFields: number;
    invalidFields: number;
    touchedFields: number;
    errors: FormFieldError[];
  } {
    const errors = this.getFormErrors(formGroup);
    const stats = {
      totalFields: 0,
      validFields: 0,
      invalidFields: 0,
      touchedFields: 0,
      errors
    };

    const countFields = (group: FormGroup) => {
      Object.keys(group.controls).forEach(fieldName => {
        const control = group.get(fieldName);
        if (control) {
          if (!(control instanceof FormGroup) && !(control instanceof FormArray)) {
            stats.totalFields++;
            if (control.valid) stats.validFields++;
            if (control.invalid) stats.invalidFields++;
            if (control.touched) stats.touchedFields++;
          } else if (control instanceof FormGroup) {
            countFields(control);
          }
        }
      });
    };

    countFields(formGroup);
    return stats;
  }
}