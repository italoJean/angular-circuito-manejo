import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MaterialModule } from "../../../../shared/ui/material-module";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { CommonModule } from '@angular/common';


interface IncidenciaData {
    reservaId: number;
}

@Component({
  selector: 'app-reserva-incidencia-modal',
  imports: [MatDialogContent, MatDialogActions,CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './reserva-incidencia-modal.html',
  styleUrl: './reserva-incidencia-modal.scss',
})
export class ReservaIncidenciaModal implements OnInit {
  
  private readonly fb = inject(FormBuilder);
    private readonly dialogRef = inject(MatDialogRef<ReservaIncidenciaModal>);
    private readonly notificacionService = inject(NotificacionService);

    form!: FormGroup;
    // Recibe el ID de la reserva a la que se asocia la incidencia
    public reservaId: number; 

    constructor(@Inject(MAT_DIALOG_DATA) public data: IncidenciaData) {
        // Almacenar el ID de la reserva para usarlo en el POST
        this.reservaId = data.reservaId;
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            detalle: ['', [
                Validators.required, 
                Validators.minLength(10),
                Validators.maxLength(250) // Limita el tamaño del texto
            ]], 
        });
    }

    save(): void {
        if (this.form.invalid) {
            this.notificacionService.error('Por favor, completa el detalle (mínimo 10 caracteres).');
            return;
        }

        // 🚨 CAMBIO CLAVE: Cerramos el diálogo devolviendo el objeto que el padre espera.
        const payload = {
            detalle: this.form.get('detalle')?.value
        };
        
        // Esto regresa al .subscribe() de ReservaList
        this.dialogRef.close(payload); 
    }

    close(): void {
        this.dialogRef.close(undefined); // Devolvemos undefined si cancela
    }
}
