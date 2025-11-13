import { Component, Inject } from '@angular/core';
import { MetodoPagoEnum } from '../../enum/metodo-pago.enum';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MaterialModule } from "../../../../shared/ui/material-module";
import { MatSelect, MatOption } from "@angular/material/select";

@Component({
  selector: 'app-confirmar-pago-cuota-dialog',
  imports: [MatDialogContent, MaterialModule, MatSelect, MatOption, MatDialogActions],
  templateUrl: './confirmar-pago-cuota-dialog.html',
  styleUrl: './confirmar-pago-cuota-dialog.scss',
})
export class ConfirmarPagoCuotaDialog {

  metodoSeleccionado: MetodoPagoEnum = MetodoPagoEnum.EFECTIVO;

  metodosPago = Object.values(MetodoPagoEnum);

  constructor(
    private dialogRef: MatDialogRef<ConfirmarPagoCuotaDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { numeroCuota: number }
  ) {}

  confirmar() {
    this.dialogRef.close(this.metodoSeleccionado);
  }

  cancelar() {
    this.dialogRef.close(null);
  }
}
