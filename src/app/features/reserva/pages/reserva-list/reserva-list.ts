import { Component, inject, OnInit, signal } from '@angular/core';
import { ModalService } from '../../../../shared/services/modal.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { DialogService } from '../../../../shared/services/dialog.service';
import { ReservaForm } from '../reserva-form/reserva-form';
import { ReservaResponse } from '../../model/reserva-response.model';
import { ReservaService } from '../../services/reserva.service';
import { Grid } from "../../../../shared/components/grid/grid";
import { MaterialModule } from "../../../../shared/ui/material-module";
import { ReservaReprogramarModal } from '../../components/reserva-reprogramar-modal/reserva-reprogramar-modal';
import { ReprogramacionRequestDTO } from '../../model/event/reprogramacion-request.model';
import { ReservaIncidenciaModal } from '../../components/reserva-incidencia-modal/reserva-incidencia-modal';
import { IncidenciaRequestDTO } from '../../model/event/incidencia-request.model';

@Component({
  selector: 'app-reserva-list',
  imports: [Grid, MaterialModule],
  templateUrl: './reserva-list.html',
  styleUrl: './reserva-list.scss',
})
export class ReservaList implements OnInit{

  // SERVICIOS: Inyección moderna y privada.
  private readonly _modalService = inject(ModalService);
  private readonly _reservaService = inject(ReservaService);
  private readonly _notificacionService = inject(NotificacionService);
  private readonly _dialogService = inject(DialogService);

  // ESTADO: Uso de Signals para reactividad eficiente.
  data = signal<ReservaResponse[]>([]);
  isLoading = signal<boolean>(false); // Tip extra: control de carga.

  // CONFIGURACIÓN DE TABLA: 
  // Definir columnas y etiquetas por separado ayuda a la internacionalización o cambios rápidos de UI.
  displayedColumns: string[] = [
    'id', 'numeroBoleta', 'nombre', 'apellido', 
    'placaVehiculo', 'modeloVehiculo', 'fechaReserva', 
    'fechaFin', 'minutosReservados', 'estado', 'cambios'
  ];

  sortables: Array<string> = ['id','nombre','apellido','placaVehiculo', 'modeloVehiculo', 'fechaReserva', 'fechaFin','minutosReservados', 'estado'];

  readonly columnLabels = signal<Record<string, string>>({
    id: 'ID',
    numeroBoleta: 'N° Boleta',
    nombre: 'Nombre',
    apellido: 'Apellido',
    placaVehiculo: 'Placa',
    modeloVehiculo: 'Modelo',
    fechaReserva: 'Fecha Inicio',
    fechaFin: 'Fecha Fin',
    minutosReservados: 'Reserva',
    estado: 'Estado',
    cambios: 'Acciones' // Corregido: 'action' -> 'cambios' según displayedColumns
  });

  ngOnInit(): void {
    this.loadReservas();
  }

  /**
   * Obtiene todas las reservas del backend.
   * Si la lista crece mucho, implementar paginación desde el servicio.
   */
  loadReservas(): void {
    this.isLoading.set(true);
    this._reservaService.findAll().subscribe({
      next: (reservas) => {
        this.data.set(reservas);
        this.isLoading.set(false);
      },
      error: () => {
        this._notificacionService.error('No se pudo conectar con el servidor');
        this.isLoading.set(false);
      }
    });
  }

  // GESTIÓN DE MODALES (FLUJO: Abrir -> Recibir Datos -> Llamar API -> Refrescar) ---

  openCreateModal(): void {
    this._modalService.openModal(ReservaForm).subscribe((nueva) => {
      if (nueva) {
        this._notificacionService.success('Reserva creada correctamente');
        this.loadReservas();
      }
    });
  }

  /**
   * Reprogramación: Recibe fechas nuevas desde el modal.
   * El modal devuelve un objeto ReprogramacionRequestDTO o undefined si cancela.
   */
  openReprogramarModal(reserva: ReservaResponse): void {
    this._modalService
      .openModal(ReservaReprogramarModal, { id: reserva.id })
      .subscribe((dto: ReprogramacionRequestDTO | undefined) => {
        if (!dto) return; // Cláusula de guarda: si no hay datos, no hacer nada.

        this._reservaService.reprogramar(reserva.id, dto).subscribe({
          next: () => {
            this._notificacionService.success('Reserva reprogramada exitosamente');
            this.loadReservas();
          },
          error: (err) => this._handleError(err, 'Error al reprogramar')
        });
      });
  }

