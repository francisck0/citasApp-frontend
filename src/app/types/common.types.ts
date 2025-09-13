/**
 * Tipos comunes para el frontend
 */

// Estados de carga
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Estado de componentes
export interface ComponentState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: Date;
}

// Estado de lista con paginación
export interface ListState<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

// Opciones de búsqueda
export interface SearchOptions {
  query: string;
  filters: { [key: string]: any };
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
}

// Resultado de búsqueda
export interface SearchResult<T> {
  results: T[];
  total: number;
  query: string;
  filters: { [key: string]: any };
  executionTime?: number;
}

// Opciones de select/dropdown
export interface SelectOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
  group?: string;
  icon?: string;
  description?: string;
}

// Configuración de tabla
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
  render?: (item: T) => string;
}

// Configuración de formulario
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: FormFieldValidation[];
  disabled?: boolean;
  hidden?: boolean;
}

export interface FormFieldValidation {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

// Configuración de notificaciones
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationConfig {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'link';
}

// Configuración de modal/dialog
export interface ModalConfig {
  title: string;
  content?: string;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  actions?: ModalAction[];
}

export interface ModalAction {
  label: string;
  action: () => void | Promise<void>;
  style?: 'primary' | 'secondary' | 'danger' | 'link';
  loading?: boolean;
  disabled?: boolean;
}

// Configuración de filtros
export interface FilterConfig<T> {
  key: keyof T;
  label: string;
  type: 'text' | 'select' | 'date' | 'range' | 'boolean';
  options?: SelectOption[];
  multiple?: boolean;
  placeholder?: string;
}

// Breadcrumbs
export interface BreadcrumbItem {
  label: string;
  url?: string;
  active?: boolean;
  icon?: string;
}

// Configuración de tarjetas/cards
export interface CardConfig {
  title?: string;
  subtitle?: string;
  image?: string;
  actions?: CardAction[];
  clickable?: boolean;
  selected?: boolean;
}

export interface CardAction {
  label: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
  hidden?: boolean;
}

// Geolocalización
export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

// Configuración de mapa
export interface MapMarker {
  id: string | number;
  position: GeolocationPosition;
  title?: string;
  description?: string;
  icon?: string;
  clickable?: boolean;
  data?: any;
}

export interface MapConfig {
  center: GeolocationPosition;
  zoom: number;
  markers?: MapMarker[];
  showUserLocation?: boolean;
  draggable?: boolean;
  zoomControl?: boolean;
}

// Estados de calendario
export interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  color?: string;
  textColor?: string;
  data?: any;
  editable?: boolean;
  deletable?: boolean;
}

export interface CalendarConfig {
  view: 'month' | 'week' | 'day';
  locale: string;
  weekends: boolean;
  businessHours?: {
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
  };
  slotDuration?: string;
  events?: CalendarEvent[];
}

// Configuración de theme/tema
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
}

// Configuración de usuario
export interface UserPreferences {
  theme: ThemeConfig;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showEmail: boolean;
    showPhone: boolean;
  };
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

// Tipos de archivo
export type FileType = 'image' | 'document' | 'audio' | 'video' | 'other';

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  url?: string;
  preview?: string;
  uploadProgress?: number;
  error?: string;
}

// Configuración de upload
export interface UploadConfig {
  maxSize: number; // bytes
  acceptedTypes: string[];
  multiple: boolean;
  maxFiles?: number;
  autoUpload?: boolean;
  endpoint?: string;
}

// Estados de validación
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  value?: any;
}

// Utilidades de tiempo
export interface TimeRange {
  start: string; // HH:mm
  end: string; // HH:mm
}

export interface DateRange {
  start: Date;
  end: Date;
}

// Exportar tipos útiles adicionales
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type KeyOf<T> = keyof T;
export type ValueOf<T> = T[keyof T];

// Función helper para crear estados de componente
export function createInitialState<T>(data?: T): ComponentState<T> {
  return {
    data: data || null,
    loading: false,
    error: null,
    lastUpdated: data ? new Date() : undefined
  };
}

// Función helper para crear estados de lista
export function createInitialListState<T>(): ListState<T> {
  return {
    items: [],
    totalItems: 0,
    currentPage: 0,
    totalPages: 0,
    pageSize: 10,
    loading: false,
    error: null,
    hasMore: false
  };
}