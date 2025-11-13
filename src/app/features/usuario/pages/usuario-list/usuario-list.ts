import { Component, inject, signal } from '@angular/core';
import { ModalService } from '../../../../shared/services/modal.service';
import { Usuario } from '../../model/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { DialogService } from '../../../../shared/services/dialog.service';
import { UsuarioForm } from '../usuario-form/usuario-form';
import { Grid } from "../../../../shared/components/grid/grid";

@Component({
  selector: 'app-usuario-list',
  imports: [Grid],
  templateUrl: './usuario-list.html',
  styleUrl: './usuario-list.scss',
})
export class UsuarioList {

  private readonly _modalService=inject(ModalService);
  private readonly usuarioService=inject(UsuarioService);
  private readonly notificacionService=inject(NotificacionService);
  private readonly dialogService=inject(DialogService);

  // Usar signals para los datos
  data = signal<Usuario[]>([]);

  displayedColumns: Array<keyof Usuario | 'action'> = ['id', 'nombre', 'apellido', 'tipoDocumento', 'numeroDocumento','telefono', 'email','fechaRegistro' , 'action'];
  sortables: Array<keyof Usuario> = ['id', 'nombre', 'apellido', 'tipoDocumento', 'numeroDocumento','telefono', 'email','fechaRegistro'] as const;


    readonly columnLabels = signal<Record<string, string>>({
    id: 'ID',
    nombre: 'Nombre',
    apellido: 'Apellido',
    tipoDocumento: 'Tipo de Documento',
    numeroDocumento: 'Número de Documento',
    telefono: 'Teléfono',
    email: 'Email',
    fechaRegistro: 'Fecha de Registro',
    action: 'Acción'
  });

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios() {
    this.usuarioService.findAll().subscribe({
      next: (usuarios) => {
        // Actualizar el signal con los nuevos datos
        this.data.set(usuarios);
        console.log('Usuarios cargados:', usuarios);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.notificacionService.error('Error al cargar usuarios');
      }
    });
  }

  
  openCreateModal(): void {
    this._modalService.openModal(UsuarioForm).subscribe((nuevo) => {
      if (nuevo) { 
        this.notificacionService.success('Usuario creado correctamente');
        this.loadUsuarios();
        }
    });
  }

  openEditModal(usuario: Usuario): void {
    this._modalService.openModal(UsuarioForm, usuario).subscribe((editado) => {
      if (editado)  {
        this.notificacionService.success('Usuario actualizado correctamente');
        this.loadUsuarios();
      }
    });
  }

   // 👉 Eliminar paquete (con confirmación)
  deleteUsuario(usuario: Usuario): void {
    this.dialogService
      .confirm('Eliminar Usuario', `¿Seguro que deseas eliminar "${usuario.nombre}"?`)
      .subscribe((confirmed) => {
        if (confirmed) {
          this.usuarioService.delete(usuario.id!).subscribe({
            next: () => {
              this.notificacionService.success('Usuario eliminado correctamente');
              this.loadUsuarios();
            },
            error: () => this.notificacionService.error('Error al eliminar usuario'),
          });
        }
      });
  }
}