import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { ModalService } from '../../../../shared/services/modal.service';
import { ReservaService } from '../../../reserva/services/reserva.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { DialogService } from '../../../../shared/services/dialog.service';
import { PagoService } from '../../services/pago.service';
import { PagoForm } from '../pago-form/pago-form';
import { Grid } from "../../../../shared/components/grid/grid";
import { PagoDetailDialog } from '../../components/pago-detail-dialog/pago-detail-dialog';
import { PagoListadoResponseDTO } from '../../model/pago-listado.response.model';
import { PagoDetalleResponseDTO } from '../../model/pago-detalle.response.model';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { ReservaMinutosModal } from '../../../reserva/components/reserva-minutos-modal/reserva-minutos-modal';

@Component({
  selector: 'app-pago-list',
  imports: [Grid,MaterialModule],
  templateUrl: './pago-list.html',
  styleUrl: './pago-list.scss',
})
export class PagoList implements OnInit{
  
  private readonly _modalService=inject(ModalService);
  private readonly _pagoService=inject(PagoService);
  private readonly _reservaService=inject(ReservaService);
  private readonly _notificacionService=inject(NotificacionService);
  private readonly _dialogService=inject(DialogService);

  

  // Guarda el estado de la lista de pagos.
  data = signal<PagoListadoResponseDTO[]>([]);

//   // ✅ Columnas a mostrar (usa las relaciones)
//   displayedColumns: Array<keyof PagoListadoResponseDTO | 'action' | 'details'> = [
//   'id','numeroBoleta', 'nombreUsuario', 'apellidoUsuario', 'nombrePaquete', 'monto','tipoPago', 'fechaPago', 'estado', 'details', 'action'
// ];


  // ✅ Columnas a mostrar (usa las relaciones)
  displayedColumns: Array<string> = [
  'id','numeroBoleta', 'nombreUsuario', 'apellidoUsuario', 'nombrePaquete', 'monto','tipoPago', 'fechaPago', 'estado', 'details'
];

  // ✅ Columnas ordenables (solo algunas)
  sortables: Array<string> = ['id', 'nombreUsuario', 'apellidoUsuario', 'nombrePaquete', 'fechaPago', 'estado', 'monto','tipoPago'] as const;

  // ✅ Etiquetas de las columnas (Signal)
  readonly columnLabels = signal<Record<string, string>>({
    id: 'ID',
    numeroBoleta: 'N° Boleta',
    nombreUsuario: 'Nombre',
    apellidoUsuario: 'Apellido',
    nombrePaquete: 'Paquete',
    monto: 'Monto',
    tipoPago: 'Tipo de Pago',
    fechaPago: 'Fecha de Pago',
    estado: 'Estado',
    details: 'Detalles',
  });

  ngOnInit(): void {
    this.loadPagos();
  }

  // ✅ Cargar todos los pagos
  loadPagos() {
    this._pagoService.findAll().subscribe({
      next: (pagos) => {
        this.data.set(pagos);
        console.log('Pagos cargados:', pagos);
      },
      error: (err) => {
        console.error('Error al cargar pagos:', err);
        this._notificacionService.error('Error al cargar pagos');
      }
    });
  }

  // ✅ Abrir modal de creación
  openCreateModal(): void {
    this._modalService.openModal(PagoForm).subscribe((nuevo) => {
      if (nuevo) {
        this._notificacionService.success('Pago creado correctamente');
        this.loadPagos();
      }
    });
  }

  /*
  // ✅ Abrir modal de edición
  openEditModal(pago: PagoListadoResponseDTO): void {
    this._modalService.openModal(PagoForm, pago).subscribe((editado) => {
      if (editado) {
        this._notificacionService.success('Pago actualizado correctamente');
        this.loadPagos();
      }
    });
  }

  /*
  // ✅ Eliminar pago con confirmación
  deletePago(pago: PagoListadoResponseDTO): void {
    this._dialogService
      .confirm('Eliminar Pago', `¿Seguro que deseas eliminar el pago N°${pago.id}?`)
      .subscribe((confirmed) => {
        if (confirmed) {
          this._pagoService.delete(pago.id).subscribe({
            next: () => {
              this._notificacionService.success('Pago eliminado correctamente');
              this.loadPagos();
            },
            error: () => this._notificacionService.error('Error al eliminar pago'),
          });
        }
      });
  }*/

onViewDetails(pagoListado: PagoListadoResponseDTO): void {
  // Primero obtenemos el detalle completo usando el ID
  this._pagoService.findByDetalleId(pagoListado.id).subscribe({
    next: (pagoDetalle: PagoDetalleResponseDTO) => {
      // Ahora pasamos el DTO correcto al modal
      this._modalService.openModal(PagoDetailDialog, pagoDetalle).subscribe();
    },
    error: (err) => {
      console.error('Error cargando detalles:', err);
      this._notificacionService.error('Error al cargar detalles del pago');
    }
  });
}

onViewReservas(pago: PagoListadoResponseDTO): void {
  this._reservaService.findByIdMinutos(pago.id).subscribe({
    next: (response)=>{
      this._modalService.openModal(ReservaMinutosModal,response).subscribe();
    },
    error:()=> {
      this._notificacionService.error('No se pudieron cargar los minutos consumidos');

    }
  })
}

}
