import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'minutosHorasPipe'
})
export class MinutosHorasPipe implements PipeTransform {

transform(minutos: number): string {
    if (minutos === null || minutos === undefined) {
      return '';
    }

    const valorAbsoluto = Math.abs(minutos); // Maneja valores negativos
    
    // 1. Si son menos de 60 minutos (o exactamente 60, si prefieres solo mostrar "1 hora" en el siguiente bloque)
    if (valorAbsoluto < 60) {
      return `${minutos} min`;
    }

    // 2. Si son 60 minutos o más, realizar la conversión
    const horas = Math.floor(valorAbsoluto / 60); // Obtener solo las horas completas
    const minutosRestantes = valorAbsoluto % 60; // Obtener los minutos restantes

    // Construir la cadena de resultado
    let resultado = '';
    
    // Añadir el signo si el valor original era negativo
    if (minutos < 0) {
      resultado += '- ';
    }
    
    resultado += `${horas} hr`;

    if (minutosRestantes > 0) {
      resultado += ` ${minutosRestantes} min`;
    }

    return resultado;
  }
}