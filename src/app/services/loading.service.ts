/**
 * Servicio global para gestionar estados de carga
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
  id: string;
  message?: string;
  isLoading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingStates = new Map<string, LoadingState>();
  private loadingSubject = new BehaviorSubject<LoadingState[]>([]);

  public loading$ = this.loadingSubject.asObservable();

  // Observable que emite true cuando hay al menos una carga activa
  public isLoading$: Observable<boolean> = new BehaviorSubject(false);
  private isLoadingSubject = this.isLoading$ as BehaviorSubject<boolean>;

  constructor() {}

  /**
   * Inicia un estado de carga
   * @param id Identificador único para la carga
   * @param message Mensaje opcional para mostrar
   */
  startLoading(id: string, message?: string): void {
    const loadingState: LoadingState = {
      id,
      message,
      isLoading: true
    };

    this.loadingStates.set(id, loadingState);
    this.updateLoadingStates();
  }

  /**
   * Termina un estado de carga
   * @param id Identificador de la carga a terminar
   */
  stopLoading(id: string): void {
    this.loadingStates.delete(id);
    this.updateLoadingStates();
  }

  /**
   * Verifica si existe una carga específica
   * @param id Identificador de la carga
   */
  isLoadingId(id: string): boolean {
    return this.loadingStates.has(id);
  }

  /**
   * Obtiene una carga específica
   * @param id Identificador de la carga
   */
  getLoadingState(id: string): LoadingState | undefined {
    return this.loadingStates.get(id);
  }

  /**
   * Termina todas las cargas
   */
  stopAllLoading(): void {
    this.loadingStates.clear();
    this.updateLoadingStates();
  }

  /**
   * Obtiene el observable para una carga específica
   * @param id Identificador de la carga
   */
  getLoadingById$(id: string): Observable<boolean> {
    return new BehaviorSubject(this.isLoadingId(id));
  }

  /**
   * Actualiza los subjects con el estado actual
   */
  private updateLoadingStates(): void {
    const states = Array.from(this.loadingStates.values());
    this.loadingSubject.next(states);
    this.isLoadingSubject.next(states.length > 0);
  }

  /**
   * Método de utilidad para envolver operaciones asíncronas
   * @param id Identificador de la carga
   * @param operation Función que retorna una Promise
   * @param message Mensaje opcional
   */
  async withLoading<T>(
    id: string,
    operation: () => Promise<T>,
    message?: string
  ): Promise<T> {
    this.startLoading(id, message);
    try {
      const result = await operation();
      this.stopLoading(id);
      return result;
    } catch (error) {
      this.stopLoading(id);
      throw error;
    }
  }

  /**
   * Método de utilidad para envolver Observables
   * @param id Identificador de la carga
   * @param operation Función que retorna un Observable
   * @param message Mensaje opcional
   */
  withLoadingObservable<T>(
    id: string,
    operation: () => Observable<T>,
    message?: string
  ): Observable<T> {
    this.startLoading(id, message);

    return new Observable(observer => {
      const subscription = operation().subscribe({
        next: (value) => {
          observer.next(value);
        },
        error: (error) => {
          this.stopLoading(id);
          observer.error(error);
        },
        complete: () => {
          this.stopLoading(id);
          observer.complete();
        }
      });

      // Cleanup en caso de unsubscribe
      return () => {
        this.stopLoading(id);
        subscription.unsubscribe();
      };
    });
  }
}