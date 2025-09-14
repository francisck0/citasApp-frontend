/**
 * Directivas para manejo responsivo en templates
 */

import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  ElementRef,
  Renderer2
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ResponsiveService } from '../services/responsive.service';

/**
 * Directiva estructural para mostrar elementos solo en móvil
 * Uso: <div *appShowOnMobile>Contenido móvil</div>
 */
@Directive({
  selector: '[appShowOnMobile]',
  standalone: true
})
export class ShowOnMobileDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private responsiveService: ResponsiveService
  ) {}

  ngOnInit(): void {
    this.responsiveService.isMobile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isMobile => {
        if (isMobile && !this.hasView) {
          this.viewContainer.createEmbeddedView(this.templateRef);
          this.hasView = true;
        } else if (!isMobile && this.hasView) {
          this.viewContainer.clear();
          this.hasView = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

/**
 * Directiva estructural para mostrar elementos solo en tablet
 * Uso: <div *appShowOnTablet>Contenido tablet</div>
 */
@Directive({
  selector: '[appShowOnTablet]',
  standalone: true
})
export class ShowOnTabletDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private responsiveService: ResponsiveService
  ) {}

  ngOnInit(): void {
    this.responsiveService.isTablet$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isTablet => {
        if (isTablet && !this.hasView) {
          this.viewContainer.createEmbeddedView(this.templateRef);
          this.hasView = true;
        } else if (!isTablet && this.hasView) {
          this.viewContainer.clear();
          this.hasView = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

/**
 * Directiva estructural para mostrar elementos solo en desktop
 * Uso: <div *appShowOnDesktop>Contenido desktop</div>
 */
@Directive({
  selector: '[appShowOnDesktop]',
  standalone: true
})
export class ShowOnDesktopDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private responsiveService: ResponsiveService
  ) {}

  ngOnInit(): void {
    this.responsiveService.isDesktop$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDesktop => {
        if (isDesktop && !this.hasView) {
          this.viewContainer.createEmbeddedView(this.templateRef);
          this.hasView = true;
        } else if (!isDesktop && this.hasView) {
          this.viewContainer.clear();
          this.hasView = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

/**
 * Directiva para mostrar elementos según breakpoint
 * Uso: <div [appShowOnBreakpoint]="'md'">Contenido para MD+</div>
 */
@Directive({
  selector: '[appShowOnBreakpoint]',
  standalone: true
})
export class ShowOnBreakpointDirective implements OnInit, OnDestroy {
  @Input() appShowOnBreakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' = 'md';
  @Input() showAbove = true; // true = mostrar en breakpoint y superiores, false = solo en ese breakpoint

  private destroy$ = new Subject<void>();
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private responsiveService: ResponsiveService
  ) {}

  ngOnInit(): void {
    this.responsiveService.breakpoint$
      .pipe(takeUntil(this.destroy$))
      .subscribe(breakpoint => {
        let shouldShow = false;

        if (this.showAbove) {
          // Mostrar en el breakpoint y superiores
          switch (this.appShowOnBreakpoint) {
            case 'xs':
              shouldShow = true; // Siempre mostrar
              break;
            case 'sm':
              shouldShow = !breakpoint.xs;
              break;
            case 'md':
              shouldShow = !breakpoint.xs && !breakpoint.sm;
              break;
            case 'lg':
              shouldShow = breakpoint.lg || breakpoint.xl || breakpoint.xxl;
              break;
            case 'xl':
              shouldShow = breakpoint.xl || breakpoint.xxl;
              break;
            case 'xxl':
              shouldShow = breakpoint.xxl;
              break;
          }
        } else {
          // Mostrar solo en ese breakpoint específico
          shouldShow = breakpoint[this.appShowOnBreakpoint];
        }

        if (shouldShow && !this.hasView) {
          this.viewContainer.createEmbeddedView(this.templateRef);
          this.hasView = true;
        } else if (!shouldShow && this.hasView) {
          this.viewContainer.clear();
          this.hasView = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

/**
 * Directiva de atributo para aplicar clases responsivas automáticamente
 * Uso: <div appResponsiveClass>Elemento con clases automáticas</div>
 */
@Directive({
  selector: '[appResponsiveClass]',
  standalone: true
})
export class ResponsiveClassDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private responsiveService: ResponsiveService
  ) {}

  ngOnInit(): void {
    this.responsiveService.screenSize$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateClasses();
      });

    // Aplicar clases iniciales
    this.updateClasses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateClasses(): void {
    const classes = this.responsiveService.getResponsiveClasses();
    const element = this.elementRef.nativeElement;

    // Remover clases anteriores
    const currentClasses = element.className.split(' ').filter((cls: string) =>
      cls.startsWith('breakpoint-') || cls.startsWith('device-')
    );

    currentClasses.forEach((cls: string) => {
      this.renderer.removeClass(element, cls);
    });

    // Agregar nuevas clases
    classes.forEach(cls => {
      this.renderer.addClass(element, cls);
    });
  }
}

/**
 * Directiva para ajustar padding/margin responsivo
 * Uso: <div [appResponsiveSpacing]="{ mobile: '16px', tablet: '24px', desktop: '32px' }">
 */
@Directive({
  selector: '[appResponsiveSpacing]',
  standalone: true
})
export class ResponsiveSpacingDirective implements OnInit, OnDestroy {
  @Input() appResponsiveSpacing: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  } = {};

  @Input() spacingType: 'padding' | 'margin' | 'paddingTop' | 'paddingBottom' | 'marginTop' | 'marginBottom' = 'padding';

  private destroy$ = new Subject<void>();

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private responsiveService: ResponsiveService
  ) {}

  ngOnInit(): void {
    this.responsiveService.screenSize$
      .pipe(takeUntil(this.destroy$))
      .subscribe(screenSize => {
        this.updateSpacing(screenSize);
      });

    // Aplicar espaciado inicial
    this.updateSpacing(this.responsiveService.currentScreenSize);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateSpacing(screenSize: any): void {
    let spacing: string;

    if (screenSize.isMobile && this.appResponsiveSpacing.mobile) {
      spacing = this.appResponsiveSpacing.mobile;
    } else if (screenSize.isTablet && this.appResponsiveSpacing.tablet) {
      spacing = this.appResponsiveSpacing.tablet;
    } else if (screenSize.isDesktop && this.appResponsiveSpacing.desktop) {
      spacing = this.appResponsiveSpacing.desktop;
    } else {
      // Fallback al valor por defecto
      spacing = this.appResponsiveSpacing.mobile ||
                this.appResponsiveSpacing.tablet ||
                this.appResponsiveSpacing.desktop ||
                '16px';
    }

    const element = this.elementRef.nativeElement;
    this.renderer.setStyle(element, this.spacingType, spacing);
  }
}

/**
 * Directiva para texto responsivo
 * Uso: <h1 [appResponsiveText]="{ mobile: '24px', tablet: '32px', desktop: '40px' }">
 */
@Directive({
  selector: '[appResponsiveText]',
  standalone: true
})
export class ResponsiveTextDirective implements OnInit, OnDestroy {
  @Input() appResponsiveText: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  } = {};

  private destroy$ = new Subject<void>();

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private responsiveService: ResponsiveService
  ) {}

  ngOnInit(): void {
    this.responsiveService.screenSize$
      .pipe(takeUntil(this.destroy$))
      .subscribe(screenSize => {
        this.updateFontSize(screenSize);
      });

    // Aplicar tamaño inicial
    this.updateFontSize(this.responsiveService.currentScreenSize);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateFontSize(screenSize: any): void {
    let fontSize: string;

    if (screenSize.isMobile && this.appResponsiveText.mobile) {
      fontSize = this.appResponsiveText.mobile;
    } else if (screenSize.isTablet && this.appResponsiveText.tablet) {
      fontSize = this.appResponsiveText.tablet;
    } else if (screenSize.isDesktop && this.appResponsiveText.desktop) {
      fontSize = this.appResponsiveText.desktop;
    } else {
      // Fallback
      fontSize = this.appResponsiveText.mobile ||
                 this.appResponsiveText.tablet ||
                 this.appResponsiveText.desktop ||
                 '16px';
    }

    const element = this.elementRef.nativeElement;
    this.renderer.setStyle(element, 'font-size', fontSize);
  }
}

/**
 * Array con todas las directivas para exportación
 */
export const RESPONSIVE_DIRECTIVES = [
  ShowOnMobileDirective,
  ShowOnTabletDirective,
  ShowOnDesktopDirective,
  ShowOnBreakpointDirective,
  ResponsiveClassDirective,
  ResponsiveSpacingDirective,
  ResponsiveTextDirective
];