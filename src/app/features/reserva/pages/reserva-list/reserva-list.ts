import { Component, inject, OnInit, signal } from '@angular/core';
import { ModalService } from '../../../../shared/services/modal.service';
import { PaqueteService } from '../../../paquete/services/paquete.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { DialogService } from '../../../../shared/services/dialog.service';
import { ReservaForm } from '../reserva-form/reserva-form';
import { ReservaResponse } from '../../model/reserva-response.model';
import { ReservaService } from '../../services/reserva.service';
import { Filter } from "../../../../shared/components/grid/filter/filter";
import { Grid } from "../../../../shared/components/grid/grid";

@Component({
  selector: 'app-reserva-list',
  imports: [ Grid],
  templateUrl: './reserva-list.html',
  styleUrl: './reserva-list.scss',
})
export class ReservaList implements OnInit{

  private readonly _modalService=inject(ModalService);
  private readonly _reservaService=inject(ReservaService);
  private readonly _notificacionService=inject(NotificacionService);
  private readonly _dialogService=inject(DialogService);

  // Guarda el estado de la lista de reservas.
  data = signal<ReservaResponse[]>([]);

  // ✅ Columnas a mostrar (usa las relaciones)
  displayedColumns: Array<keyof ReservaResponse | 'action'> = [
    'id', 'usuario', 'paquete', 'fechaReserva', 'estado', 'action'
  ];

  // ✅ Columnas ordenables (solo algunas)
  sortables: Array<string> = ['id', 'fechaReserva', 'estado'] as const;

  // ✅ Etiquetas de las columnas (Signal)
  readonly columnLabels = signal<Record<string, string>>({
    id: 'ID',
    usuario: 'Usuario',
    paquete: 'Paquete',
    fechaReserva: 'Fecha y hora de reserva',
    estado: 'Estado',
    action: 'Acción'
  });

  ngOnInit(): void {
    this.loadReservas();
  }

  // ✅ Cargar todas las reservas
  loadReservas() {
    this._reservaService.findAll().subscribe({
      next: (reservas) => {
        this.data.set(reservas);
        console.log('Reservas cargadas:', reservas);
      },
      error: (err) => {
        console.error('Error al cargar reservas:', err);
        this._notificacionService.error('Error al cargar reservas');
      }
    });
  }

  // ✅ Abrir modal de creación
  openCreateModal(): void {
    this._modalService.openModal(ReservaForm).subscribe((nueva) => {
      if (nueva) {
        this._notificacionService.success('Reserva creada correctamente');
        this.loadReservas();
      }
    });
  }

  // ✅ Abrir modal de edición
  openEditModal(reserva: ReservaResponse): void {
    this._modalService.openModal(ReservaForm, reserva).subscribe((editada) => {
      if (editada) {
        this._notificacionService.success('Reserva actualizada correctamente');
        this.loadReservas();
      }
    });
  }

  // ✅ Eliminar reserva con confirmación
  deleteReserva(reserva: ReservaResponse): void {
    this._dialogService
      .confirm('Eliminar Reserva', `¿Seguro que deseas eliminar la reserva N°${reserva.id}?`)
      .subscribe((confirmed) => {
        if (confirmed) {
          this._reservaService.delete(reserva.id).subscribe({
            next: () => {
              this._notificacionService.success('Reserva eliminada correctamente');
              this.loadReservas();
            },
            error: () => this._notificacionService.error('Error al eliminar reserva'),
          });
        }
      });
  }
}