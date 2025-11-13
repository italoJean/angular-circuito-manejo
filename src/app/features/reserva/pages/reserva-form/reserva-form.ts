import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { ReservaService } from '../../services/reserva.service';
import { EstadoReservaEnum } from '../../enum/estado-reserva.enum';
import { ReservaRequest } from '../../model/reserva-request.model';
import { MaterialModule } from "../../../../shared/ui/material-module";
import { MatSelectModule } from '@angular/material/select';
import { UsuarioService } from '../../../usuario/services/usuario.service';
import { PaqueteService } from '../../../paquete/services/paquete.service';
import { Usuario } from '../../model/usuario.model';
import { Paquete } from '../../model/paquete.model';
import {MatTimepickerModule} from '@angular/material/timepicker';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import {provideNativeDateAdapter} from '@angular/material/core';

@Component({
  selector: 'app-reserva-form',
  providers: [provideNativeDateAdapter()],
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
     
  ],
  templateUrl: './reserva-form.html',
  styleUrl: './reserva-form.scss',
})
export class ReservaForm implements OnInit {

  private readonly fb=inject(FormBuilder);
  private readonly dialogRef=inject(MatDialogRef<ReservaForm>);
  private readonly usuarioService=inject(UsuarioService);
  private readonly paqueteService=inject(PaqueteService);
  private readonly reservaService=inject(ReservaService);
  private readonly notificacionService = inject(NotificacionService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data?: ReservaRequest
  ) {}

  form!: FormGroup;
  isEditing = false;

  usuarios=signal<Usuario[]>([]);
  paquetes=signal<Paquete[]>([]);

  // Filtros dinámicos (signals)
  filtroUsuario = signal('');
  filtroPaquete = signal('');


    public readonly tipoDocumentos = Object.values(EstadoReservaEnum);
    // public readonly estados = Object.values(EstadoVehiculosEnum);


  ngOnInit(): void {
    this.form = this.fb.group({
      id: [this.data?.id],
      usuarioId: [this.data?.usuarioId || '', Validators.required],
      paqueteId: [this.data?.paqueteId || '', Validators.required],
      hora:[''], //campo idicional
      fechaReserva: [this.data?.fechaReserva || '', Validators.required],
      estado: [this.data?.estado || '', Validators.required],

      // fechaRegistro: [this.data?.fechaRegistro || '', Validators.required],
    });

    this.isEditing = !!this.data;

    this.loadUsuarios();
    this.loadPaquetes();
  }

  // 🔹 Cargar usuarios
  loadUsuarios() {
    this.usuarioService.findAll().subscribe({
      next: (usuarios) => this.usuarios.set(usuarios),
      error: () => this.notificacionService.error('Error al cargar usuarios')
    });
  }

  // 🔹 Cargar paquetes
  loadPaquetes() {
    this.paqueteService.findAll().subscribe({
      next: (paquetes) => this.paquetes.set(paquetes),
      error: () => this.notificacionService.error('Error al cargar paquetes')
    });
  }

  // 🔹 Filtrado de usuario por nombre o DNI
  get usuariosFiltrados(): Usuario[] {
    const filtro = this.filtroUsuario().toLowerCase();
    return this.usuarios().filter(u =>
      u.nombre.toLowerCase().includes(filtro) ||
      u.numeroDocumento.toLowerCase().includes(filtro)
    );
  }

  // 🔹 Filtrado de paquetes
  get paquetesFiltrados(): Paquete[] {
    const filtro = this.filtroPaquete().toLowerCase();
    return this.paquetes().filter(p =>
      p.nombre.toLowerCase().includes(filtro)
    );
  }

  save(): void {
    if (this.form.invalid) return;

    const reserva = this.form.value as ReservaRequest;

    const request$ = this.isEditing
      ? this.reservaService.update(reserva.id!, reserva)
      : this.reservaService.create(reserva);

    request$.subscribe({
      next: (res) => this.dialogRef.close(res),
      error: (err) => console.error('Error al guardar reserva:', err),
    });
  }

  close(): void {
    this.dialogRef.close();
  }

}