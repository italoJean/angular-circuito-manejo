import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DatePipe, NgClass } from '@angular/common';
import { DetalleReservaResponse } from '../../model/detalle-response.model';
import { MaterialModule } from '../../../../shared/ui/material-module';

@Component({
  selector: 'app-reserva-detalle-modal',
  imports: [DatePipe, MaterialModule, NgClass],
  templateUrl: './reserva-detalle-modal.html',
  styleUrl: './reserva-detalle-modal.scss',
})
export class ReservaDetalleModal {
  private readonly dialogRef = inject(MatDialogRef<ReservaDetalleModal>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: DetalleReservaResponse) {}

  cerrar() {
    this.dialogRef.close();
  }
}
