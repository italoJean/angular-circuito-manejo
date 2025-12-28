import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ModalService } from '../../../../shared/services/modal.service';
import { Usuario } from '../../model/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { DialogService } from '../../../../shared/services/dialog.service';
import { UsuarioForm } from '../usuario-form/usuario-form';
import { Grid } from '../../../../shared/components/grid/grid';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, switchMap } from 'rxjs';

@Component({
  selector: 'app-usuario-list',
  imports: [Grid, MaterialModule],
  templateUrl: './usuario-list.html',
  styleUrl: './usuario-list.scss',
})
export class UsuarioList {
  // INYECCIÓN DE DEPENDENCIAS
  private readonly _modalService = inject(ModalService);
  private readonly _usuarioService = inject(UsuarioService);
  private readonly _notificacionService = inject(NotificacionService);
  private readonly _dialogService = inject(DialogService);
  private readonly _destroyRef = inject(DestroyRef);

  // ESTADO REACTIVO CON SIGNALS
  // data: Almacena la lista de usuarios. El uso de signals mejora el rendimiento de detección de cambios.
  data = signal<Usuario[]>([]);

  // CONFIGURACIÓN DE TABLA
  // Definición de columnas y sus etiquetas amigables.
  displayedColumns: Array<keyof Usuario | 'action'> = [
    'id',
    'nombre',
    'apellido',
    'tipoDocumento',
    'numeroDocumento',
    'telefono',
    'email',
    'fechaRegistro',
    'action',
  ];

  sortables: Array<keyof Usuario> = [
    'id',
    'nombre',
    'apellido',
    'tipoDocumento',
    'fechaRegistro',
    'numeroDocumento',
  ];

  readonly columnLabels = signal<Record<string, string>>({
    id: 'ID',
    nombre: 'Nombre',
    apellido: 'Apellido',
    tipoDocumento: 'Tipo Documento',
    numeroDocumento: 'N° Documento',
    telefono: 'Teléfono',
    email: 'Email',
    fechaRegistro: 'Registro',
    action: 'Acciones',
  });

  ngOnInit(): void {
    this.loadUsuarios();
  }

  // Carga los usuarios desde el backend y actualiza el signal de datos.
   
  loadUsuarios(): void {
    this._usuarioService
      .findAll()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (usuarios) => this.data.set(usuarios),
        error: (error) => {
          console.error('Error al cargar usuarios:', error);
          this._notificacionService.error('No se pudo cargar la lista de usuarios');
        },
      });
  }

  /**
   * Abre el formulario modal para crear un nuevo usuario.
   * Si el modal retorna un valor, se asume creación exitosa y se refresca la lista.
   */
  openCreateModal(): void {
    this._modalService
      .openModal(UsuarioForm)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((nuevo) => {
        if (nuevo) {
          this._notificacionService.success('Usuario creado correctamente');
          this.loadUsuarios();
        }
      });
  }

  /**
   * Abre el formulario modal con los datos de un usuario existente para su edición.
   */
  openEditModal(usuario: Usuario): void {
    this._modalService
      .openModal(UsuarioForm, usuario)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((editado) => {
        if (editado) {
          this._notificacionService.success('Usuario actualizado correctamente');
          this.loadUsuarios();
        }
      });
  }

  /**
   * FLUJO DE ELIMINACIÓN DECLARATIVO:
   * 1. Solicita confirmación al usuario mediante un diálogo.
   * 2. Si el usuario confirma, switchMap cambia el flujo a la petición DELETE.
   * 3. Si el usuario cancela, EMPTY detiene el flujo y no se ejecuta el subscribe.
   */
  deleteUsuario(usuario: Usuario): void {
    if (!usuario.id) {
      this._notificacionService.error('ID de usuario requerido para eliminar.');
      return;
    }

    this._dialogService
      .confirm(
        'Eliminar Usuario',
        `¿Seguro que deseas eliminar a "${usuario.nombre} ${usuario.apellido}"?`
      )
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        switchMap((confirmed) => {
          // El operador switchMap cancela flujos previos y encadena el siguiente observable
          return confirmed ? this._usuarioService.delete(usuario.id!) : EMPTY;
        })
      )
      .subscribe({
        next: () => {
          this._notificacionService.success('Usuario eliminado correctamente');
          this.loadUsuarios();
        },
        error: (err) => {
          // Captura errores como restricciones de llave foránea (ej: usuario con pedidos)
          const msg = err.error?.mensaje || 'Error al eliminar usuario';
          this._notificacionService.error(msg);
        },
      });
  }
}
