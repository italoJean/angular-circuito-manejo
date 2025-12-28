import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../shared/ui/material-module';

@Component({
  selector: 'app-confirm-suspend-pago-dialog',
  imports: [MaterialModule],
  templateUrl: './confirm-suspend-pago-dialog.html',
  styleUrl: './confirm-suspend-pago-dialog.scss',
})
export class ConfirmSuspendPagoDialog {
  // INYECCIÓN MODERNA
  private readonly _dialogRef = inject(MatDialogRef<ConfirmSuspendPagoDialog>);

  // Mantenemos el constructor para el DATA ya que es un estándar de Material
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  /**
   * Al suspender, devolvemos 'true'. El componente que lo llama debe
   * encargarse de ejecutar la lógica de 'pagoService.suspend(...)'.
   */
  confirmar(): void {
    this._dialogRef.close(true);
  }

  cancelar(): void {
    this._dialogRef.close(false);
  }

  /**
   * BUENA PRÁCTICA: Formateo Localizado
   * Usar Intl.NumberFormat garantiza que el símbolo de moneda y decimales
   * siempre sean consistentes en toda la app.
   */
  formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(monto);
  }
}
