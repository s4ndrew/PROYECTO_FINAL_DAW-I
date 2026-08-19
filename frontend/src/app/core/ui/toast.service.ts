import { Injectable, signal } from '@angular/core';

export type TipoToast = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  tipo: TipoToast;
  titulo: string;
  detalle?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private contador = 0;
  private readonly lista = signal<Toast[]>([]);

  readonly toasts = this.lista.asReadonly();

  success(titulo: string, detalle?: string): void {
    this.mostrar('success', titulo, detalle, 5000);
  }

  info(titulo: string, detalle?: string): void {
    this.mostrar('info', titulo, detalle, 5000);
  }

  warning(titulo: string, detalle?: string): void {
    this.mostrar('warning', titulo, detalle, 6000);
  }

  error(titulo: string, detalle?: string): void {
    this.mostrar('error', titulo, detalle);
  }

  cerrar(id: number): void {
    this.lista.update((actuales) => actuales.filter((t) => t.id !== id));
  }

  private mostrar(tipo: TipoToast, titulo: string, detalle?: string, duracionMs?: number): void {
    const id = ++this.contador;
    this.lista.update((actuales) => [...actuales, { id, tipo, titulo, detalle }]);
    if (duracionMs) {
      setTimeout(() => this.cerrar(id), duracionMs);
    }
  }
}
