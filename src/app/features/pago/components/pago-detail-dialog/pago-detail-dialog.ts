import { Component, inject, Inject, Pipe } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions, MatDialog } from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CuotaResponseDTO } from '../../model/cuota-response.model';
import { PagoDetalleResponseDTO } from '../../model/pago-detalle.response.model';
import { TipoPagoEnum } from '../../enum/tipo-pago.enum';
import { MatCard, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MaterialModule } from "../../../../shared/ui/material-module";
import { MetodoPagoEnum } from '../../enum/metodo-pago.enum';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { PagoService } from '../../services/pago.service';
import { ConfirmarPagoCuotaDialog } from '../confirmar-pago-cuota-dialog/confirmar-pago-cuota-dialog';
import { EstadoPagoEnum } from '../../enum/estado-pago.enum';
import { ConfirmSuspendPagoDialog } from '../confirm-suspend-pago-dialog/confirm-suspend-pago-dialog';

@Component({
  selector: 'app-pago-detail-dialog',
  imports: [MatDialogContent, MatDialogActions, CommonModule, DatePipe, MatTableModule, MatCard, MatCardHeader, MatCardTitle, MaterialModule],
  templateUrl: './pago-detail-dialog.html',
  styleUrl: './pago-detail-dialog.scss',
})
export class PagoDetailDialog {
  
  
private readonly pagoService = inject(PagoService);
private readonly notify = inject(NotificacionService);
private readonly dialog = inject(MatDialog);

onPayCuota(cuota: CuotaResponseDTO) {
  const dialogRef = this.dialog.open(ConfirmarPagoCuotaDialog, {
    width: '350px',
    data: { numeroCuota: cuota.numeroCuota }
  });

  dialogRef.afterClosed().subscribe((metodoPagoSeleccionado) => {
    if (!metodoPagoSeleccionado) return; // Usuario canceló

    this.pagoService.pagarCuota(this.data.id, cuota.numeroCuota, metodoPagoSeleccionado)
      .subscribe({
        next: () => {
          cuota.estadoCuota = EstadoPagoEnum.PAGADO;
           cuota.metodoPago = metodoPagoSeleccionado;

  // Recalcular resumen
      const totalPendiente = this.getTotalPendiente();
      if (totalPendiente === 0) {
        this.data.estado = EstadoPagoEnum.PAGADO; // <--- SE ACTUALIZA LA CABECERA DEL PAGO
      }

          this.notify.success(`Cuota #${cuota.numeroCuota} pagada correctamente.`);
         
        },
        error: () => this.notify.error("No se pudo procesar el pago.")
      });
  });
}


  // Define el tipo correcto para las columnas basado en CuotaResponseDTO
  displayedColumns: string[] = ['numeroCuota', 'montoCuota', 'fechaVencimiento','metodoPago', 'estadoCuota','acciones'];
  



  // Propiedades para usuario
  get usuarioCompleto(): string {
    if (!this.data?.usuario) return 'N/A';
     const nombre = this.data.usuario.nombre || '';
     const apellido = this.data.usuario.apellido || '';
  return `${nombre} ${apellido}`.trim() || 'N/A';
  }

get usuarioTelefono(): string {
  return this.data?.usuario?.telefono || 'N/A';
}

  get usuarioEmail(): string {
  return this.data?.usuario?.email || 'N/A';
  }

  
get usuarioNumeroDocumento(): string {
  return this.data?.usuario?.numeroDocumento || 'N/A';
}

get usuarioTipoDocumento(): string {
  return this.data?.usuario?.tipoDocumento || 'N/A';
}


  // Propiedades para paquete
  get paqueteInfo(): string {
  return this.data?.paquete?.nombre || 'N/A';
  }

  get paquetePrecio(): string {
  if (!this.data?.paquete?.precioTotal) return 'N/A';
  return this.formatMonto(parseFloat(this.data.paquete.precioTotal as any));
  }

  get paqueteDescripcion(): string {
  return this.data?.paquete?.descripcion || 'N/A';
}


get paqueteDuracion(): string {
  if (!this.data?.paquete?.duracionMinutos) return 'N/A';
  const minutos = this.data.paquete.duracionMinutos;
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  
  if (horas > 0 && mins > 0) {
    return `${horas}h ${mins}min`;
  } else if (horas > 0) {
    return `${horas}h`;
  } else {
    return `${mins}min`;
  }
}
  
  // Validaciones
    get hasCuotas(): boolean {
    return Boolean(this.data?.cuotas?.length);
  }

  get isPagoCuotas(): boolean {
    return this.data?.tipoPago === TipoPagoEnum.CUOTAS;
  }

  get totalCuotas(): number {
    return this.data?.cuotas?.length || 0;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PagoDetalleResponseDTO,
    private dialogRef: MatDialogRef<PagoDetailDialog>
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  // Formatea montos a moneda peruana
  formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(monto);
  }

  
  /**
   * Calcula el total de cuotas pagadas
   */
  getTotalPagado(): number {
    if (!this.data?.cuotas) return 0;
    return this.data.cuotas
      .filter(c => c.estadoCuota === 'PAGADO')
      .reduce((acc, c) => acc + c.montoCuota, 0);
  }

