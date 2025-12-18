import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MaterialModule } from "../../../ui/material-module";

const MATERIAL_MODULES=[MatFormField,MatInput,MatLabel];

@Component({
  selector: 'app-filter',
  imports: [MATERIAL_MODULES, FormsModule, MaterialModule],
  templateUrl: './filter.html',
  styleUrl: './filter.scss',
})
export class Filter {
  filter=model('');
  label=input<string>('Filter');
  placeholder=input<string>('Ex. name');
}
