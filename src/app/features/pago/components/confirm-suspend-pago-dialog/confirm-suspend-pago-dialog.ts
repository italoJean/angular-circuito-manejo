import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MaterialModule } from "../../../../shared/ui/material-module";

@Component({
  selector: 'app-confirm-suspend-pago-dialog',
  imports: [MaterialModule, MatDialogContent, MatDialogActions],
  templateUrl: './confirm-suspend-pago-dialog.html',
  styleUrl: './confirm-suspend-pago-dialog.scss',
})
export class ConfirmSuspendPagoDialog {

  constructor(
    private dialogRef: MatDialogRef<ConfirmSuspendPagoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  confirmar() {
    this.dialogRef.close(true); // true = usuario confirmó
  }

  cancelar() {
    this.dialogRef.close(false); // false = usuario canceló
  }
 formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(monto);
  }
  
}
