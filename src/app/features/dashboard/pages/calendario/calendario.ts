import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FullCalendar } from '../../../../shared/components/full-calendar/full-calendar';
import { ReservaService } from '../../../reserva/services/reserva.service';
import { ReservaResponse } from '../../../reserva/model/reserva-response.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../../../shared/services/modal.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { ReservaDetalleModal } from '../../../reserva/components/reserva-detalle-modal/reserva-detalle-modal';
import { HorarioOcupadoDTO } from '../../../reserva/model/event/horario-ocupado.model';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MaterialModule } from "../../../../shared/ui/material-module";

@Component({
  selector: 'app-calendario',
  imports: [FullCalendar, MatProgressSpinnerModule, MaterialModule],
  templateUrl: './calendario.html',
  styleUrl: './calendario.scss',
  
})
export class Calendario implements OnInit {
  private readonly reservaService = inject(ReservaService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly modalService = inject(ModalService);
  private readonly notificacionService = inject(NotificacionService);

  // Lista de reservas que se pasará al componente hijo
  reservas = signal<HorarioOcupadoDTO[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {

    this.isLoading.set(true);
    this.reservaService
      .findAllCalendario()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: HorarioOcupadoDTO[]) => {
          this.reservas.set(data); // El Signal notifica automáticamente al componente hijo
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar reservas:', err);
          this.isLoading.set(false);
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