  /**
   * Incidencias: Registra observaciones sobre la reserva (retrasos, daños, etc.)
   */
  openIncidenciaModal(reserva: ReservaResponse): void {
    this._modalService
      .openModal(ReservaIncidenciaModal, { reservaId: reserva.id })
      .subscribe((result: { detalle: string } | undefined) => {
        if (!result?.detalle) return;

        const dto: IncidenciaRequestDTO = { detalle: result.detalle };

        this._reservaService.registrarIncidencia(reserva.id, dto).subscribe({
          next: () => {
            this._notificacionService.success('Incidencia registrada');
            this.loadReservas();
          },
          error: () => this._notificacionService.error('No se pudo registrar la incidencia')
        });
      });
  }

  /**
   * Cancelación: Usa un diálogo de confirmación genérico antes de llamar a la API.
   */
  openCancelarModal(reserva: ReservaResponse): void {
    this._dialogService
      .confirm('Cancelar Reserva', `¿Seguro que deseas cancelar la reserva #${reserva.id}? Esta acción es irreversible.`)
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this._reservaService.cancelar(reserva.id).subscribe({
          next: () => {
            this._notificacionService.success('Reserva cancelada');
            this.loadReservas();
          },
          error: () => this._notificacionService.error('Error al intentar cancelar la reserva')
        });
      });
  }

  // MÉTODO AUXILIAR: Evita repetir lógica de logs de errores.
  private _handleError(err: any, mensaje: string): void {
    console.error(mensaje, err);
    this._notificacionService.error(mensaje);
  }
}
  /*
  private readonly _modalService=inject(ModalService);
  private readonly _reservaService=inject(ReservaService);
  private readonly _notificacionService=inject(NotificacionService);
  private readonly _dialogService=inject(DialogService);

  // Guarda el estado de la lista de reservas.
  data = signal<ReservaResponse[]>([]);

  // ✅ Columnas a mostrar (usa las relaciones)
  displayedColumns: Array<string> = [
    'id', 'numeroBoleta','nombre','apellido','placaVehiculo', 'modeloVehiculo', 'fechaReserva', 'fechaFin','minutosReservados', 'estado', 'cambios'
  ];

  // ✅ Columnas ordenables (solo algunas)
  sortables: Array<string> = ['id','nombre','apellido','placaVehiculo', 'modeloVehiculo', 'fechaReserva', 'fechaFin','minutosReservados', 'estado'] as const;

  // ✅ Etiquetas de las columnas (Signal)
  readonly columnLabels = signal<Record<string, string>>({
    id: 'ID',
    numeroBoleta: 'Número Boleta',
    nombre: 'Nombre',
    apellido: 'Apellido',
    placaVehiculo: 'Placa Vehículo',
    modeloVehiculo: 'Modelo Vehículo',
    fechaReserva: 'Fecha inicio',
    fechaFin: 'Fecha Fin',
    minutosReservados: 'Reservados  ',
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


  openReprogramarModal(reserva: ReservaResponse): void {
  this._modalService
    .openModal(ReservaReprogramarModal, { id: reserva.id })
    .subscribe((dto: ReprogramacionRequestDTO | undefined) => {
      if (dto) {
        this._reservaService.reprogramar(reserva.id, dto).subscribe({
          next: () => {
            this._notificacionService.success('Reserva reprogramada');
            this.loadReservas();
          },
          error: () => {
            this._notificacionService.error('Error al reprogramar');
          }
        });
      }
    });
}


openIncidenciaModal(reserva: ReservaResponse): void {
  this._modalService
    .openModal(ReservaIncidenciaModal, { reservaId: reserva.id }) // Pasamos el ID con el nombre 'reservaId'
    .subscribe((data: { detalle: string } | undefined) => {
      // 2. Cuando el modal se cierra, esperamos un objeto { detalle: string }
      if (data && data.detalle) { 

        const incidenciaDTO: IncidenciaRequestDTO = {
            detalle: data.detalle
        };

        // 3. Llamamos al servicio con el ID y el detalle.
        this._reservaService.registrarIncidencia(reserva.id, incidenciaDTO).subscribe({
          next: () => {
            this._notificacionService.success('Incidencia registrada');
            this.loadReservas();
          },
          error: () => {
            this._notificacionService.error('Error al registrar incidencia');
          }
        });
      }
    });
}

openCancelarModal(reserva: ReservaResponse): void {
  this._dialogService
    .confirm('Cancelar Reserva', `¿Seguro que deseas cancelar la reserva #${reserva.id}?`)
    .subscribe((confirmed) => {
      if (confirmed) {
        this._reservaService.cancelar(reserva.id).subscribe({
          next: () => {
            this._notificacionService.success('Reserva cancelada');
            this.loadReservas();
          },
          error: () => {
            this._notificacionService.error('Error al cancelar');
          }
        });
      }
    });
}

}

*/