import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MaterialModule } from "../../../ui/material-module";


@Component({
  selector: 'app-filter',
  imports: [FormsModule, MaterialModule],
  templateUrl: './filter.html',
  styleUrl: './filter.scss',
})
export class Filter {
  // model() permite que si el padre cambia el valor, el input se actualice, y viceversa.
  filter = model(''); 
  label = input<string>('Filtrar');
  placeholder = input<string>('Buscar...');

  onRefresh = output<void>();
}
