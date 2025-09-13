import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="citas-container">
      <div class="header">
        <h2>Mis Citas</h2>
        <button class="new-cita-btn" routerLink="/nueva-cita">Nueva Cita</button>
      </div>

      <div class="filters">
        <button [class.active]="filterType === 'todas'" (click)="setFilter('todas')">Todas</button>
        <button [class.active]="filterType === 'proximas'" (click)="setFilter('proximas')">Próximas</button>
        <button [class.active]="filterType === 'pasadas'" (click)="setFilter('pasadas')">Pasadas</button>
      </div>

      <div class="citas-list">
        <div *ngFor="let cita of filteredCitas" class="cita-card">
          <div class="cita-date">
            <span class="day">{{cita.fecha | date:'dd'}}</span>
            <span class="month">{{cita.fecha | date:'MMM'}}</span>
          </div>
          <div class="cita-info">
            <h3>{{cita.profesional}}</h3>
            <p>{{cita.categoria}}</p>
            <p class="time">{{cita.hora}}</p>
          </div>
          <div class="cita-status">
            <span [class]="'status-' + cita.estado">{{cita.estado}}</span>
          </div>
          <div class="cita-actions">
            <button class="btn-secondary">Ver</button>
            <button class="btn-danger" *ngIf="cita.estado === 'programada'">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .citas-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .new-cita-btn {
      background-color: #28a745;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }
    .filters {
      margin-bottom: 20px;
    }
    .filters button {
      margin-right: 10px;
      padding: 8px 16px;
      border: 1px solid #007bff;
      background: white;
      color: #007bff;
      border-radius: 4px;
      cursor: pointer;
    }
    .filters button.active {
      background: #007bff;
      color: white;
    }
    .cita-card {
      display: flex;
      align-items: center;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 15px;
      padding: 20px;
    }
    .cita-date {
      text-align: center;
      margin-right: 20px;
      min-width: 60px;
    }
    .day {
      display: block;
      font-size: 1.5em;
      font-weight: bold;
    }
    .month {
      display: block;
      color: #666;
      text-transform: uppercase;
    }
    .cita-info {
      flex: 1;
    }
    .cita-info h3 {
      margin: 0 0 5px 0;
      color: #333;
    }
    .cita-info p {
      margin: 0;
      color: #666;
    }
    .time {
      font-weight: bold !important;
    }
    .cita-status {
      margin-right: 20px;
    }
    .status-programada {
      background: #28a745;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
    }
    .status-completada {
      background: #007bff;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
    }
    .status-cancelada {
      background: #dc3545;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
    }
    .cita-actions button {
      margin-left: 10px;
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    .btn-danger {
      background: #dc3545;
      color: white;
    }
  `]
})
export class CitasComponent {
  filterType = 'todas';

  citas = [
    {
      id: 1,
      fecha: new Date(2024, 0, 15),
      hora: '10:00',
      profesional: 'García López',
      categoria: 'Masajes',
      estado: 'programada'
    },
    {
      id: 2,
      fecha: new Date(2024, 0, 10),
      hora: '14:30',
      profesional: 'Martínez Ruiz',
      categoria: 'Estética',
      estado: 'completada'
    },
    {
      id: 3,
      fecha: new Date(2024, 0, 20),
      hora: '09:00',
      profesional: 'Rodríguez Silva',
      categoria: 'Peluquería',
      estado: 'programada'
    }
  ];

  get filteredCitas() {
    const now = new Date();

    switch (this.filterType) {
      case 'proximas':
        return this.citas.filter(cita => cita.fecha >= now && cita.estado === 'programada');
      case 'pasadas':
        return this.citas.filter(cita => cita.fecha < now || cita.estado === 'completada');
      default:
        return this.citas;
    }
  }

  setFilter(type: string) {
    this.filterType = type;
  }
}