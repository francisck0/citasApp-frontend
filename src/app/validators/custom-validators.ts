/**
 * Validadores personalizados para formularios
 */

import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/**
 * Validadores síncronos
 */
export class CustomValidators {

  /**
   * Valida formato de email más estricto
   */
  static email(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(control.value);

    if (!isValid) {
      return { email: { value: control.value, message: 'Email no válido' } };
    }

    // Verificar dominios comunes mal escritos
    const commonDomainTypos = [
      'gmail.co', 'gmail.cm', 'gmai.com', 'gmial.com',
      'yahoo.co', 'yahoo.cm', 'yhoo.com',
      'hotmail.co', 'hotmail.cm', 'hotmial.com'
    ];

    const domain = control.value.split('@')[1]?.toLowerCase();
    if (commonDomainTypos.includes(domain)) {
      return {
        email: {
          value: control.value,
          message: 'Verifica que el dominio del email esté escrito correctamente',
          suggestion: this.suggestDomainCorrection(domain)
        }
      };
    }

    return null;
  }

  /**
   * Validador de contraseña robusto
   */
  static password(requirements?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
    forbiddenPatterns?: string[];
  }): ValidatorFn {
    const defaultRequirements = {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      forbiddenPatterns: ['123456', 'password', 'qwerty', '111111']
    };

    const config = { ...defaultRequirements, ...requirements };

    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const password = control.value.toString();
      const errors: any = {};
      let isValid = true;

      // Longitud mínima
      if (password.length < config.minLength) {
        errors.minLength = {
          actualLength: password.length,
          requiredLength: config.minLength,
          message: `La contraseña debe tener al menos ${config.minLength} caracteres`
        };
        isValid = false;
      }

      // Mayúsculas
      if (config.requireUppercase && !/[A-Z]/.test(password)) {
        errors.uppercase = {
          message: 'La contraseña debe contener al menos una letra mayúscula'
        };
        isValid = false;
      }

      // Minúsculas
      if (config.requireLowercase && !/[a-z]/.test(password)) {
        errors.lowercase = {
          message: 'La contraseña debe contener al menos una letra minúscula'
        };
        isValid = false;
      }

      // Números
      if (config.requireNumbers && !/\d/.test(password)) {
        errors.numbers = {
          message: 'La contraseña debe contener al menos un número'
        };
        isValid = false;
      }

      // Caracteres especiales
      if (config.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password)) {
        errors.specialChars = {
          message: 'La contraseña debe contener al menos un carácter especial'
        };
        isValid = false;
      }

      // Patrones prohibidos
      const lowerPassword = password.toLowerCase();
      for (const pattern of config.forbiddenPatterns || []) {
        if (lowerPassword.includes(pattern.toLowerCase())) {
          errors.forbiddenPattern = {
            pattern,
            message: `La contraseña no puede contener "${pattern}"`
          };
          isValid = false;
          break;
        }
      }

      // Verificar secuencias comunes
      if (this.hasCommonSequence(password)) {
        errors.commonSequence = {
          message: 'La contraseña no puede contener secuencias comunes (123, abc, etc.)'
        };
        isValid = false;
      }

      // Verificar repeticiones excesivas
      if (this.hasExcessiveRepetition(password)) {
        errors.excessiveRepetition = {
          message: 'La contraseña no puede tener demasiados caracteres repetidos'
        };
        isValid = false;
      }

      return isValid ? null : { password: errors };
    };
  }

  /**
   * Validador para confirmar contraseñas
   */
  static confirmPassword(passwordField: string, confirmField: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get(passwordField);
      const confirmPassword = formGroup.get(confirmField);

      if (!password || !confirmPassword) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({
          confirmPassword: {
            message: 'Las contraseñas no coinciden'
          }
        });
        return { confirmPassword: true };
      } else {
        // Limpiar error si las contraseñas coinciden
        if (confirmPassword.hasError('confirmPassword')) {
          delete confirmPassword.errors?.['confirmPassword'];
          if (Object.keys(confirmPassword.errors || {}).length === 0) {
            confirmPassword.setErrors(null);
          }
        }
      }

      return null;
    };
  }

  /**
   * Validador de teléfono
   */
  static phone(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const phoneStr = control.value.toString().replace(/\D/g, ''); // Solo números

    // Verificar longitud
    if (phoneStr.length < 9 || phoneStr.length > 15) {
      return {
        phone: {
          value: control.value,
          message: 'El teléfono debe tener entre 9 y 15 dígitos'
        }
      };
    }

    // Patrones específicos para España
    const spainPatterns = [
      /^(6|7)\d{8}$/, // Móviles
      /^9\d{8}$/, // Fijos
      /^34(6|7)\d{8}$/, // Móviles con prefijo
      /^349\d{8}$/ // Fijos con prefijo
    ];

    const isValidSpain = spainPatterns.some(pattern => pattern.test(phoneStr));

    if (!isValidSpain) {
      return {
        phone: {
          value: control.value,
          message: 'Formato de teléfono español no válido'
        }
      };
    }

    return null;
  }

  /**
   * Validador de fecha de nacimiento
   */
  static birthDate(minAge = 13, maxAge = 120): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const birthDate = new Date(control.value);
      const today = new Date();

      if (isNaN(birthDate.getTime())) {
        return { birthDate: { message: 'Fecha de nacimiento no válida' } };
      }

      // No puede ser futura
      if (birthDate > today) {
        return {
          birthDate: {
            message: 'La fecha de nacimiento no puede ser futura'
          }
        };
      }

      // Calcular edad
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      let actualAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        actualAge--;
      }

      if (actualAge < minAge) {
        return {
          birthDate: {
            actualAge,
            minAge,
            message: `Debes tener al menos ${minAge} años`
          }
        };
      }

      if (actualAge > maxAge) {
        return {
          birthDate: {
            actualAge,
            maxAge,
            message: `La edad máxima permitida es ${maxAge} años`
          }
        };
      }

      return null;
    };
  }

  /**
   * Validador de NIF/NIE español
   */
  static nifNie(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const value = control.value.toString().toUpperCase().trim();

    // Validar NIF
    if (/^\d{8}[A-Z]$/.test(value)) {
      const number = value.substring(0, 8);
      const letter = value.charAt(8);
      const expectedLetter = 'TRWAGMYFPDXBNJZSQVHLCKE'[parseInt(number) % 23];

      if (letter !== expectedLetter) {
        return {
          nifNie: {
            value,
            message: 'NIF no válido'
          }
        };
      }
      return null;
    }

    // Validar NIE
    if (/^[XYZ]\d{7}[A-Z]$/.test(value)) {
      const firstLetter = value.charAt(0);
      const number = value.substring(1, 8);
      const letter = value.charAt(8);

      let nieNumber = '';
      switch (firstLetter) {
        case 'X': nieNumber = '0' + number; break;
        case 'Y': nieNumber = '1' + number; break;
        case 'Z': nieNumber = '2' + number; break;
      }

      const expectedLetter = 'TRWAGMYFPDXBNJZSQVHLCKE'[parseInt(nieNumber) % 23];

      if (letter !== expectedLetter) {
        return {
          nifNie: {
            value,
            message: 'NIE no válido'
          }
        };
      }
      return null;
    }

    return {
      nifNie: {
        value,
        message: 'Formato de NIF/NIE no válido (ej: 12345678A o X1234567A)'
      }
    };
  }

  /**
   * Validador de código postal español
   */
  static postalCode(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const postalCode = control.value.toString().trim();

    if (!/^\d{5}$/.test(postalCode)) {
      return {
        postalCode: {
          value: postalCode,
          message: 'El código postal debe tener 5 dígitos'
        }
      };
    }

    // Validar rangos válidos para España
    const code = parseInt(postalCode);
    if (code < 1000 || code > 52999) {
      return {
        postalCode: {
          value: postalCode,
          message: 'Código postal español no válido'
        }
      };
    }

    return null;
  }

  /**
   * Validador de URL
   */
  static url(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

    if (!urlPattern.test(control.value)) {
      return {
        url: {
          value: control.value,
          message: 'URL no válida'
        }
      };
    }

    return null;
  }

  /**
   * Validador de rango de fechas
   */
  static dateRange(startField: string, endField: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const startDate = formGroup.get(startField);
      const endDate = formGroup.get(endField);

      if (!startDate || !endDate || !startDate.value || !endDate.value) {
        return null;
      }

      const start = new Date(startDate.value);
      const end = new Date(endDate.value);

      if (start >= end) {
        endDate.setErrors({
          dateRange: {
            message: 'La fecha final debe ser posterior a la fecha inicial'
          }
        });
        return { dateRange: true };
      } else {
        if (endDate.hasError('dateRange')) {
          delete endDate.errors?.['dateRange'];
          if (Object.keys(endDate.errors || {}).length === 0) {
            endDate.setErrors(null);
          }
        }
      }

      return null;
    };
  }

  // Métodos auxiliares privados
  private static suggestDomainCorrection(domain: string): string | undefined {
    const corrections: Record<string, string> = {
      'gmail.co': 'gmail.com',
      'gmail.cm': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'yahoo.co': 'yahoo.com',
      'yahoo.cm': 'yahoo.com',
      'yhoo.com': 'yahoo.com',
      'hotmail.co': 'hotmail.com',
      'hotmail.cm': 'hotmail.com',
      'hotmial.com': 'hotmail.com'
    };

    return corrections[domain];
  }

  private static hasCommonSequence(password: string): boolean {
    const sequences = [
      '123456789', '987654321',
      'abcdefghij', 'zyxwvutsrq',
      'qwertyuiop', 'poiuytrewq',
      'asdfghjkl', 'lkjhgfdsa'
    ];

    const lowerPassword = password.toLowerCase();
    return sequences.some(seq => {
      for (let i = 0; i <= seq.length - 3; i++) {
        if (lowerPassword.includes(seq.substring(i, i + 3))) {
          return true;
        }
      }
      return false;
    });
  }

  private static hasExcessiveRepetition(password: string): boolean {
    // Verificar si hay más de 2 caracteres repetidos consecutivamente
    return /(.)\1{2,}/.test(password);
  }
}

