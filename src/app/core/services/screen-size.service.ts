import { MediaMatcher } from '@angular/cdk/layout';
import { Injectable, Signal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScreenSizeService {
    //MediaQueryList es una interfaz que representa una consulta de medios CSS (media query) y escuchas sus cambios en el tamaño de la pantalla.
  private mobileQuery: MediaQueryList;
  private readonly _isMobile = signal(false);

  //MediaMatcher es un servicio que permite evaluar consultas de medios CSS (media queries) en Angular.
  constructor(private mediaMatcher: MediaMatcher) {
    this.mobileQuery = this.mediaMatcher.matchMedia('(max-width: 600px)');

    //accede a la propiedad .matches de MediaQueryList para obtener el estado actual de la pantalla (si es movil o no)
    this._isMobile.set(this.mobileQuery.matches);

    //registra un oyente de eventos para escuchar cambios en el tamaño de la pantalla
    this.mobileQuery.addEventListener('change', (event) => {
      this._isMobile.set(event.matches); //actualiza la señal _isMobile cuando cambia el tamaño de la pantalla
    });
  }

  get isMobile(): Signal<boolean> {
    return this._isMobile;
  }
}

