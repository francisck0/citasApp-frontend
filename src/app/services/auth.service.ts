import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, timer } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import {
  LoginRequestDTO,
  LoginResponseDTO,
  RegisterRequestDTO,
  UsuarioResponseDTO
} from '../interfaces/auth-dtos.interface';
import { Usuario } from '../models/usuario.model';

export interface AuthError {
  message: string;
  status: number;
  errors?: string[];
}

// Re-exportar para compatibilidad con código existente
export type User = UsuarioResponseDTO;
export type LoginRequest = LoginRequestDTO;
export type LoginResponse = LoginResponseDTO;
export type RegisterRequest = RegisterRequestDTO;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'citasapp_token';
  private readonly REFRESH_TOKEN_KEY = 'citasapp_refresh_token';
  private readonly USER_KEY = 'citasapp_user';
  private readonly TOKEN_EXPIRY_KEY = 'citasapp_token_expiry';
  private readonly API_URL = 'http://localhost:8080/api/auth';

  private currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private refreshTimer: any;
  private readonly REFRESH_BUFFER_TIME = 5 * 60 * 1000; // 5 minutos antes de expirar

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Iniciar auto-refresh del token si hay uno válido
    if (this.isAuthenticated()) {
      this.startTokenRefreshTimer();
    }
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, loginRequest)
      .pipe(
        tap(response => {
          if (response.token && response.usuario) {
            this.handleAuthSuccess(response);
          }
        }),
        catchError(error => {
          console.error('Error en login:', error);
          return throwError(() => this.handleAuthError(error));
        })
      );
  }

  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap(response => {
          if (response.token && response.usuario) {
            this.handleAuthSuccess(response);
          }
        }),
        catchError(error => {
          console.error('Error en registro:', error);
          return throwError(() => this.handleAuthError(error));
        })
      );
  }

  logout(): void {
    this.clearRefreshTimer();
    this.clearStoredData();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<LoginResponse>(`${this.API_URL}/refresh`, {
      refreshToken: refreshToken
    }).pipe(
      tap(response => {
        if (response.token) {
          this.handleAuthSuccess(response);
        }
      }),
      catchError(error => {
        console.error('Error al refrescar token:', error);
        this.logout();
        return throwError(() => this.handleAuthError(error));
      })
    );
  }

  // Métodos de token management
  getToken(): string | null {
    if (this.isClient()) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private setToken(token: string): void {
    if (this.isClient()) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private removeToken(): void {
    if (this.isClient()) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  getRefreshToken(): string | null {
    if (this.isClient()) {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  private setRefreshToken(refreshToken: string): void {
    if (this.isClient()) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  private removeRefreshToken(): void {
    if (this.isClient()) {
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  private setTokenExpiry(expiryTime: number): void {
    if (this.isClient()) {
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    }
  }

  private getTokenExpiry(): number | null {
    if (this.isClient()) {
      const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      return expiry ? parseInt(expiry, 10) : null;
    }
    return null;
  }

  private removeTokenExpiry(): void {
    if (this.isClient()) {
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    }
  }

  // Métodos de usuario
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  private setUser(user: UsuarioResponseDTO): void {
    if (this.isClient()) {
      const usuario = Usuario.fromDTO(user);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user)); // Guardar DTO original
      this.currentUserSubject.next(usuario); // Emitir modelo
    }
  }

  private removeUser(): void {
    if (this.isClient()) {
      localStorage.removeItem(this.USER_KEY);
    }
  }

  private getUserFromStorage(): Usuario | null {
    if (this.isClient()) {
      const userJson = localStorage.getItem(this.USER_KEY);
      if (userJson) {
        const userData = JSON.parse(userJson);
        return Usuario.fromDTO(userData);
      }
    }
    return null;
  }

  // Validación de autenticación
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Verificar si el token ha expirado
    if (this.isTokenExpired()) {
      this.logout();
      return false;
    }

    return true;
  }

  private isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    try {
      // Verificar usando la fecha de expiración almacenada
      const storedExpiry = this.getTokenExpiry();
      if (storedExpiry) {
        return Date.now() >= storedExpiry;
      }

      // Fallback: decodificar el JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      return payload.exp && payload.exp < currentTime;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return true;
    }
  }

  // Auto-refresh del token
  private startTokenRefreshTimer(): void {
    this.clearRefreshTimer();

    const tokenExpiry = this.getTokenExpiry();
    if (!tokenExpiry) {
      return;
    }

    const refreshTime = tokenExpiry - Date.now() - this.REFRESH_BUFFER_TIME;

    if (refreshTime > 0) {
      this.refreshTimer = timer(refreshTime).subscribe(() => {
        this.refreshToken().subscribe({
          next: () => console.log('Token refreshed successfully'),
          error: (error) => console.error('Token refresh failed:', error)
        });
      });
    }
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      this.refreshTimer.unsubscribe();
      this.refreshTimer = null;
    }
  }

  // Manejo de respuestas de autenticación
  private handleAuthSuccess(response: LoginResponseDTO): void {
    this.setToken(response.token);
    this.setUser(response.usuario); // Cambiar de 'user' a 'usuario' según DTO

    // Manejar refresh token si está presente
    if (response.refreshToken) {
      this.setRefreshToken(response.refreshToken);
    }

    // Calcular y guardar tiempo de expiración
    const expiryTime = this.calculateTokenExpiry(response.token, response.expiresIn);
    if (expiryTime) {
      this.setTokenExpiry(expiryTime);
      this.startTokenRefreshTimer();
    }
  }

  private calculateTokenExpiry(token: string, expiresIn?: number): number | null {
    try {
      if (expiresIn) {
        // Si el backend proporciona expiresIn (en segundos)
        return Date.now() + (expiresIn * 1000);
      }

      // Extraer del payload del JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp) {
        return payload.exp * 1000; // Convertir a milliseconds
      }

      return null;
    } catch (error) {
      console.error('Error al calcular expiración del token:', error);
      return null;
    }
  }

  private handleAuthError(error: HttpErrorResponse): AuthError {
    let authError: AuthError = {
      message: 'Error desconocido',
      status: 500
    };

    if (error.error) {
      // Error del servidor
      authError = {
        message: error.error.message || 'Error en la autenticación',
        status: error.status,
        errors: error.error.errors || []
      };
    } else if (error.status === 0) {
      // Error de red
      authError = {
        message: 'Error de conexión. Verifica tu conexión a internet.',
        status: 0
      };
    } else {
      // Otros errores HTTP
      authError = {
        message: `Error ${error.status}: ${error.statusText}`,
        status: error.status
      };
    }

    return authError;
  }

  // Utilidades
  private clearStoredData(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
    this.removeTokenExpiry();
  }

  private isClient(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Método para verificar roles/permisos
  hasRole(role: 'USUARIO' | 'ADMIN' | 'PROFESIONAL'): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.rol === role;
  }

  // Métodos de conveniencia para roles
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isProfesional(): boolean {
    return this.hasRole('PROFESIONAL');
  }

  isUsuario(): boolean {
    return this.hasRole('USUARIO');
  }

  // Método para obtener info del token
  getTokenInfo(): any {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }
}