/**
 * Validadores asíncronos
 */
@Injectable({
  providedIn: 'root'
})
export class AsyncValidators {
  constructor(private http: HttpClient) {}

  /**
   * Validador asíncrono para verificar si un email ya existe
   */
  emailExists(apiUrl: string, excludeCurrentUser = false): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return timer(500).pipe( // Debounce de 500ms
        switchMap(() => {
          const params = excludeCurrentUser ? { excludeCurrent: 'true' } : {};
          return this.http.post<{exists: boolean}>(
            `${apiUrl}/check-email`,
            { email: control.value },
            { params }
          );
        }),
        map(response => {
          return response.exists
            ? { emailExists: { message: 'Este email ya está registrado' } }
            : null;
        }),
        catchError(() => of(null)) // En caso de error, no validar
      );
    };
  }

  /**
   * Validador asíncrono para verificar si un nombre de usuario existe
   */
  usernameExists(apiUrl: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return timer(500).pipe(
        switchMap(() => {
          return this.http.post<{exists: boolean}>(
            `${apiUrl}/check-username`,
            { username: control.value }
          );
        }),
        map(response => {
          return response.exists
            ? { usernameExists: { message: 'Este nombre de usuario no está disponible' } }
            : null;
        }),
        catchError(() => of(null))
      );
    };
  }
}