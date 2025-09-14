/**
 * Componente reutilizable para mostrar spinners de carga
 */

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ResponsiveService } from '../../services/responsive.service';
import { Subject, takeUntil } from 'rxjs';

export type SpinnerSize = 'small' | 'medium' | 'large';
export type SpinnerType = 'circular' | 'linear' | 'dots' | 'pulse';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="loading-container" [class]="containerClass">
      <!-- Circular spinner (Material) -->
      <div *ngIf="type === 'circular'" class="circular-spinner">
        <mat-spinner
          [diameter]="spinnerDiameter"
          [strokeWidth]="strokeWidth"
          [color]="color">
        </mat-spinner>
        <div *ngIf="message" class="loading-message">
          {{ message }}
        </div>
      </div>

      <!-- Linear progress bar -->
      <div *ngIf="type === 'linear'" class="linear-spinner">
        <div class="linear-progress">
          <div class="linear-progress-bar"></div>
        </div>
        <div *ngIf="message" class="loading-message">
          {{ message }}
        </div>
      </div>

      <!-- Dots animation -->
      <div *ngIf="type === 'dots'" class="dots-spinner">
        <div class="dots-container">
          <div class="dot" [style.--delay]="'0s'"></div>
          <div class="dot" [style.--delay]="'0.2s'"></div>
          <div class="dot" [style.--delay]="'0.4s'"></div>
        </div>
        <div *ngIf="message" class="loading-message">
          {{ message }}
        </div>
      </div>

      <!-- Pulse animation -->
      <div *ngIf="type === 'pulse'" class="pulse-spinner">
        <div class="pulse-circle"></div>
        <div *ngIf="message" class="loading-message">
          {{ message }}
        </div>
      </div>

      <!-- Overlay mode -->
      <div *ngIf="overlay" class="spinner-overlay" (click)="onOverlayClick($event)">
        <div class="overlay-content" [class]="overlayContentClass">
          <div [ngSwitch]="type">
            <!-- Circular for overlay -->
            <div *ngSwitchCase="'circular'">
              <mat-spinner
                [diameter]="spinnerDiameter"
                [strokeWidth]="strokeWidth"
                color="accent">
              </mat-spinner>
            </div>

            <!-- Dots for overlay -->
            <div *ngSwitchCase="'dots'" class="dots-container overlay-dots">
              <div class="dot overlay-dot" [style.--delay]="'0s'"></div>
              <div class="dot overlay-dot" [style.--delay]="'0.2s'"></div>
              <div class="dot overlay-dot" [style.--delay]="'0.4s'"></div>
            </div>

            <!-- Default to circular -->
            <div *ngSwitchDefault>
              <mat-spinner [diameter]="spinnerDiameter" color="accent"></mat-spinner>
            </div>
          </div>

          <div *ngIf="message" class="overlay-message">
            {{ message }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .loading-container.inline {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }

    .loading-container.center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .loading-message {
      margin-top: 16px;
      text-align: center;
      color: #666;
      font-size: 14px;
      font-weight: 400;
    }

    .loading-container.inline .loading-message {
      margin-top: 0;
      margin-left: 8px;
    }

    /* Linear Spinner */
    .linear-spinner {
      width: 100%;
      max-width: 300px;
    }

    .linear-progress {
      width: 100%;
      height: 4px;
      background-color: #e0e0e0;
      border-radius: 2px;
      overflow: hidden;
      position: relative;
    }

    .linear-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #3f51b5, #2196f3);
      border-radius: 2px;
      animation: linearProgress 1.5s ease-in-out infinite;
    }

    @keyframes linearProgress {
      0% {
        transform: translateX(-100%);
      }
      50% {
        transform: translateX(0%);
      }
      100% {
        transform: translateX(100%);
      }
    }

    /* Dots Spinner */
    .dots-container {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .dot {
      width: 8px;
      height: 8px;
      background-color: #3f51b5;
      border-radius: 50%;
      animation: dotBounce 1.4s ease-in-out infinite both;
      animation-delay: var(--delay);
    }

    .dot.small {
      width: 6px;
      height: 6px;
    }

    .dot.large {
      width: 12px;
      height: 12px;
    }

    @keyframes dotBounce {
      0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* Pulse Spinner */
    .pulse-circle {
      width: 40px;
      height: 40px;
      background-color: #3f51b5;
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .pulse-circle.small {
      width: 24px;
      height: 24px;
    }

    .pulse-circle.large {
      width: 60px;
      height: 60px;
    }

    @keyframes pulse {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 0;
      }
    }

    /* Overlay Styles */
    .spinner-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(2px);
    }

    .overlay-content {
      background: white;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 300px;
      min-width: 200px;
    }

    .overlay-content.transparent {
      background: transparent;
      box-shadow: none;
    }

    .overlay-message {
      margin-top: 16px;
      text-align: center;
      color: #333;
      font-size: 16px;
      font-weight: 500;
    }

    .overlay-content.transparent .overlay-message {
      color: white;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    }

    .overlay-dots .overlay-dot {
      background-color: white;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }

    /* Size variations */
    .loading-container.small .loading-message {
      font-size: 12px;
      margin-top: 8px;
    }

    .loading-container.large .loading-message {
      font-size: 16px;
      margin-top: 20px;
    }

    /* Animation entrance */
    .loading-container {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive Design */

    /* Móviles pequeños (< 576px) */
    @media (max-width: 575.98px) {
      .loading-container {
        padding: 8px;
      }

      .loading-message {
        font-size: 12px;
        margin-top: 12px;
      }

      .loading-container.inline .loading-message {
        font-size: 11px;
        margin-left: 6px;
      }

      .overlay-content {
        margin: 16px;
        padding: 20px;
        min-width: auto;
        max-width: calc(100vw - 32px);
      }

      .overlay-message {
        font-size: 14px;
        line-height: 1.4;
      }

      .dots-container {
        gap: 6px;
      }

      .dot {
        width: 6px;
        height: 6px;
      }

      .pulse-circle {
        width: 32px;
        height: 32px;
      }

      .linear-progress {
        height: 3px;
        max-width: 250px;
      }
    }

    /* Móviles grandes (576px - 767.98px) */
    @media (min-width: 576px) and (max-width: 767.98px) {
      .loading-container {
        padding: 12px;
      }

      .loading-message {
        font-size: 13px;
        margin-top: 14px;
      }

      .overlay-content {
        margin: 20px;
        padding: 28px;
        max-width: calc(100vw - 40px);
      }

      .overlay-message {
        font-size: 15px;
      }

      .dots-container {
        gap: 7px;
      }

      .pulse-circle {
        width: 36px;
        height: 36px;
      }
    }

    /* Tablets (768px - 991.98px) */
    @media (min-width: 768px) and (max-width: 991.98px) {
      .loading-container {
        padding: 16px;
      }

      .overlay-content {
        margin: 24px;
        padding: 32px;
        max-width: 500px;
      }

      .overlay-message {
        font-size: 16px;
      }
    }

    /* Desktop pequeño (992px - 1199.98px) */
    @media (min-width: 992px) and (max-width: 1199.98px) {
      .overlay-content {
        padding: 36px;
        max-width: 550px;
      }
    }

    /* Desktop grande (≥ 1200px) */
    @media (min-width: 1200px) {
      .overlay-content {
        padding: 40px;
        max-width: 600px;
      }

      .overlay-message {
        font-size: 18px;
      }
    }

    /* Orientación landscape en móviles */
    @media (max-height: 500px) and (orientation: landscape) {
      .overlay-content {
        padding: 16px 24px;
        margin: 8px;
        max-height: 90vh;
        overflow-y: auto;
      }

      .overlay-message {
        font-size: 14px;
        margin-top: 12px;
      }

      .loading-message {
        font-size: 12px;
        margin-top: 10px;
      }
    }

    /* Mejoras para dispositivos táctiles */
    @media (hover: none) and (pointer: coarse) {
      .overlay-content {
        padding: 24px 20px;
      }

      .loading-container.inline {
        gap: 8px;
      }

      /* Aumentar área táctil para botones */
      button {
        min-height: 44px;
        padding: 8px 16px;
      }
    }

    /* Soporte para safe area (notch en móviles) */
    @supports (padding-top: env(safe-area-inset-top)) {
      @media (max-width: 575.98px) {
        .overlay-content {
          margin-top: max(16px, env(safe-area-inset-top));
          margin-bottom: max(16px, env(safe-area-inset-bottom));
          margin-left: max(16px, env(safe-area-inset-left));
          margin-right: max(16px, env(safe-area-inset-right));
        }
      }
    }

    /* Reducir motion para usuarios con sensibilidad */
    @media (prefers-reduced-motion: reduce) {
      .loading-container {
        animation: none;
      }

      .strength-bar,
      .dot,
      .pulse-circle,
      .linear-progress-bar {
        animation-duration: 2s;
        animation-timing-function: linear;
      }
    }

    /* High contrast mode */
    @media (prefers-contrast: high) {
      .loading-container {
        border: 2px solid currentColor;
      }

      .overlay-content {
        border: 2px solid currentColor;
      }

      .strength-bar,
      .dot {
        border: 1px solid currentColor;
      }
    }
  `]
})
export class LoadingSpinnerComponent implements OnInit, OnDestroy {
  @Input() type: SpinnerType = 'circular';
  @Input() size: SpinnerSize = 'medium';
  @Input() message?: string;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() overlay = false;
  @Input() overlayTransparent = false;
  @Input() center = false;
  @Input() inline = false;

  spinnerDiameter = 40;
  strokeWidth = 4;
  containerClass = '';
  overlayContentClass = '';

  private destroy$ = new Subject<void>();

  constructor(private responsiveService: ResponsiveService) {}

  ngOnInit(): void {
    this.setupSizes();
    this.setupClasses();
    this.setupResponsiveUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupResponsiveUpdates(): void {
    this.responsiveService.screenSize$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.adjustForScreenSize();
      });
  }

  private adjustForScreenSize(): void {
    const screenSize = this.responsiveService.currentScreenSize;

    // Ajustar tamaños automáticamente en dispositivos móviles
    if (screenSize.isMobile) {
      switch (this.size) {
        case 'small':
          this.spinnerDiameter = 20;
          this.strokeWidth = 2;
          break;
        case 'medium':
          this.spinnerDiameter = 32;
          this.strokeWidth = 3;
          break;
        case 'large':
          this.spinnerDiameter = 48;
          this.strokeWidth = 4;
          break;
      }
    } else {
      this.setupSizes(); // Usar tamaños normales
    }
  }

  private setupSizes(): void {
    switch (this.size) {
      case 'small':
        this.spinnerDiameter = 24;
        this.strokeWidth = 3;
        break;
      case 'medium':
        this.spinnerDiameter = 40;
        this.strokeWidth = 4;
        break;
      case 'large':
        this.spinnerDiameter = 60;
        this.strokeWidth = 5;
        break;
    }
  }

  private setupClasses(): void {
    const classes = [];

    if (this.center) classes.push('center');
    if (this.inline) classes.push('inline');
    if (this.size) classes.push(this.size);

    this.containerClass = classes.join(' ');

    // Overlay content classes
    const overlayClasses = [];
    if (this.overlayTransparent) overlayClasses.push('transparent');
    this.overlayContentClass = overlayClasses.join(' ');
  }

  onOverlayClick(event: Event): void {
    // Prevenir cierre al hacer click en el contenido
    if ((event.target as Element).classList.contains('spinner-overlay')) {
      // Se podría emitir un evento para permitir cerrar el overlay
      // this.overlayClick.emit();
    }
  }
}