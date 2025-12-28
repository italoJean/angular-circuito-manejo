import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Grid } from '../../../../shared/components/grid/grid';
import { Paquete } from '../../model/paquete.model';
import { PaqueteService } from '../../services/paquete.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { DialogService } from '../../../../shared/services/dialog.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { PaqueteForm } from '../paquete-form/paquete-form';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, switchMap } from 'rxjs';

@Component({
  selector: 'app-paquete-list',
  imports: [Grid, MaterialModule],
  templateUrl: './paquete-list.html',
  styleUrl: './paquete-list.scss',
})
export class PaqueteList implements OnInit {
  // INYECCIÓN DE SERVICIOS
  private readonly _modalService = inject(ModalService);
  private readonly _paqueteService = inject(PaqueteService);
  private readonly _notificacionService = inject(NotificacionService);
  private readonly _dialogService = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef); // Gestión automática de desuscripciones

  // Almacena la lista de paquetes. Los signals notifican a la vista solo cuando el valor cambia.
  data = signal<Paquete[]>([]);

  // Configuración de la tabla (app-grid reutilizable)
  displayedColumns: Array<string> = [
    'id',
    'nombre',
    'descripcion',
    'duracionMinutos',
    'precioTotal',
    'action',
  ];

  // Columnas que permiten ordenamiento (deben coincidir con los nombres en la DB)
  sortables: Array<string> = ['id', 'nombre', 'duracionMinutos', 'precioTotal'];

  // Etiquetas amigables para las cabeceras de la tabla
  readonly columnLabels = signal<Record<string, string>>({
    id: 'ID',
    nombre: 'Nombre',
    descripcion: 'Descripción',
    duracionMinutos: 'Duración (Min)',
    precioTotal: 'Precio',
    action: 'Acciones',
  });

  ngOnInit(): void {
    this.loadPaquetes();
  }

  /**
   * CARGA DE DATOS:
   * Se añade pipe(takeUntilDestroyed) por si el usuario cambia de página
   * antes de que la API responda.
   */
  loadPaquetes() {
    this._paqueteService
      .findAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (paquetes) => this.data.set(paquetes),
        error: (error) => {
          console.error('Error:', error);
          this._notificacionService.error('No se pudo cargar la lista de paquetes');
        },
      });
  }

  // MODALES: Recargan la lista solo si hubo una acción exitosa (devuelven objeto nuevo/editado)
  openCreateModal(): void {
    this._modalService
      .openModal(PaqueteForm)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nuevo) => {
        if (nuevo) {
          this._notificacionService.success('Paquete creado correctamente');
          this.loadPaquetes();
        }
      });
  }

  openEditModal(paquete: Paquete): void {
    this._modalService
      .openModal(PaqueteForm, paquete)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((editado) => {
        if (editado) {
          this._notificacionService.success('Paquete actualizado correctamente');
          this.loadPaquetes();
        }
      });
  }

  /**
   *  FLUJO DE ELIMINACIÓN (Declarativo):
   * 1. Pide confirmación.
   * 2. Si confirma, switchMap "salta" a la llamada del servicio DELETE.
   * 3. Si no confirma, EMPTY mata el flujo y no pasa nada.
   */
  deletePaquete(paquete: Paquete): void {
    // Seguridad: Evita llamadas si el ID es nulo
    if (!paquete.id) {
      this._notificacionService.error('El paquete no tiene un ID válido');
      return;
    }

    this._dialogService
      .confirm('Eliminar Paquete', `¿Seguro que deseas eliminar "${paquete.nombre}"?`)
      .pipe(
        takeUntilDestroyed(this.destroyRef), 
        switchMap((confirmed) => {
          if (confirmed) {
            return this._paqueteService.delete(paquete.id!);
          }
          return EMPTY; // Detiene el flujo sin ejecutar el subscribe(next)
        })
      )
      .subscribe({
        next: () => {
          this._notificacionService.success('Paquete eliminado correctamente');
          this.loadPaquetes(); // Refresca la tabla
        },
        error: (err) => {
          // Captura si el paquete está siendo usado en alguna reserva (FK Constraint)
          const msg = err.error?.mensaje || 'Error al eliminar: el paquete puede estar en uso';
          this._notificacionService.error(msg);
        }
      });
  }
}
