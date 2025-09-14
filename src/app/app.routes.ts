import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'reset-password/:token',
    loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'citas',
    loadComponent: () => import('./pages/citas/citas.component').then(m => m.CitasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'citas/:id',
    loadComponent: () => import('./pages/cita-detalle/cita-detalle.component').then(m => m.CitaDetalleComponent),
    canActivate: [authGuard]
  },
  {
    path: 'citas/:id/editar',
    loadComponent: () => import('./pages/nueva-cita/nueva-cita.component').then(m => m.NuevaCitaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'nueva-cita',
    loadComponent: () => import('./pages/nueva-cita/nueva-cita.component').then(m => m.NuevaCitaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/negocios',
    loadComponent: () => import('./pages/admin/negocios/negocios-admin.component').then(m => m.NegociosAdminComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/negocios/:id/horarios',
    loadComponent: () => import('./pages/admin/negocios/horarios-negocio.component').then(m => m.HorariosNegocioComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/negocios/:id/servicios',
    loadComponent: () => import('./pages/admin/negocios/servicios-negocio.component').then(m => m.ServiciosNegocioComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/negocios/:id/citas',
    loadComponent: () => import('./pages/admin/negocios/citas-negocio.component').then(m => m.CitasNegocioComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];
