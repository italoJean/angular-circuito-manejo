import { ComponentType } from '@angular/cdk/overlay';
import { inject, Injectable, Type } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Paquete } from '../../features/paquete/model/paquete.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly _dialog = inject(MatDialog);

  /*
  T → tipo del componente que se abrirá dentro del modal.
  D → tipo de los datos de entrada (MAT_DIALOG_DATA) que se enviarán al modal.
  R → tipo del resultado que devuelve el modal al cerrarse (dialogRef.close(valor)). */
  openModal<T, D = any, R = any>(
    component: Type<T>,
    data?: D,
    config?: MatDialogConfig<D>
  ): Observable<R | undefined> {
    const dialogRef = this._dialog.open(component, {
      width: '600px',
      disableClose: true, //evita que el usuario cierre el modal haciendo clic fuera
      data, //pasa los datos que el modal recibirá mediante MAT_DIALOG_DATA.
      ...config, //permite sobreescribir cualquier propiedad del diálogo (altura, animación, etc.).
    });
    return dialogRef.afterClosed(); //Devuelve un Observable que emite el valor que el modal haya devuelto al cerrarse
  }

  closeAll(): void {
    this._dialog.closeAll();
  }
}
