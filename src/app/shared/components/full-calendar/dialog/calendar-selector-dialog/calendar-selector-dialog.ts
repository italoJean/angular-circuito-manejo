import { Component, Inject, inject } from '@angular/core';
import { MatDialogContent, MatDialogActions, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FullCalendar } from "../../full-calendar";
import { MaterialModule } from "../../../../ui/material-module";

@Component({
  selector: 'app-calendar-selector-dialog',
  imports: [MatDialogContent, FullCalendar, MatDialogActions, MaterialModule],
  templateUrl: './calendar-selector-dialog.html',
  styleUrl: './calendar-selector-dialog.scss',
})
export class CalendarSelectorDialog {
//   private dialogRef = inject(MatDialogRef<CalendarSelectorDialog>);
  
//   selectedDate: string | null = null;
//   selectedDuration: number = 0;

//   onDateSelected(event: { start: string; end: string; minutes: number }) {
//     this.selectedDate = event.start;
//     this.selectedDuration = event.minutes;
//   }

//   confirm() {
//     if (this.selectedDate) {
//       this.dialogRef.close({
//         fechaReserva: this.selectedDate,
//         minutosReservados: this.selectedDuration
//       });
//     }
//   }

//   close() {
//     this.dialogRef.close(null);
//   }
// }

private dialogRef = inject(MatDialogRef<CalendarSelectorDialog>);
  
  selectedDate: string | null = null;
  selectedDuration: number = 0;
  vehiculoId?: number;

  // 🟢 Nuevas propiedades para validación
  isValidSelection: boolean = false;
  validationMessage: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data?: { vehiculoId?: number }) {
    if (data?.vehiculoId) {
      this.vehiculoId = data.vehiculoId;
    }
  }

  onDateSelected(event: { start: string; end: string; minutes: number }) {
    this.selectedDate = event.start;
    this.selectedDuration = event.minutes;
  }

    // 🟢 Nuevo método para recibir cambios de validación del calendario
  onValidationStateChanged(isValid: boolean) {
    this.isValidSelection = isValid;
  }

  confirm() {
    // ✅ Solo permite confirmar si la selección es válida
    if (this.isValidSelection && this.selectedDate && this.selectedDuration > 0) {
      this.dialogRef.close({
        fechaReserva: this.selectedDate,
        minutosReservados: this.selectedDuration
      });
    }
  }

  close() {
    this.dialogRef.close(null);
  }
}
