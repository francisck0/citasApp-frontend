import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" *ngIf="currentUser">
      <div class="nav-container">
        <div class="nav-brand">
          <a routerLink="/dashboard">CitasApp</a>
        </div>

        <div class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/citas" routerLinkActive="active">Mis Citas</a>
          <a routerLink="/perfil" routerLinkActive="active">Mi Perfil</a>
        </div>

        <div class="nav-user">
          <span class="user-name">{{ currentUser.nombre }} {{ currentUser.apellidos }}</span>
          <button class="logout-btn" (click)="logout()">Cerrar Sesión</button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background-color: #007bff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      height: 60px;
    }

    .nav-brand a {
      font-size: 24px;
      font-weight: bold;
      color: white;
      text-decoration: none;
    }

    .nav-links {
      display: flex;
      gap: 20px;
    }

    .nav-links a {
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 4px;
      transition: background-color 0.3s;
    }

    .nav-links a:hover,
    .nav-links a.active {
      background-color: rgba(255,255,255,0.2);
    }

    .nav-user {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .user-name {
      color: white;
      font-weight: 500;
    }

    .logout-btn {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;
    }

    .logout-btn:hover {
      background-color: #c82333;
    }

    @media (max-width: 768px) {
      .nav-container {
        flex-direction: column;
        padding: 10px;
        height: auto;
      }

      .nav-links {
        margin: 10px 0;
      }

      .user-name {
        display: none;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: Usuario | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    this.authService.logout();
  }
}