/**
 * Configuración de la aplicación
 */

export const APP_CONFIG = {
  // Información de la aplicación
  app: {
    name: 'CitasApp',
    version: '1.0.0',
    description: 'Sistema de gestión de citas para servicios',
    author: 'Tu Empresa',
    logo: '/assets/images/logo.png'
  },

  // URLs de la API
  api: {
    baseUrl: 'http://localhost:8080/api',
    endpoints: {
      auth: '/auth',
      usuarios: '/usuarios',
      citas: '/citas',
      profesionales: '/profesionales',
      negocios: '/negocios',
      categorias: '/categorias',
      notificaciones: '/notificaciones'
    },
    timeout: 30000, // 30 segundos
    retryAttempts: 3
  },

  // Configuración de autenticación
  auth: {
    tokenKey: 'citasapp_token',
    refreshTokenKey: 'citasapp_refresh_token',
    userKey: 'citasapp_user',
    tokenExpiryKey: 'citasapp_token_expiry',
    refreshBufferTime: 5 * 60 * 1000, // 5 minutos
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
    rememberMeExpiry: 30 * 24 * 60 * 60 * 1000 // 30 días
  },

  // Configuración de paginación
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100],
    maxPageSize: 100
  },

  // Configuración de fechas y horarios
  dateTime: {
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'dd/MM/yyyy HH:mm',
    locale: 'es-ES',
    timezone: 'Europe/Madrid',
    firstDayOfWeek: 1, // Lunes
    businessHours: {
      start: '08:00',
      end: '20:00'
    }
  },

  // Configuración de archivos
  files: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: {
      images: ['image/jpeg', 'image/png', 'image/webp'],
      documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      all: ['image/*', 'application/pdf', '.doc', '.docx']
    },
    maxFiles: 5
  },

  // Configuración de notificaciones
  notifications: {
    duration: 5000, // 5 segundos
    maxNotifications: 5,
    position: 'top-right' as const,
    autoClose: true,
    showProgress: true
  },

  // Configuración de validación
  validation: {
    email: {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: 'Ingresa un email válido'
    },
    phone: {
      pattern: /^(\+34|0034|34)?[6|7|8|9][0-9]{8}$/,
      message: 'Ingresa un teléfono válido'
    },
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
    },
    name: {
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-ZáéíóúñÑ\s]+$/,
      message: 'Solo se permiten letras y espacios'
    }
  },

  // Configuración de mapas
  maps: {
    defaultCenter: { lat: 40.4168, lng: -3.7038 }, // Madrid
    defaultZoom: 13,
    apiKey: '', // Agregar API key de Google Maps
    markerIcons: {
      negocio: '/assets/images/markers/negocio.png',
      spa: '/assets/images/markers/spa.png',
      barberia: '/assets/images/markers/barberia.png'
    }
  },

  // Configuración de colores y tema
  theme: {
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545',
      info: '#17a2b8',
      light: '#f8f9fa',
      dark: '#343a40'
    },
    breakpoints: {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1400
    }
  },

  // Configuración de búsqueda
  search: {
    minQueryLength: 2,
    debounceTime: 300, // ms
    maxSuggestions: 5,
    highlightMatches: true
  },

  // Configuración de cache
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutos
    maxSize: 100, // número máximo de entradas
    estrategies: {
      usuarios: 10 * 60 * 1000, // 10 minutos
      categorias: 60 * 60 * 1000, // 1 hora
      negocios: 30 * 60 * 1000 // 30 minutos
    }
  },

  // URLs externas
  external: {
    termsOfService: '/terminos-servicio',
    privacyPolicy: '/politica-privacidad',
    support: '/soporte',
    documentation: '/documentacion',
    social: {
      facebook: 'https://facebook.com/citasapp',
      twitter: 'https://twitter.com/citasapp',
      instagram: 'https://instagram.com/citasapp',
      linkedin: 'https://linkedin.com/company/citasapp'
    }
  },

  // Características habilitadas
  features: {
    registration: true,
    socialLogin: false,
    videoCall: false,
    chat: false,
    paymentGateway: false,
    multiLanguage: false,
    darkMode: true,
    notifications: true,
    geolocation: true,
    calendar: true,
    reviews: true,
    favorites: true,
    sharing: true
  },

  // Configuración de desarrollo
  development: {
    debugMode: false,
    mockApi: false,
    showPerformanceMetrics: false,
    logLevel: 'info' as 'debug' | 'info' | 'warn' | 'error'
  }
};

// Tipos para TypeScript
export type AppConfig = typeof APP_CONFIG;
export type ApiEndpoints = keyof typeof APP_CONFIG.api.endpoints;
export type ThemeColor = keyof typeof APP_CONFIG.theme.colors;
export type CacheStrategy = keyof typeof APP_CONFIG.cache.estrategies;