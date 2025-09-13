/**
 * DTOs relacionados con autenticación
 */

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
  refreshToken?: string;
  usuario: UsuarioResponseDTO;
  expiresIn?: number;
  tokenType?: string;
}

export interface RegisterRequestDTO {
  email: string;
  password: string;
  confirmPassword: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  fechaNacimiento?: string;
  genero?: 'MASCULINO' | 'FEMENINO' | 'OTRO';
}

export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

export interface PasswordResetRequestDTO {
  email: string;
}

export interface PasswordResetConfirmDTO {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UsuarioResponseDTO {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  fechaNacimiento?: string;
  genero?: 'MASCULINO' | 'FEMENINO' | 'OTRO';
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  rol: 'USUARIO' | 'ADMIN' | 'PROFESIONAL';
  fechaRegistro: string;
  ultimoAcceso?: string;
  emailVerificado: boolean;
  perfilCompleto: boolean;
}