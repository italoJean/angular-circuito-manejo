import { Component, inject, Inject, signal } from '@angular/core';
import { MetodoPagoEnum } from '../../enum/metodo-pago.enum';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmar-pago-cuota-dialog',
  imports: [ MaterialModule],
  templateUrl: './confirmar-pago-cuota-dialog.html',
  styleUrl: './confirmar-pago-cuota-dialog.scss',
})
export class ConfirmarPagoCuotaDialog {
  private readonly _dialogRef = inject(MatDialogRef<ConfirmarPagoCuotaDialog>);

  // SIGNAL para el método seleccionado 
  metodoSeleccionado = signal<MetodoPagoEnum>(MetodoPagoEnum.EFECTIVO);
  metodosPago = Object.values(MetodoPagoEnum);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { numeroCuota: number }) {}

  /**
   * DEVOLUCIÓN DE DATOS:
   * En lugar de true/false, devolvemos el valor seleccionado.
   * Si el usuario cierra o cancela, devolvemos null.
   */
  confirmar(): void {
    this._dialogRef.close(this.metodoSeleccionado());
  }

  cancelar(): void {
    this._dialogRef.close(null);
  }
}
