import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaHoraPipe'
})
export class FechaHoraPipe implements PipeTransform {

 constructor(private datePipe: DatePipe) {}

  transform(value: string | Date | null, formato: string = "dd/MM/yyyy HH:mm") {
    return this.datePipe.transform(value, formato);
  }
}
