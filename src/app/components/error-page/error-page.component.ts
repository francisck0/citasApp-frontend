/**
 * Componente para mostrar páginas de error amigables
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AppError, ErrorAction } from '../../services/error-handler.service';

export interface ErrorPageConfig {
  title?: string;
  message?: string;
  icon?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showRefreshButton?: boolean;
  customActions?: ErrorAction[];
}

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="error-page-container">
      <div class="error-content">
        <mat-card class="error-card">
          <mat-card-content>
            <!-- Error Icon -->
            <div class="error-icon-container">
              <mat-icon class="error-icon" [class]="iconClass">{{ displayIcon }}</mat-icon>
            </div>

            <!-- Error Title -->
            <h1 class="error-title">{{ displayTitle }}</h1>

            <!-- Error Message -->
            <p class="error-message">{{ displayMessage }}</p>

            <!-- Additional Details -->
            <div class="error-details" *ngIf="error?.details">
              <button
                mat-button
                class="details-toggle"
                (click)="showDetails = !showDetails">
                {{ showDetails ? 'Ocultar detalles' : 'Ver detalles técnicos' }}
                <mat-icon>{{ showDetails ? 'expand_less' : 'expand_more' }}</mat-icon>
              </button>

              <div class="details-content" *ngIf="showDetails">
                <pre>{{ error?.details | json }}</pre>
              </div>
            </div>

            <!-- Actions -->
            <div class="error-actions">
              <!-- Default Actions -->
              <button
                *ngIf="config.showRefreshButton !== false"
                mat-raised-button
                color="primary"
                (click)="onRefresh()"
                class="action-button">
                <mat-icon>refresh</mat-icon>
                Actualizar página
              </button>

              <button
                *ngIf="config.showBackButton"
                mat-stroked-button
                (click)="onBack()"
                class="action-button">
                <mat-icon>arrow_back</mat-icon>
                Volver
              </button>

              <button
                *ngIf="config.showHomeButton !== false"
                mat-stroked-button
                routerLink="/dashboard"
                class="action-button">
                <mat-icon>home</mat-icon>
                Ir al inicio
              </button>

              <!-- Custom Actions -->
              <button
                *ngFor="let action of config.customActions"
                mat-button
                (click)="action.action()"
                class="action-button custom-action">
                {{ action.label }}
              </button>
            </div>

            <!-- Support Link -->
            <div class="error-footer">
              <p class="support-text">
                Si el problema persiste,
                <a href="mailto:soporte@citasapp.com" class="support-link">
                  contacta con soporte
                </a>
              </p>

              <p class="error-code" *ngIf="error?.code">
                Código de error: {{ error?.code }}
              </p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .error-page-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .error-content {
      width: 100%;
      max-width: 600px;
      animation: slideUp 0.5s ease-out;
    }

    .error-card {
      text-align: center;
      padding: 40px 32px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .error-icon-container {
      margin-bottom: 32px;
    }

    .error-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #f44336;
    }

    .error-icon.warning {
      color: #ff9800;
    }

    .error-icon.info {
      color: #2196f3;
    }

    .error-icon.network {
      color: #9e9e9e;
    }

    .error-title {
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #333;
    }

    .error-message {
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 32px 0;
      color: #666;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .error-details {
      margin: 32px 0;
      text-align: left;
    }

    .details-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 auto 16px auto;
      color: #666;
    }

    .details-content {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
      border-left: 4px solid #e0e0e0;
      max-height: 200px;
      overflow-y: auto;
    }

    .details-content pre {
      margin: 0;
      font-size: 12px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .error-actions {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 32px;
    }

    .action-button {
      min-width: 200px;
      height: 44px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .custom-action {
      background-color: #f5f5f5;
      border: 1px solid #ddd;
    }

    .error-footer {
      border-top: 1px solid #eee;
      padding-top: 24px;
      margin-top: 32px;
    }

    .support-text {
      margin: 0 0 16px 0;
      font-size: 14px;
      color: #666;
    }

    .support-link {
      color: #2196f3;
      text-decoration: none;
    }

    .support-link:hover {
      text-decoration: underline;
    }

    .error-code {
      font-size: 12px;
      color: #999;
      margin: 0;
      font-family: monospace;
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

    /* Responsive */
    @media (max-width: 600px) {
      .error-page-container {
        padding: 16px;
      }

      .error-card {
        padding: 24px 16px;
      }

      .error-icon {
        font-size: 60px;
        width: 60px;
        height: 60px;
      }

      .error-title {
        font-size: 24px;
      }

      .error-message {
        font-size: 14px;
      }

      .action-button {
        width: 100%;
        min-width: auto;
      }

      .error-actions {
        align-items: stretch;
      }
    }

    @media (min-width: 601px) {
      .error-actions {
        flex-direction: row;
        justify-content: center;
        flex-wrap: wrap;
      }

      .action-button {
        flex: 0 0 auto;
      }
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
      .error-page-container {
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      }

      .error-card {
        background: #333;
        color: white;
      }

      .error-title {
        color: white;
      }

      .error-message {
        color: #ccc;
      }

      .support-text {
        color: #ccc;
      }

      .error-code {
        color: #999;
      }

      .details-content {
        background: #444;
        border-left-color: #666;
      }

      .custom-action {
        background-color: #444;
        border-color: #666;
        color: white;
      }
    }
  `]
})
export class ErrorPageComponent {
  @Input() error?: AppError;
  @Input() config: ErrorPageConfig = {};

  @Output() refresh = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  showDetails = false;

  get displayTitle(): string {
    if (this.config.title) {
      return this.config.title;
    }

    if (this.error) {
      switch (this.error.code) {
        case 'NETWORK_ERROR':
          return 'Sin conexión';
        case 'UNAUTHORIZED':
          return 'Sesión expirada';
        case 'FORBIDDEN':
          return 'Sin permisos';
        case 'NOT_FOUND':
          return 'Página no encontrada';
        case 'INTERNAL_SERVER_ERROR':
          return 'Error del servidor';
        case 'TOO_MANY_REQUESTS':
          return 'Demasiadas solicitudes';
        default:
          return 'Algo salió mal';
      }
    }

    return 'Error inesperado';
  }

  get displayMessage(): string {
    if (this.config.message) {
      return this.config.message;
    }

    return this.error?.userMessage || 'Ocurrió un error inesperado. Por favor, inténtalo nuevamente.';
  }

  get displayIcon(): string {
    if (this.config.icon) {
      return this.config.icon;
    }

    if (this.error) {
      switch (this.error.code) {
        case 'NETWORK_ERROR':
          return 'wifi_off';
        case 'UNAUTHORIZED':
          return 'lock';
        case 'FORBIDDEN':
          return 'block';
        case 'NOT_FOUND':
          return 'search_off';
        case 'INTERNAL_SERVER_ERROR':
          return 'dns';
        case 'TOO_MANY_REQUESTS':
          return 'timer';
        default:
          return 'error_outline';
      }
    }

    return 'error_outline';
  }

  get iconClass(): string {
    if (this.error) {
      switch (this.error.code) {
        case 'NETWORK_ERROR':
          return 'network';
        case 'TOO_MANY_REQUESTS':
          return 'warning';
        case 'NOT_FOUND':
          return 'info';
        default:
          return 'error';
      }
    }

    return 'error';
  }

  onRefresh(): void {
    this.refresh.emit();
    window.location.reload();
  }

  onBack(): void {
    this.back.emit();
    window.history.back();
  }
}

// Configuraciones predefinidas para errores comunes
export const ERROR_PAGE_CONFIGS = {
  network: {
    title: 'Sin conexión',
    message: 'Verifica tu conexión a internet e inténtalo nuevamente.',
    icon: 'wifi_off',
    showBackButton: false,
    showHomeButton: false
  } as ErrorPageConfig,

  notFound: {
    title: 'Página no encontrada',
    message: 'La página que buscas no existe o ha sido movida.',
    icon: 'search_off',
    showRefreshButton: false,
    showBackButton: true
  } as ErrorPageConfig,

  forbidden: {
    title: 'Sin permisos',
    message: 'No tienes permisos para acceder a esta sección.',
    icon: 'block',
    showRefreshButton: false,
    showBackButton: true
  } as ErrorPageConfig,

  serverError: {
    title: 'Error del servidor',
    message: 'Nuestros servidores están experimentando problemas. Inténtalo más tarde.',
    icon: 'dns',
    showBackButton: true
  } as ErrorPageConfig,

  maintenance: {
    title: 'Mantenimiento programado',
    message: 'Estamos realizando mejoras en nuestro sistema. Volveremos pronto.',
    icon: 'build',
    showRefreshButton: false,
    showHomeButton: false,
    showBackButton: false
  } as ErrorPageConfig
};