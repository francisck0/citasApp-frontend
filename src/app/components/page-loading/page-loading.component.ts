/**
 * Componente para estados de carga de página completa
 */

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { LoadingService } from '../../services/loading.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-page-loading',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="page-loading-container" *ngIf="isVisible">
      <div class="loading-backdrop" [class.blur]="blurBackground"></div>

      <div class="loading-content">
        <div class="loading-card" [class.elevated]="elevated">
          <div class="loading-header" *ngIf="title">
            <h3>{{ title }}</h3>
          </div>

          <div class="loading-body">
            <app-loading-spinner
              [type]="spinnerType"
              [size]="spinnerSize"
              [message]="message"
              [color]="spinnerColor">
            </app-loading-spinner>

            <div class="loading-details" *ngIf="details">
              <p>{{ details }}</p>
            </div>

            <div class="loading-progress" *ngIf="showProgress && progress !== undefined">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  [style.width.%]="progress">
                </div>
              </div>
              <div class="progress-text">
                {{ progress }}% completado
              </div>
            </div>

            <div class="loading-steps" *ngIf="steps && steps.length > 0">
              <div
                class="step"
                *ngFor="let step of steps; let i = index"
                [class.active]="i === currentStep"
                [class.completed]="i < currentStep">
                <div class="step-indicator">
                  <span *ngIf="i < currentStep">✓</span>
                  <span *ngIf="i === currentStep" class="step-spinner"></span>
                  <span *ngIf="i > currentStep">{{ i + 1 }}</span>
                </div>
                <div class="step-text">
                  {{ step }}
                </div>
              </div>
            </div>
          </div>

          <div class="loading-footer" *ngIf="showCancel">
            <button
              type="button"
              class="cancel-button"
              (click)="onCancel()"
              [disabled]="cancelDisabled">
              {{ cancelText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-loading-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease-out;
    }

    .loading-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
    }

    .loading-backdrop.blur {
      backdrop-filter: blur(4px);
      background: rgba(255, 255, 255, 0.8);
    }

    .loading-content {
      position: relative;
      z-index: 1;
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
    }

    .loading-card {
      background: white;
      border-radius: 16px;
      padding: 32px;
      min-width: 300px;
      max-width: 500px;
      text-align: center;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    .loading-card.elevated {
      box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.1),
        0 8px 16px rgba(0, 0, 0, 0.05);
    }

    .loading-header {
      margin-bottom: 24px;
    }

    .loading-header h3 {
      margin: 0;
      color: #333;
      font-size: 24px;
      font-weight: 600;
    }

    .loading-body {
      margin-bottom: 24px;
    }

    .loading-details {
      margin-top: 16px;
    }

    .loading-details p {
      margin: 0;
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }

    /* Progress Bar */
    .loading-progress {
      margin-top: 24px;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3f51b5, #2196f3);
      transition: width 0.3s ease;
      border-radius: 4px;
    }

    .progress-text {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    /* Steps */
    .loading-steps {
      margin-top: 24px;
      text-align: left;
    }

    .step {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      transition: all 0.3s ease;
    }

    .step:last-child {
      margin-bottom: 0;
    }

    .step-indicator {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      font-size: 14px;
      font-weight: bold;
      flex-shrink: 0;
      border: 2px solid #e0e0e0;
      background: white;
      color: #999;
      transition: all 0.3s ease;
    }

    .step.active .step-indicator {
      border-color: #3f51b5;
      background: #3f51b5;
      color: white;
    }

    .step.completed .step-indicator {
      border-color: #4caf50;
      background: #4caf50;
      color: white;
    }

    .step-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .step-text {
      color: #666;
      font-size: 14px;
      flex: 1;
    }

    .step.active .step-text {
      color: #3f51b5;
      font-weight: 500;
    }

    .step.completed .step-text {
      color: #4caf50;
    }

    /* Footer */
    .loading-footer {
      border-top: 1px solid #eee;
      padding-top: 20px;
      margin-top: 20px;
    }

    .cancel-button {
      background: none;
      border: 1px solid #ddd;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      color: #666;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .cancel-button:hover:not(:disabled) {
      border-color: #bbb;
      background: #f5f5f5;
    }

    .cancel-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
      .loading-backdrop {
        background: rgba(0, 0, 0, 0.9);
      }

      .loading-card {
        background: #2d2d2d;
        border-color: rgba(255, 255, 255, 0.1);
      }

      .loading-header h3 {
        color: white;
      }

      .loading-details p {
        color: #ccc;
      }

      .progress-bar {
        background-color: #444;
      }

      .step-text {
        color: #ccc;
      }

      .progress-text {
        color: #ccc;
      }
    }

    /* Mobile responsive */
    @media (max-width: 480px) {
      .loading-card {
        margin: 20px;
        padding: 24px;
        min-width: auto;
      }

      .loading-header h3 {
        font-size: 20px;
      }

      .step-indicator {
        width: 28px;
        height: 28px;
        font-size: 12px;
      }

      .step-text {
        font-size: 13px;
      }
    }
  `]
})
export class PageLoadingComponent implements OnInit, OnDestroy {
  @Input() title?: string;
  @Input() message?: string;
  @Input() details?: string;
  @Input() spinnerType: any = 'circular';
  @Input() spinnerSize: any = 'medium';
  @Input() spinnerColor: any = 'primary';
  @Input() blurBackground = true;
  @Input() elevated = true;

  // Progress
  @Input() showProgress = false;
  @Input() progress?: number;

  // Steps
  @Input() steps?: string[];
  @Input() currentStep = 0;

  // Cancel
  @Input() showCancel = false;
  @Input() cancelText = 'Cancelar';
  @Input() cancelDisabled = false;

  // Control de visibilidad
  @Input() visible = true;
  @Input() loadingId?: string; // Para conectar con LoadingService

  isVisible = false;
  private destroy$ = new Subject<void>();

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    if (this.loadingId) {
      // Suscribirse al estado de carga específico
      this.loadingService.loading$
        .pipe(takeUntil(this.destroy$))
        .subscribe(states => {
          const loadingState = states.find(s => s.id === this.loadingId);
          this.isVisible = !!loadingState?.isLoading;
          if (loadingState?.message) {
            this.message = loadingState.message;
          }
        });
    } else {
      this.isVisible = this.visible;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCancel(): void {
    // Emitir evento de cancelación o llamar método específico
    console.log('Cancel clicked');
    // En una implementación real, se podría emitir un Output event
  }
}