import { Component, computed, inject, Inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { PagoMinutosDTO } from '../../model/event/pago-minutos.model';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { ReservaMinutosDTO } from '../../model/event/reserva-minutos.model';
import { MinutosHorasPipe } from '../../../../shared/pipes/minutos-horas-pipe';
@Component({
  selector: 'app-reserva-minutos-modal',
  imports: [MaterialModule, DatePipe, NgClass, CommonModule, MinutosHorasPipe],
  templateUrl: './reserva-minutos-modal.html',
  styleUrl: './reserva-minutos-modal.scss',
})
export class ReservaMinutosModal {
  private readonly dialogRef = inject(MatDialogRef<ReservaMinutosModal>);

  // Usar signals hace que la UI sea más reactiva y eficiente.
  expandedRow = signal<number | null>(null);

  // Columnas fijas (ReadOnly) para evitar mutaciones accidentales
  readonly columns: string[] = [
    'reservaId',
    'fechaReserva',
    'fechaFin',
    'minutosReservados',
    'estado',
    'detalle',
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: PagoMinutosDTO) {
    // data contiene el historial de reservas asociadas a un pago.
  }

  selectedReserva = computed(() => {
  const id = this.expandedRow();
  return id ? this.data.reservas.find(r => r.reservaId === id) : null;
});

  /**
   * Controla la expansión de filas en la tabla.
   * Si el ID ya está expandido, lo cierra (null), sino lo abre.
   */
  toggle(r: ReservaMinutosDTO): void {
    this.expandedRow.update((current) => (current === r.reservaId ? null : r.reservaId));
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
