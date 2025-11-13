import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../components/confirm-dialog/confirm-dialog';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialog = inject(MatDialog);

  confirm(title: string, message: string) {
    return this.dialog
      .open(ConfirmDialog, {
        //Envía al componente los datos { title, message } mediante MAT_DIALOG_DATA
        data: { title, message },
      })
      .afterClosed();
    //devuelve un Observable que emite:
    // true → si el usuario hace clic en “Aceptar”.
    // undefined → si cancela o cierra.
  }
}
