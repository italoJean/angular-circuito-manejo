import { Component, Inject, Pipe } from '@angular/core';
import { ReservaResponse } from '../../model/reserva-response.model';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { DatePipe, NgClass } from '@angular/common';
import { DetalleReservaResponse } from '../../model/detalle-response.model';
import { MatCard, MatCardTitle } from "@angular/material/card";
import { MaterialModule } from "../../../../shared/ui/material-module";

@Component({
  selector: 'app-reserva-detalle-modal',
  imports: [MatDialogContent, MatDialogActions, DatePipe, MatCard, MatCardTitle, MaterialModule,NgClass],
  templateUrl: './reserva-detalle-modal.html',
  styleUrl: './reserva-detalle-modal.scss',
})
export class ReservaDetalleModal {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DetalleReservaResponse,
    private dialogRef: MatDialogRef<ReservaDetalleModal>
  ) {}

   cerrar() {
    this.dialogRef.close();
  }
}
