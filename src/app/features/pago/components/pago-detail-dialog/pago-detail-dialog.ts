import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef , MatDialog } from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { CuotaResponseDTO } from '../../model/cuota-response.model';
import { PagoDetalleResponseDTO } from '../../model/pago-detalle.response.model';
import { TipoPagoEnum } from '../../enum/tipo-pago.enum';
import { MaterialModule } from "../../../../shared/ui/material-module";
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { PagoService } from '../../services/pago.service';
import { ConfirmarPagoCuotaDialog } from '../confirmar-pago-cuota-dialog/confirmar-pago-cuota-dialog';
import { EstadoPagoEnum } from '../../enum/estado-pago.enum';
import { ConfirmSuspendPagoDialog } from '../confirm-suspend-pago-dialog/confirm-suspend-pago-dialog';

@Component({
  selector: 'app-pago-detail-dialog',
  imports: [CommonModule, DatePipe, MaterialModule],
  templateUrl: './pago-detail-dialog.html',
  styleUrl: './pago-detail-dialog.scss',
})
export class PagoDetailDialog {
  // INYECCIONES DE DEPENDENCIAS 
  private readonly _pagoService = inject(PagoService);
  private readonly _notify = inject(NotificacionService);
  private readonly _dialog = inject(MatDialog);
  private readonly _dialogRef = inject(MatDialogRef<PagoDetailDialog>);

  // Configuración de la tabla
  displayedColumns: string[] = [
    'numeroCuota', 
    'montoCuota', 
    'fechaVencimiento',
    'metodoPago', 
    'estadoCuota',
    'acciones'
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PagoDetalleResponseDTO
  ) {}

  //  ACCIONES PRINCIPALES

  /**
   * Procesa el pago de una cuota individual.
   * Abre un diálogo para elegir el método de pago y actualiza la UI localmente al éxito.
   */
  onPayCuota(cuota: CuotaResponseDTO): void {
    const dialogRef = this._dialog.open(ConfirmarPagoCuotaDialog, {
      width: '350px',
      data: { numeroCuota: cuota.numeroCuota }
    });

    dialogRef.afterClosed().subscribe((metodoPagoSeleccionado) => {
      if (!metodoPagoSeleccionado) return; // Salir si el usuario canceló

      this._pagoService.pagarCuota(this.data.id, cuota.numeroCuota, metodoPagoSeleccionado)
        .subscribe({
          next: () => {
            // ACTUALIZACIÓN OPTIMISTA: Modificamos el objeto en memoria para que la tabla cambie al instante
            cuota.estadoCuota = EstadoPagoEnum.PAGADO;
            cuota.metodoPago = metodoPagoSeleccionado;

            // Si ya no quedan pendientes, el pago general cambia a PAGADO
            if (this.getTotalPendiente() === 0) {
              this.data.estado = EstadoPagoEnum.PAGADO;
            }

            this._notify.success(`Cuota #${cuota.numeroCuota} pagada correctamente.`);
          },
          error: (err) => this._notify.error(err.error?.mensaje || "No se pudo procesar el pago.")
        });
    });
  }

  /**
   * Suspende el pago completo.
   * Afecta a todas las cuotas que aún están en estado PENDIENTE.
   */
  onSuspendPago(): void {
    // Contamos cuotas pendientes para informar al usuario en el diálogo
    const pendientes = (this.data.cuotas || []).filter(c => c.estadoCuota === EstadoPagoEnum.PENDIENTE).length;

    const dialogRef = this._dialog.open(ConfirmSuspendPagoDialog, {
      width: '450px',
      data: {
        numeroBoleta: this.data.numeroBoleta,
        monto: this.data.monto,
        tipoPago: this.data.tipoPago,
        pendientes
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this._pagoService.suspenderPago(this.data.id).subscribe({
        next: () => {
          // ACTUALIZACIÓN DE ESTADOS: Reflejamos la cancelación en la cabecera y en las cuotas pendientes
          this.data.estado = EstadoPagoEnum.CANCELADO;
          
          if (this.data.cuotas) {
            this.data.cuotas = this.data.cuotas.map(cuota => 
              cuota.estadoCuota === EstadoPagoEnum.PENDIENTE
                ? { ...cuota, estadoCuota: EstadoPagoEnum.CANCELADO }
                : cuota
            );
          }
          this._notify.success('Pago y cuotas pendientes suspendidos.');
        },
        error: () => this._notify.error('Error al suspender el pago.')
      });
    });
  }

  // GETTERS Y FORMATEO (Lógica de Presentación)

  // NOTA: Usar getters es cómodo, pero si la lógica es muy pesada, 
  // considera usar Signals para mejorar el rendimiento.

  get usuarioCompleto(): string {
    const { nombre = '', apellido = '' } = this.data?.usuario || {};
    return `${nombre} ${apellido}`.trim() || 'N/A';
  }

  get paqueteDuracion(): string {
    const minutos = this.data?.paquete?.duracionMinutos;
    if (!minutos) return 'N/A';
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return horas > 0 ? `${horas}h ${mins}min` : `${mins}min`;
  }

  formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(monto);
  }

  getTotalPagado(): number {
    return this.data?.cuotas
      ?.filter(c => c.estadoCuota === EstadoPagoEnum.PAGADO)
      .reduce((acc, c) => acc + c.montoCuota, 0) || 0;
  }

  getTotalPendiente(): number {
    return this.data?.cuotas
      ?.filter(c => c.estadoCuota === EstadoPagoEnum.PENDIENTE)
      .reduce((acc, c) => acc + c.montoCuota, 0) || 0;
  }

  getPorcentajePagado(): number {
    if (!this.data?.monto) return 0;
    return Math.round((this.getTotalPagado() / this.data.monto) * 100);
  }

  get isPagoCuotas(): boolean {
    return this.data?.tipoPago === TipoPagoEnum.CUOTAS;
  }

  get hasCuotas(): boolean {
    return !!this.data?.cuotas?.length;
  }

  close(): void {
    this._dialogRef.close();
  }
}