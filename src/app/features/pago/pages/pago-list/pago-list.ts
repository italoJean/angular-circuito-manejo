import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ModalService } from '../../../../shared/services/modal.service';
import { ReservaService } from '../../../reserva/services/reserva.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { PagoService } from '../../services/pago.service';
import { PagoForm } from '../pago-form/pago-form';
import { Grid } from "../../../../shared/components/grid/grid";
import { PagoDetailDialog } from '../../components/pago-detail-dialog/pago-detail-dialog';
import { PagoListadoResponseDTO } from '../../model/pago-listado.response.model';
import { PagoDetalleResponseDTO } from '../../model/pago-detalle.response.model';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { ReservaMinutosModal } from '../../../reserva/components/reserva-minutos-modal/reserva-minutos-modal';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-pago-list',
  imports: [Grid,MaterialModule],
  templateUrl: './pago-list.html',
  styleUrl: './pago-list.scss',
})
export class PagoList implements OnInit{
  // INYECCIÓN DE SERVICIOS
  private readonly _modalService = inject(ModalService);
  private readonly _pagoService = inject(PagoService);
  private readonly _reservaService = inject(ReservaService);
  private readonly _notificacionService = inject(NotificacionService);
  private readonly _destroyRef = inject(DestroyRef);

  // ESTADO REACTIVO
  // data: Lista de pagos formateada para el listado principal (DTO optimizado)
  data = signal<PagoListadoResponseDTO[]>([]);

  // CONFIGURACIÓN DE TABLA
  // 'details' es una columna de acción personalizada para ver el desglose del pago
  displayedColumns: Array<string> = [
    'id', 'numeroBoleta', 'nombreUsuario', 'apellidoUsuario', 
    'nombrePaquete', 'monto', 'tipoPago', 'fechaPago', 'estado', 'details'
  ];

  sortables: Array<string> = [
    'id', 'nombreUsuario', 'apellidoUsuario', 'nombrePaquete', 
    'fechaPago', 'estado', 'monto', 'tipoPago'
  ];

  readonly columnLabels = signal<Record<string, string>>({
    id: 'ID',
    numeroBoleta: 'N° Boleta',
    nombreUsuario: 'Cliente',
    apellidoUsuario: 'Apellido',
    nombrePaquete: 'Paquete',
    monto: 'Monto Total',
    tipoPago: 'Método',
    fechaPago: 'Fecha',
    estado: 'Estado',
    details: 'Ver Detalle',
  });

  ngOnInit(): void {
    this.loadPagos();
  }

  /**
   * Carga la lista general de pagos.
   * Se usa takeUntilDestroyed para evitar fugas de memoria si se cambia de vista rápido.
   */
  loadPagos(): void {
    this._pagoService.findAll()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (pagos) => this.data.set(pagos),
        error: (err) => {
          console.error('Error al cargar pagos:', err);
          this._notificacionService.error('No se pudo sincronizar la lista de pagos');
        }
      });
  }

  /**
   * Apertura de modal para registro de nuevo pago.
   * Solo recarga la lista si el modal devuelve un objeto (confirmación de éxito).
   */
  openCreateModal(): void {
    this._modalService.openModal(PagoForm)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((nuevo) => {
        if (nuevo) {
          this._notificacionService.success('Pago registrado y boleta generada');
          this.loadPagos();
        }
      });
  }

  /**
   * LÓGICA DE DETALLE:
   * El listado principal no trae toda la información por rendimiento.
   * Al hacer clic, consultamos el detalle completo (PagoDetalleResponseDTO) y lo abrimos.
   */
  onViewDetails(pagoListado: PagoListadoResponseDTO): void {
    if (!pagoListado.id) return;

    this._pagoService.findByDetalleId(pagoListado.id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (pagoDetalle: PagoDetalleResponseDTO) => {
          this._modalService.openModal(PagoDetailDialog, pagoDetalle).subscribe();
        },
        error: (err) => {
          console.error('Error cargando detalles:', err);
          this._notificacionService.error('No se pudo obtener el desglose de este pago');
        }
      });
  }

  /**
   * RELACIÓN CON RESERVAS:
   * Permite ver qué reservas específicas y cuántos minutos consumió este pago.
   */
  onViewReservas(pago: PagoListadoResponseDTO): void {
    this._reservaService.findByIdMinutos(pago.id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response) => {
          this._modalService.openModal(ReservaMinutosModal, response).subscribe();
        },
        error: () => {
          this._notificacionService.error('Error al vincular los minutos con las reservas');
        }
      });
  }
}