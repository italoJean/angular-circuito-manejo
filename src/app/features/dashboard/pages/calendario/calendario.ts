import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FullCalendar } from '../../../../shared/components/full-calendar/full-calendar';
import { ReservaService } from '../../../reserva/services/reserva.service';
import { ReservaResponse } from '../../../reserva/model/reserva-response.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../../../shared/services/modal.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { ReservaDetalleModal } from '../../../reserva/components/reserva-detalle-modal/reserva-detalle-modal';
import { HorarioOcupadoDTO } from '../../../reserva/model/event/horario-ocupado.model';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-calendario',
  imports: [FullCalendar,MatProgressSpinnerModule],
  templateUrl: './calendario.html',
  styleUrl: './calendario.scss',
})
export class Calendario implements OnInit {
  private readonly reservaService = inject(ReservaService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly modalService = inject(ModalService);
  private readonly notificacionService = inject(NotificacionService);

  // Lista de reservas que se pasará al componente hijo
  reservas: HorarioOcupadoDTO[] = [];

  public isLoading: boolean = true;

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {

    this.reservaService
      .findAllCalendario()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: HorarioOcupadoDTO[]) => {
          this.reservas = data; //  Asigna la data. Esto dispara ngOnChanges en el componente hijo.
          // this.isLoading = false; // Oculta la carga
        },
        error: (err) => {
          console.error('Error al cargar reservas:', err);
          this.isLoading = false;
          this.notificacionService.error('Error al cargar las reservas existentes.');
        },
      });
  }

  handleEventClick(reservaId: number): void {
    this.reservaService.findByIdDetalle(reservaId).subscribe({
      next: (detalle) => {
        //  Si la data llega, usa el servicio de modal para abrir la ventana de detalles
        this.modalService
          .openModal(ReservaDetalleModal, detalle, {
            width: '650px',
          })
          .subscribe((result) => {
            //  Maneja el resultado después de cerrar el modal
            console.log('Modal cerrado con resultado:', result);
          });
      },
      error: (err) => {
        //  Muestra error si no se pudo cargar el detalle
        console.error('Error obteniendo detalle de reserva:', err);
        this.notificacionService.error('No se pudo cargar el detalle de la reserva.');
      },
    });
  }
}
