import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FullCalendar } from '../../../../shared/components/full-calendar/full-calendar';
import { ReservaService } from '../../../reserva/services/reserva.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../../../shared/services/modal.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { ReservaDetalleModal } from '../../../reserva/components/reserva-detalle-modal/reserva-detalle-modal';
import { HorarioOcupadoDTO } from '../../../reserva/model/event/horario-ocupado.model';
import { MaterialModule } from "../../../../shared/ui/material-module";
import { finalize } from 'rxjs';

@Component({
  selector: 'app-calendario',
  imports: [FullCalendar, MaterialModule],
  templateUrl: './calendario.html',
  styleUrl: './calendario.scss',
  
})
export class Calendario implements OnInit {
  private readonly _reservaService = inject(ReservaService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _modalService = inject(ModalService);
  private readonly _notify = inject(NotificacionService)

  // Usar Signals permite que Angular actualice solo lo que cambia en el DOM.
  reservas = signal<HorarioOcupadoDTO[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.cargarReservas();
  }

  /**
   * Carga todas las reservas para visualización global.
   * Se utiliza pipe(takeUntilDestroyed) para evitar fugas de memoria (Memory Leaks)
   * si el usuario navega fuera de esta vista antes de que termine la petición.
   */
  cargarReservas(): void {
    this.isLoading.set(true);

    this._reservaService
      .findAllCalendario()
      .pipe(
        // El operador finalize se ejecuta tanto en éxito como en error (limpia el código)
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (data: HorarioOcupadoDTO[]) => {
          this.reservas.set(data); // El Signal notifica automáticamente al componente hijo
        },
        error: (err) => {
          console.error('Error al cargar reservas:', err);
          this._notify.error('No se pudieron sincronizar las reservas.');
        },
      });
  }

  /**
   * MANEJO DE CLIC EN EVENTO
   * No solo abre el modal, sino que escucha el cierre para refrescar datos 
   * si hubo cambios (como cancelaciones o ediciones).
   */
  handleEventClick(reservaId: number): void {
    if (!reservaId) return;

    this._reservaService
      .findByIdDetalle(reservaId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (detalle) => this._abrirModalDetalle(detalle),
        error: (err) => {
          console.error('Error al obtener detalle:', err);
          this._notify.error('La información de la reserva no está disponible.');
        }
      });
  }

  /**
   * Método privado para encapsular la apertura del modal.
   * Si el modal devuelve un valor de 'refresh', el calendario se actualiza solo.
   */
  private _abrirModalDetalle(detalle: any): void {
    this._modalService
      .openModal(ReservaDetalleModal, detalle, {
        width: '650px'
      })
      .subscribe((result) => {
        // Si el modal hizo cambios (ej. cancelar reserva), refresca la lista.
        if (result?.shouldRefresh) {
          this.cargarReservas();
        }
      });
  }
}
