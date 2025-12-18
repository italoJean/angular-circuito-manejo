import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { PagoMinutosDTO } from '../../model/event/pago-minutos.model';
import { MaterialModule } from "../../../../shared/ui/material-module";
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { ReservaMinutosDTO } from '../../model/event/reserva-minutos.model';
import {MatExpansionModule} from '@angular/material/expansion';
import { FechaHoraPipe } from '../../../../shared/pipes/fecha-hora-pipe';
import { MinutosHorasPipe } from '../../../../shared/pipes/minutos-horas-pipe';
@Component({
  selector: 'app-reserva-minutos-modal',
  imports: [MaterialModule, MatDialogContent, MatDialogActions,DatePipe,NgClass,MatExpansionModule,CommonModule,MinutosHorasPipe],
  templateUrl: './reserva-minutos-modal.html',
  styleUrl: './reserva-minutos-modal.scss',
})
export class ReservaMinutosModal {

  columns = [
    'reservaId',
    'fechaReserva',
    'fechaFin',
    'minutosReservados',
    'estado',
    'detalle'
  ];

  expanded: ReservaMinutosDTO | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PagoMinutosDTO,
    private dialogRef: MatDialogRef<ReservaMinutosModal>
  ) {}

  toggle(r: ReservaMinutosDTO) {
    this.expanded = this.expanded?.reservaId === r.reservaId ? null : r;
  }

  cerrar() {
    this.dialogRef.close();
  }
}
