/**
 * Componente Dashboard Principal
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, forkJoin, takeUntil } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { CitaService } from '../../services/cita.service';
import { UsuarioService } from '../../services/usuario.service';
import { NegocioService } from '../../services/negocio.service';
import { Usuario } from '../../models/usuario.model';
import { Cita } from '../../models/cita.model';
import { Negocio } from '../../models/negocio.model';
import { UsuarioEstadisticasDTO } from '../../interfaces/usuario-dtos.interface';
import { CitaEstadisticasDTO } from '../../interfaces/cita-dtos.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Encabezado de Bienvenida -->
      <div class="welcome-header" *ngIf="usuario">
        <div class="welcome-content">
          <h1>¡Hola, {{ usuario.nombre }}!</h1>
          <p>Bienvenido de vuelta. Aquí tienes un resumen de tu actividad.</p>
        </div>
        <div class="welcome-avatar">
          <div class="avatar-container">
            <img
              *ngIf="usuario.foto; else defaultAvatar"
              [src]="usuario.foto"
              [alt]="usuario.nombreCompleto"
              class="user-avatar">
            <ng-template #defaultAvatar>
              <div class="avatar-placeholder">
                {{ usuario.iniciales }}
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner></mat-spinner>
        <p>Cargando tu dashboard...</p>
      </div>

      <!-- Dashboard Content -->
      <div class="dashboard-content" *ngIf="!loading">
        <!-- Estadísticas Principales -->
        <div class="stats-grid">
          <mat-card class="stat-card primary">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <mat-icon>event</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ estadisticasUsuario?.proximasCitas || 0 }}</h3>
                  <p>Próximas Citas</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card success">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <mat-icon>check_circle</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ estadisticasUsuario?.citasCompletadas || 0 }}</h3>
                  <p>Citas Completadas</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card warning">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <mat-icon>cancel</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ estadisticasUsuario?.citasCanceladas || 0 }}</h3>
                  <p>Citas Canceladas</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card accent">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <mat-icon>favorite</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ estadisticasUsuario?.profesionalesFavoritos || 0 }}</h3>
                  <p>Profesionales Favoritos</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Próximas Citas -->
        <mat-card class="section-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>schedule</mat-icon>
              Próximas Citas
            </mat-card-title>
            <div class="card-actions">
              <button mat-button routerLink="/citas">Ver Todas</button>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="citas-list" *ngIf="citasProximas.length > 0; else noCitas">
              <div class="cita-item" *ngFor="let cita of citasProximas">
                <div class="cita-date">
                  <div class="date-day">{{ cita.fecha.getDate() }}</div>
                  <div class="date-month">{{ getMonthName(cita.fecha) }}</div>
                </div>
                <div class="cita-info">
                  <h4>{{ cita.profesionalNombre }}</h4>
                  <p class="categoria">{{ cita.categoriaNombre }}</p>
                  <p class="negocio">{{ cita.negocioNombre }}</p>
                  <div class="cita-details">
                    <span class="hora">
                      <mat-icon>access_time</mat-icon>
                      {{ cita.horaFormateada }}
                    </span>
                    <span class="duracion">
                      <mat-icon>timelapse</mat-icon>
                      {{ cita.duracionFormateada }}
                    </span>
                    <span class="precio" *ngIf="cita.precio">
                      <mat-icon>euro</mat-icon>
                      {{ cita.precioFormateado }}
                    </span>
                  </div>
                </div>
                <div class="cita-actions">
                  <mat-chip
                    [color]="getCitaStatusColor(cita.estado)"
                    selected>
                    {{ cita.estadoDisplay }}
                  </mat-chip>
                  <button
                    mat-icon-button
                    matTooltip="Ver detalles"
                    routerLink="/citas/{{ cita.id }}">
                    <mat-icon>info</mat-icon>
                  </button>
                </div>
              </div>
            </div>
            <ng-template #noCitas>
              <div class="empty-state">
                <mat-icon>event_available</mat-icon>
                <h3>No tienes citas próximas</h3>
                <p>¡Es un buen momento para programar una nueva cita!</p>
                <button mat-raised-button color="primary" routerLink="/buscar">
                  Buscar Profesionales
                </button>
              </div>
            </ng-template>
          </mat-card-content>
        </mat-card>

        <!-- Profesionales Favoritos -->
        <mat-card class="section-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>favorite</mat-icon>
              Profesionales Favoritos
            </mat-card-title>
            <div class="card-actions">
              <button mat-button routerLink="/favoritos">Ver Todos</button>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="favoritos-grid" *ngIf="negociosFavoritos.length > 0; else noFavoritos">
              <div class="favorito-item" *ngFor="let negocio of negociosFavoritos">
                <div class="favorito-image">
                  <img
                    *ngIf="negocio.fotoPrincipal; else defaultImage"
                    [src]="negocio.fotoPrincipal.url"
                    [alt]="negocio.nombre">
                  <ng-template #defaultImage>
                    <div class="default-image">
                      <mat-icon>business</mat-icon>
                    </div>
                  </ng-template>
                </div>
                <div class="favorito-info">
                  <h4>{{ negocio.nombre }}</h4>
                  <p class="tipo">{{ negocio.tipoNegocioDisplay }}</p>
                  <p class="ubicacion">{{ negocio.direccionCorta }}</p>
                  <div class="calificacion" *ngIf="negocio.calificacion">
                    <mat-icon class="star-icon">star</mat-icon>
                    <span>{{ negocio.calificacionFormateada }}</span>
                    <span class="reseñas">({{ negocio.totalReseñas }})</span>
                  </div>
                </div>
                <div class="favorito-actions">
                  <button mat-icon-button routerLink="/negocios/{{ negocio.id }}">
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                </div>
              </div>
            </div>
            <ng-template #noFavoritos>
              <div class="empty-state">
                <mat-icon>favorite_border</mat-icon>
                <h3>No tienes favoritos aún</h3>
                <p>Marca tus negocios favoritos para acceder rápidamente a ellos</p>
                <button mat-raised-button color="accent" routerLink="/buscar">
                  Explorar Negocios
                </button>
              </div>
            </ng-template>
          </mat-card-content>
        </mat-card>

        <!-- Acciones Rápidas -->
        <mat-card class="section-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>flash_on</mat-icon>
              Acciones Rápidas
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="quick-actions-grid">
              <button mat-raised-button class="action-button" routerLink="/citas">
                <mat-icon>event</mat-icon>
                <span>Mis Citas</span>
              </button>

              <button mat-raised-button class="action-button" routerLink="/buscar">
                <mat-icon>search</mat-icon>
                <span>Buscar Profesionales</span>
              </button>

              <button mat-raised-button class="action-button" routerLink="/perfil">
                <mat-icon>person</mat-icon>
                <span>Mi Perfil</span>
              </button>

              <button mat-raised-button class="action-button" routerLink="/historial">
                <mat-icon>history</mat-icon>
                <span>Historial</span>
              </button>

              <button mat-raised-button class="action-button" routerLink="/favoritos">
                <mat-icon>favorite</mat-icon>
                <span>Favoritos</span>
              </button>

              <button mat-raised-button class="action-button" routerLink="/configuracion">
                <mat-icon>settings</mat-icon>
                <span>Configuración</span>
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .welcome-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px;
      border-radius: 16px;
      margin-bottom: 32px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .welcome-content h1 {
      margin: 0 0 8px 0;
      font-size: 2rem;
      font-weight: 500;
    }

    .welcome-content p {
      margin: 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .avatar-container {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid rgba(255, 255, 255, 0.2);
    }

    .user-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 500;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .stat-card.primary {
      background: linear-gradient(135deg, #2196f3, #21cbf3);
      color: white;
    }

    .stat-card.success {
      background: linear-gradient(135deg, #4caf50, #8bc34a);
      color: white;
    }

    .stat-card.warning {
      background: linear-gradient(135deg, #ff9800, #ffc107);
      color: white;
    }

    .stat-card.accent {
      background: linear-gradient(135deg, #e91e63, #f48fb1);
      color: white;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      background: rgba(255, 255, 255, 0.2);
      padding: 12px;
      border-radius: 12px;
    }

    .stat-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 300;
      line-height: 1;
    }

    .stat-info p {
      margin: 4px 0 0 0;
      opacity: 0.9;
      font-size: 1rem;
    }

    .section-card {
      margin-bottom: 32px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .section-card mat-card-header {
      background-color: #fafafa;
      border-radius: 12px 12px 0 0;
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }

    .card-actions button {
      color: #2196f3;
    }

    .citas-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cita-item {
      display: flex;
      align-items: center;
      padding: 20px;
      background: #fafafa;
      border-radius: 12px;
      transition: background-color 0.2s;
    }

    .cita-item:hover {
      background: #f0f0f0;
    }

    .cita-date {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 20px;
      min-width: 60px;
    }

    .date-day {
      font-size: 2rem;
      font-weight: bold;
      color: #2196f3;
      line-height: 1;
    }

    .date-month {
      font-size: 0.9rem;
      color: #666;
      text-transform: uppercase;
    }

    .cita-info {
      flex: 1;
    }

    .cita-info h4 {
      margin: 0 0 4px 0;
      font-size: 1.1rem;
      color: #333;
    }

    .categoria {
      margin: 0 0 4px 0;
      color: #2196f3;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .negocio {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 0.9rem;
    }

    .cita-details {
      display: flex;
      gap: 16px;
      align-items: center;
      font-size: 0.85rem;
      color: #666;
    }

    .cita-details span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .cita-details mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .cita-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .favoritos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .favorito-item {
      display: flex;
      align-items: center;
      padding: 16px;
      background: #fafafa;
      border-radius: 12px;
      transition: background-color 0.2s;
    }

    .favorito-item:hover {
      background: #f0f0f0;
    }

    .favorito-image {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      margin-right: 16px;
      flex-shrink: 0;
    }

    .favorito-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .default-image {
      width: 100%;
      height: 100%;
      background: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
    }

    .favorito-info {
      flex: 1;
    }

    .favorito-info h4 {
      margin: 0 0 4px 0;
      font-size: 1rem;
      color: #333;
    }

    .tipo {
      margin: 0 0 2px 0;
      color: #2196f3;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .ubicacion {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 0.85rem;
    }

    .calificacion {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.85rem;
    }

    .star-icon {
      color: #ffc107;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .reseñas {
      color: #666;
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .action-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 24px 16px;
      height: 100px;
      background: white;
      color: #333;
      border: 2px solid #e0e0e0;
      transition: all 0.2s;
    }

    .action-button:hover {
      border-color: #2196f3;
      color: #2196f3;
      background: #f3f7ff;
    }

    .action-button mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #ccc;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .empty-state p {
      margin: 0 0 24px 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .welcome-header {
        flex-direction: column;
        text-align: center;
        gap: 20px;
        padding: 24px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .cita-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .cita-date {
        align-self: flex-start;
        margin-right: 0;
      }

      .cita-details {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .favoritos-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .action-button {
        height: 80px;
        padding: 16px 12px;
      }

      .action-button mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    @media (max-width: 480px) {
      .quick-actions-grid {
        grid-template-columns: 1fr;
      }

      .welcome-content h1 {
        font-size: 1.5rem;
      }

      .stat-info h3 {
        font-size: 2rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  usuario: Usuario | null = null;
  loading = true;

  // Datos del dashboard
  estadisticasUsuario: UsuarioEstadisticasDTO | null = null;
  estadisticasCitas: CitaEstadisticasDTO | null = null;
  citasProximas: Cita[] = [];
  negociosFavoritos: Negocio[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private citaService: CitaService,
    private usuarioService: UsuarioService,
    private negocioService: NegocioService
  ) {}

  ngOnInit(): void {
    // Obtener usuario actual
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.usuario = user;
        if (user) {
          this.cargarDatosDashboard();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga todos los datos del dashboard
   */
  private cargarDatosDashboard(): void {
    this.loading = true;

    forkJoin({
      estadisticasUsuario: this.usuarioService.obtenerEstadisticas(),
      estadisticasCitas: this.citaService.obtenerEstadisticasCitas(),
      citasProximas: this.citaService.obtenerCitasProximas(),
      negociosFavoritos: this.negocioService.obtenerNegociosFavoritos()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.estadisticasUsuario = data.estadisticasUsuario;
        this.estadisticasCitas = data.estadisticasCitas;
        this.citasProximas = data.citasProximas.slice(0, 5); // Mostrar solo las primeras 5
        this.negociosFavoritos = data.negociosFavoritos.slice(0, 4); // Mostrar solo los primeros 4
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando dashboard:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Obtiene el nombre del mes
   */
  getMonthName(date: Date): string {
    const months = [
      'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
      'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
    ];
    return months[date.getMonth()];
  }

  /**
   * Obtiene el color del chip según el estado de la cita
   */
  getCitaStatusColor(estado: string): 'primary' | 'accent' | 'warn' | undefined {
    switch (estado) {
      case 'CONFIRMADA':
        return 'primary';
      case 'PENDIENTE':
        return 'accent';
      case 'CANCELADA':
        return 'warn';
      default:
        return undefined;
    }
  }
}