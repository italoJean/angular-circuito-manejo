import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { WebSocketService } from './core/services/web-socket.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  protected readonly title = signal('circuito-manejo-angular');

// mensaje: any;
//   sub!: Subscription;

//   constructor(private ws: WebSocketService) {}

//   ngOnInit() {
//     const usuarioId = 5; // ejemplo

//     this.ws.conectar(usuarioId);

//     this.sub = this.ws.getNotificaciones()
//       .subscribe(msg => {
//         if (msg) {
//           this.mensaje = msg;
//         }
//       });
//   }

//   ngOnDestroy() {
//     this.sub?.unsubscribe();
//     this.ws.desconectar();
//   }
}
