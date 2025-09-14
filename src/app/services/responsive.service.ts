/**
 * Servicio para manejo de responsividad y detección de dispositivos
 */

import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, takeUntil } from 'rxjs/operators';

export interface ScreenSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface BreakpointState {
  xs: boolean;    // < 576px
  sm: boolean;    // >= 576px
  md: boolean;    // >= 768px
  lg: boolean;    // >= 992px
  xl: boolean;    // >= 1200px
  xxl: boolean;   // >= 1400px
}

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService implements OnDestroy {
  private readonly breakpoints = {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400
  };

  private screenSizeSubject = new BehaviorSubject<ScreenSize>(this.getScreenSize());
  private breakpointSubject = new BehaviorSubject<BreakpointState>(this.getBreakpointState());
  private destroy$ = new Subject<void>();

  public screenSize$ = this.screenSizeSubject.asObservable();
  public breakpoint$ = this.breakpointSubject.asObservable();

  constructor() {
    this.initializeResponsiveDetection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa la detección de cambios de tamaño
   */
  private initializeResponsiveDetection(): void {
    if (typeof window !== 'undefined') {
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(100),
          distinctUntilChanged(),
          startWith(null),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          const screenSize = this.getScreenSize();
          const breakpointState = this.getBreakpointState();

          this.screenSizeSubject.next(screenSize);
          this.breakpointSubject.next(breakpointState);
        });

      // Detectar cambios de orientación
      fromEvent(window, 'orientationchange')
        .pipe(
          debounceTime(200),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          setTimeout(() => {
            const screenSize = this.getScreenSize();
            const breakpointState = this.getBreakpointState();

            this.screenSizeSubject.next(screenSize);
            this.breakpointSubject.next(breakpointState);
          }, 100);
        });
    }
  }

  /**
   * Obtiene el tamaño actual de pantalla
   */
  private getScreenSize(): ScreenSize {
    if (typeof window === 'undefined') {
      return {
        width: 1200,
        height: 800,
        isMobile: false,
        isTablet: false,
        isDesktop: true
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      width,
      height,
      isMobile: width < this.breakpoints.md,
      isTablet: width >= this.breakpoints.md && width < this.breakpoints.lg,
      isDesktop: width >= this.breakpoints.lg
    };
  }

  /**
   * Obtiene el estado actual de breakpoints
   */
  private getBreakpointState(): BreakpointState {
    if (typeof window === 'undefined') {
      return {
        xs: false,
        sm: false,
        md: false,
        lg: false,
        xl: true,
        xxl: false
      };
    }

    const width = window.innerWidth;

    return {
      xs: width >= this.breakpoints.xs && width < this.breakpoints.sm,
      sm: width >= this.breakpoints.sm && width < this.breakpoints.md,
      md: width >= this.breakpoints.md && width < this.breakpoints.lg,
      lg: width >= this.breakpoints.lg && width < this.breakpoints.xl,
      xl: width >= this.breakpoints.xl && width < this.breakpoints.xxl,
      xxl: width >= this.breakpoints.xxl
    };
  }

  /**
   * Verifica si es un dispositivo móvil
   */
  get isMobile(): boolean {
    return this.screenSizeSubject.value.isMobile;
  }

  /**
   * Verifica si es una tablet
   */
  get isTablet(): boolean {
    return this.screenSizeSubject.value.isTablet;
  }

  /**
   * Verifica si es desktop
   */
  get isDesktop(): boolean {
    return this.screenSizeSubject.value.isDesktop;
  }

  /**
   * Obtiene el tamaño actual
   */
  get currentScreenSize(): ScreenSize {
    return this.screenSizeSubject.value;
  }

  /**
   * Obtiene los breakpoints actuales
   */
  get currentBreakpoint(): BreakpointState {
    return this.breakpointSubject.value;
  }

  /**
   * Observable que emite cuando cambia a móvil
   */
  get isMobile$(): Observable<boolean> {
    return this.screenSize$.pipe(
      distinctUntilChanged((prev, curr) => prev.isMobile === curr.isMobile),
      map(size => size.isMobile)
    );
  }

  /**
   * Observable que emite cuando cambia a tablet
   */
  get isTablet$(): Observable<boolean> {
    return this.screenSize$.pipe(
      distinctUntilChanged((prev, curr) => prev.isTablet === curr.isTablet),
      map(size => size.isTablet)
    );
  }

  /**
   * Observable que emite cuando cambia a desktop
   */
  get isDesktop$(): Observable<boolean> {
    return this.screenSize$.pipe(
      distinctUntilChanged((prev, curr) => prev.isDesktop === curr.isDesktop),
      map(size => size.isDesktop)
    );
  }

  /**
   * Verifica si el ancho es mayor que un breakpoint específico
   */
  isGreaterThan(breakpoint: keyof typeof this.breakpoints): boolean {
    return this.currentScreenSize.width >= this.breakpoints[breakpoint];
  }

  /**
   * Verifica si el ancho es menor que un breakpoint específico
   */
  isLessThan(breakpoint: keyof typeof this.breakpoints): boolean {
    return this.currentScreenSize.width < this.breakpoints[breakpoint];
  }

  /**
   * Verifica si está en un rango de breakpoints
   */
  isBetween(min: keyof typeof this.breakpoints, max: keyof typeof this.breakpoints): boolean {
    const width = this.currentScreenSize.width;
    return width >= this.breakpoints[min] && width < this.breakpoints[max];
  }

  /**
   * Obtiene las clases CSS para el contenedor responsivo
   */
  getResponsiveClasses(): string[] {
    const breakpoint = this.currentBreakpoint;
    const classes: string[] = [];

    if (breakpoint.xs) classes.push('breakpoint-xs');
    if (breakpoint.sm) classes.push('breakpoint-sm');
    if (breakpoint.md) classes.push('breakpoint-md');
    if (breakpoint.lg) classes.push('breakpoint-lg');
    if (breakpoint.xl) classes.push('breakpoint-xl');
    if (breakpoint.xxl) classes.push('breakpoint-xxl');

    const size = this.currentScreenSize;
    if (size.isMobile) classes.push('device-mobile');
    if (size.isTablet) classes.push('device-tablet');
    if (size.isDesktop) classes.push('device-desktop');

    return classes;
  }

  /**
   * Detecta si es un dispositivo táctil
   */
  get isTouchDevice(): boolean {
    return typeof window !== 'undefined' &&
           ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }

  /**
   * Detecta la orientación del dispositivo
   */
  get orientation(): 'portrait' | 'landscape' {
    if (typeof window === 'undefined') {
      return 'landscape';
    }

    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  /**
   * Observable que emite cambios de orientación
   */
  get orientation$(): Observable<'portrait' | 'landscape'> {
    return this.screenSize$.pipe(
      map(size => size.height > size.width ? 'portrait' : 'landscape'),
      distinctUntilChanged()
    );
  }

  /**
   * Obtiene el viewport seguro (considerando notch, barras del navegador, etc.)
   */
  getSafeArea(): {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } {
    if (typeof window === 'undefined' || !window.getComputedStyle) {
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }

    const style = window.getComputedStyle(document.documentElement);

    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
    };
  }

  /**
   * Calcula el tamaño de fuente responsivo
   */
  getResponsiveFontSize(baseSize: number): number {
    const { width } = this.currentScreenSize;

    if (width < this.breakpoints.sm) {
      return baseSize * 0.875; // 87.5% en móviles pequeños
    } else if (width < this.breakpoints.md) {
      return baseSize * 0.9375; // 93.75% en móviles grandes
    } else if (width < this.breakpoints.lg) {
      return baseSize; // 100% en tablets
    } else {
      return baseSize * 1.0625; // 106.25% en desktop
    }
  }

  /**
   * Calcula espaciado responsivo
   */
  getResponsiveSpacing(baseSpacing: number): number {
    const { width } = this.currentScreenSize;

    if (width < this.breakpoints.sm) {
      return baseSpacing * 0.75; // 75% en móviles pequeños
    } else if (width < this.breakpoints.md) {
      return baseSpacing * 0.875; // 87.5% en móviles grandes
    } else {
      return baseSpacing; // 100% en tablet y desktop
    }
  }
}

// Helper function para usar en templates
export function map<T, R>(fn: (value: T) => R) {
  return (source: Observable<T>) => source.pipe(
    distinctUntilChanged(),
    map(fn)
  );
}