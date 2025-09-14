/**
 * Componente Header/Navbar principal
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { APP_CONFIG } from '../../config/app.config';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary" class="header-toolbar">
      <!-- Logo y Título -->
      <div class="logo-section" routerLink="/">
        <img
          [src]="appConfig.app.logo"
          [alt]="appConfig.app.name"
          class="logo"
          (error)="onLogoError($event)">
        <span class="app-name">{{ appConfig.app.name }}</span>
      </div>

      <!-- Navegación Principal (Desktop) -->
      <nav class="main-nav" *ngIf="!isMobile">
        <a
          mat-button
          routerLink="/dashboard"
          routerLinkActive="active"
          class="nav-link">
          <mat-icon>dashboard</mat-icon>
          Dashboard
        </a>

        <a
          mat-button
          routerLink="/citas"
          routerLinkActive="active"
          class="nav-link">
          <mat-icon>event</mat-icon>
          Mis Citas
          <span
            class="notification-badge"
            *ngIf="citasProximas > 0"
            [matBadge]="citasProximas"
            matBadgeColor="accent"
            matBadgeSize="small">
          </span>
        </a>

        <a
          mat-button
          routerLink="/buscar"
          routerLinkActive="active"
          class="nav-link">
          <mat-icon>search</mat-icon>
          Buscar
        </a>

        <a
          mat-button
          routerLink="/favoritos"
          routerLinkActive="active"
          class="nav-link"
          *ngIf="usuario">
          <mat-icon>favorite</mat-icon>
          Favoritos
        </a>
      </nav>

      <!-- Spacer -->
      <div class="spacer"></div>

      <!-- Área de Usuario -->
      <div class="user-area" *ngIf="usuario; else loginSection">
        <!-- Notificaciones -->
        <button
          mat-icon-button
          class="notification-btn"
          matTooltip="Notificaciones"
          [matBadge]="notificacionesPendientes"
          [matBadgeHidden]="notificacionesPendientes === 0"
          matBadgeColor="warn"
          matBadgeSize="small">
          <mat-icon>notifications</mat-icon>
        </button>

        <!-- Menú de Usuario -->
        <button
          mat-button
          [matMenuTriggerFor]="userMenu"
          class="user-menu-trigger">
          <div class="user-info">
            <div class="user-avatar">
              <img
                *ngIf="usuario.foto; else defaultAvatar"
                [src]="usuario.foto"
                [alt]="usuario.nombreCompleto"
                class="avatar-img">
              <ng-template #defaultAvatar>
                <div class="avatar-placeholder">
                  {{ usuario.iniciales }}
                </div>
              </ng-template>
            </div>
            <div class="user-details" *ngIf="!isMobile">
              <span class="user-name">{{ usuario.nombre }}</span>
              <span class="user-role">{{ getUserRoleDisplay() }}</span>
            </div>
            <mat-icon class="dropdown-icon">arrow_drop_down</mat-icon>
          </div>
        </button>

        <!-- Menú Desplegable de Usuario -->
        <mat-menu #userMenu="matMenu" class="user-dropdown">
          <div class="user-header">
            <div class="user-avatar-large">
              <img
                *ngIf="usuario.foto; else defaultAvatarLarge"
                [src]="usuario.foto"
                [alt]="usuario.nombreCompleto">
              <ng-template #defaultAvatarLarge>
                <div class="avatar-placeholder-large">
                  {{ usuario.iniciales }}
                </div>
              </ng-template>
            </div>
            <div class="user-info-large">
              <h4>{{ usuario.nombreCompleto }}</h4>
              <p>{{ usuario.email }}</p>
              <span class="user-status" [class]="'status-' + usuario.estado.toLowerCase()">
                {{ usuario.estado }}
              </span>
            </div>
          </div>

          <mat-divider></mat-divider>

          <button mat-menu-item routerLink="/perfil">
            <mat-icon>person</mat-icon>
            <span>Mi Perfil</span>
          </button>

          <button mat-menu-item routerLink="/configuracion">
            <mat-icon>settings</mat-icon>
            <span>Configuración</span>
          </button>

          <button mat-menu-item routerLink="/historial">
            <mat-icon>history</mat-icon>
            <span>Historial</span>
          </button>

          <button mat-menu-item *ngIf="usuario.esProfesional" routerLink="/profesional/dashboard">
            <mat-icon>business</mat-icon>
            <span>Panel Profesional</span>
          </button>

          <button mat-menu-item *ngIf="usuario.esAdmin" routerLink="/admin">
            <mat-icon>admin_panel_settings</mat-icon>
            <span>Administración</span>
          </button>

          <mat-divider></mat-divider>

          <button mat-menu-item routerLink="/ayuda">
            <mat-icon>help</mat-icon>
            <span>Ayuda</span>
          </button>

          <mat-divider></mat-divider>

          <button mat-menu-item (click)="logout()" class="logout-btn">
            <mat-icon>logout</mat-icon>
            <span>Cerrar Sesión</span>
          </button>
        </mat-menu>
      </div>

      <!-- Área de Login (cuando no está autenticado) -->
      <ng-template #loginSection>
        <div class="login-section">
          <button mat-button routerLink="/login" class="login-btn">
            <mat-icon>login</mat-icon>
            Iniciar Sesión
          </button>
          <button mat-raised-button color="accent" routerLink="/registro" class="register-btn">
            Registrarse
          </button>
        </div>
      </ng-template>

      <!-- Menú Mobile -->
      <button
        mat-icon-button
        class="mobile-menu-btn"
        *ngIf="isMobile"
        [matMenuTriggerFor]="mobileMenu">
        <mat-icon>menu</mat-icon>
      </button>

      <mat-menu #mobileMenu="matMenu" class="mobile-dropdown">
        <button mat-menu-item routerLink="/dashboard" *ngIf="usuario">
          <mat-icon>dashboard</mat-icon>
          <span>Dashboard</span>
        </button>

        <button mat-menu-item routerLink="/citas" *ngIf="usuario">
          <mat-icon>event</mat-icon>
          <span>Mis Citas</span>
          <span class="mobile-badge" *ngIf="citasProximas > 0">{{ citasProximas }}</span>
        </button>

        <button mat-menu-item routerLink="/buscar">
          <mat-icon>search</mat-icon>
          <span>Buscar</span>
        </button>

        <button mat-menu-item routerLink="/favoritos" *ngIf="usuario">
          <mat-icon>favorite</mat-icon>
          <span>Favoritos</span>
        </button>

        <mat-divider *ngIf="!usuario"></mat-divider>

        <button mat-menu-item routerLink="/login" *ngIf="!usuario">
          <mat-icon>login</mat-icon>
          <span>Iniciar Sesión</span>
        </button>

        <button mat-menu-item routerLink="/registro" *ngIf="!usuario">
          <mat-icon>person_add</mat-icon>
          <span>Registrarse</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      display: flex;
      align-items: center;
      padding: 0 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .logo-section {
      display: flex;
      align-items: center;
      cursor: pointer;
      margin-right: 24px;
    }

    .logo {
      height: 32px;
      width: auto;
      margin-right: 8px;
    }

    .app-name {
      font-size: 1.25rem;
      font-weight: 500;
      color: white;
    }

    .main-nav {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-link {
      color: rgba(255, 255, 255, 0.8) !important;
      display: flex;
      align-items: center;
      gap: 4px;
      position: relative;
    }

    .nav-link:hover,
    .nav-link.active {
      color: white !important;
      background-color: rgba(255, 255, 255, 0.1);
    }

    .notification-badge {
      position: relative;
    }

    .spacer {
      flex: 1;
    }

    .user-area {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .notification-btn {
      color: rgba(255, 255, 255, 0.8);
    }

    .notification-btn:hover {
      color: white;
    }

    .user-menu-trigger {
      color: white !important;
      padding: 8px !important;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
    }

    .avatar-img {
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
      font-size: 14px;
      font-weight: 500;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.2;
    }

    .user-name {
      font-size: 14px;
      font-weight: 500;
    }

    .user-role {
      font-size: 12px;
      opacity: 0.8;
    }

    .dropdown-icon {
      font-size: 20px;
    }

    .login-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .login-btn {
      color: rgba(255, 255, 255, 0.8) !important;
    }

    .login-btn:hover {
      color: white !important;
    }

    .register-btn {
      font-weight: 500;
    }

    .mobile-menu-btn {
      color: white;
      display: none;
    }

    /* Estilos del Menú de Usuario */
    .user-dropdown {
      min-width: 280px;
    }

    .user-header {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      background-color: #f5f5f5;
    }

    .user-avatar-large {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
    }

    .avatar-placeholder-large {
      width: 100%;
      height: 100%;
      background-color: #2196f3;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 500;
    }

    .user-info-large h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .user-info-large p {
      margin: 0 0 4px 0;
      font-size: 14px;
      color: #666;
    }

    .user-status {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-activo {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-inactivo {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .status-suspendido {
      background-color: #ffebee;
      color: #c62828;
    }

    .logout-btn {
      color: #f44336 !important;
    }

    .mobile-badge {
      background-color: #ff4444;
      color: white;
      border-radius: 10px;
      padding: 2px 6px;
      font-size: 12px;
      margin-left: auto;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-toolbar {
        padding: 0 8px;
      }

      .main-nav {
        display: none;
      }

      .mobile-menu-btn {
        display: block;
      }

      .user-details {
        display: none;
      }

      .app-name {
        display: none;
      }

      .logo-section {
        margin-right: 8px;
      }
    }

    @media (max-width: 480px) {
      .notification-btn {
        display: none;
      }

      .login-section .login-btn {
        display: none;
      }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  usuario: Usuario | null = null;
  citasProximas = 0;
  notificacionesPendientes = 0;
  isMobile = false;
  appConfig = APP_CONFIG;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {
    this.checkMobile();
  }

  ngOnInit(): void {
    // Suscribirse al estado del usuario
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.usuario = user;
        if (user) {
          this.cargarDatosUsuario();
        }
      });

    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', () => this.checkMobile());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', () => this.checkMobile());
  }

  /**
   * Carga datos adicionales del usuario
   */
  private cargarDatosUsuario(): void {
    if (!this.usuario) return;

    // Cargar estadísticas básicas
    this.usuarioService.obtenerEstadisticas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.citasProximas = stats.proximasCitas;
        },
        error: (error) => {
          console.error('Error al cargar estadísticas:', error);
        }
      });

    // TODO: Implementar servicio de notificaciones
    // this.notificacionesPendientes = await notificationService.getPending();
  }

  /**
   * Obtiene el display del rol del usuario
   */
  getUserRoleDisplay(): string {
    if (!this.usuario) return '';

    switch (this.usuario.rol) {
      case 'ADMIN':
        return 'Administrador';
      case 'PROFESIONAL':
        return 'Profesional';
      case 'USUARIO':
      default:
        return 'Usuario';
    }
  }

  /**
   * Maneja el error de carga del logo
   */
  onLogoError(event: any): void {
    event.target.style.display = 'none';
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }

  /**
   * Verifica si es dispositivo móvil
   */
  private checkMobile(): void {
    this.isMobile = window.innerWidth < 768;
  }
}