  /**
   * Calcula el total de cuotas pendientes
   */
  getTotalPendiente(): number {
    if (!this.data?.cuotas) return 0;
    return this.data.cuotas
      .filter(c => c.estadoCuota === 'PENDIENTE')
      .reduce((acc, c) => acc + c.montoCuota, 0);
  }

  /**
   * Obtiene el porcentaje pagado
   */
  getPorcentajePagado(): number {
    if (!this.data?.monto || this.data.monto === 0) return 0;
    return Math.round((this.getTotalPagado() / this.data.monto) * 100);
  }

onSuspendPago1(): void {
  // Dialog de confirmación
  const confirmed = window.confirm(
    `¿Deseas suspender el pago N° ${this.data.numeroBoleta}?\n\n` +
    `Monto Total: ${this.formatMonto(this.data.monto)}\n` +
    `Tipo de Pago: ${this.data.tipoPago}\n\n` +
    `Esto afectará todas las cuotas asociadas.`
  );

  if (!confirmed) {
    return; // Usuario canceló
  }

  // Llamar al servicio para suspender el pago
  this.pagoService.suspenderPago(this.data.id).subscribe({
    next: (res) => {
      console.log('Pago suspendido:', res);
      
      // Actualizar el estado en memoria
      this.data.estado = EstadoPagoEnum.CANCELADO;
      
      // Opcional: actualizar todas las cuotas a SUSPENDIDO
      if (this.data.cuotas && this.data.cuotas.length > 0) {
        this.data.cuotas = this.data.cuotas.map(cuota => ({
          ...cuota,
          estadoCuota: EstadoPagoEnum.CANCELADO
        }));
      }
      
      // Mostrar mensaje de éxito
      alert('Pago suspendido correctamente.');
    },
    error: (err) => {
      console.error('Error al suspender pago:', err);
      alert('No se pudo suspender el pago. Intenta nuevamente.');
    }
  });
}

onSuspendPago2(): void {
  const dialogRef = this.dialog.open(ConfirmarPagoCuotaDialog, {
    width: '400px',
    data: {
      title: 'Suspender Pago',
      message: `¿Deseas suspender el pago N° ${this.data.numeroBoleta}?`,
      details: `to`,
      cancelText: 'Cancelar',
      confirmText: 'Sí, Suspender',
      confirmColor: 'warn'
    }
  });


  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      // Usuario confirmó
     this.pagoService.suspenderPago(this.data.id).subscribe({
    next: (res) => {
      console.log('Pago suspendido:', res);
      
      // Actualizar el estado en memoria
      this.data.estado = EstadoPagoEnum.CANCELADO;
      
      // Opcional: actualizar todas las cuotas a SUSPENDIDO
      if (this.data.cuotas && this.data.cuotas.length > 0) {
        this.data.cuotas = this.data.cuotas.map(cuota => ({
          ...cuota,
          estadoCuota: EstadoPagoEnum.CANCELADO
        }));
      }
      
      // Mostrar mensaje de éxito
      alert('Pago suspendido correctamente.');
    },
    error: (err) => {
      console.error('Error al suspender pago:', err);
      alert('No se pudo suspender el pago. Intenta nuevamente.');
    }
  });
    }
  });
}
onSuspendPago3(): void {
  // Contar cuotas pendientes
  const pendientes = (this.data.cuotas || []).filter(c => c.estadoCuota === 'PENDIENTE').length;

  // Abrir diálogo de confirmación
  const dialogRef = this.dialog.open(ConfirmSuspendPagoDialog, {
    width: '450px',
    data: {
      numeroBoleta: this.data.numeroBoleta,
      monto: this.data.monto,
      tipoPago: this.data.tipoPago,
      pendientes
    } as any
  });

  // Escuchar resultado del diálogo
  dialogRef.afterClosed().subscribe((confirmed: boolean) => {
    if (!confirmed) return; // Usuario canceló

    // Llamar al servicio para suspender el pago
    this.pagoService.suspenderPago(this.data.id).subscribe({
      next: (res) => {
        console.log('Pago suspendido:', res);
        
        // Actualizar el estado en memoria
        this.data.estado = EstadoPagoEnum.CANCELADO;
        
        // Actualizar todas las cuotas pendientes a CANCELADO
        if (this.data.cuotas && this.data.cuotas.length > 0) {
          this.data.cuotas = this.data.cuotas.map(cuota => 
            cuota.estadoCuota === 'PENDIENTE'
              ? { ...cuota, estadoCuota: EstadoPagoEnum.CANCELADO }
              : cuota
          );
        }
        
        // Mostrar notificación de éxito
        this.notify.success('Pago suspendido correctamente.');
      },
      error: (err) => {
        console.error('Error al suspender pago:', err);
        this.notify.error('No se pudo suspender el pago. Intenta nuevamente.');
      }
    });
  });
}

}