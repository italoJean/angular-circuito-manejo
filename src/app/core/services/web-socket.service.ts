import { Injectable, NgZone } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs'; 
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  
  private stompClient!: Client;
private notificaciones$ = new Subject<any>();
  constructor(private zone: NgZone) {}

  conectar(email: string) {

    this.stompClient = new Client({
      webSocketFactory: () =>
        new SockJS('http://localhost:8080/ws'),

      reconnectDelay: 5000,
      debug: (str) => console.log('STOMP: ' + str)
      // heartbeatIncoming: 4000,
      // heartbeatOutgoing: 4000
    });

   this.stompClient.onConnect = () => {
  console.log('✅ Conectado a WebSocket',email);

  // Ajustamos la ruta para que coincida con el backend (/topic/reservas/ID)
  this.stompClient.subscribe(
    `/topic/reservas/${email}`, 
    (message: IMessage) => {
      this.zone.run(() => {
        const payload = JSON.parse(message.body);
        console.log('🔔 Notificación recibida:', payload);
        this.notificaciones$.next(payload);
      });
    }
  );
};

    this.stompClient.activate();
  }

  getNotificaciones(): Observable<any> {
    return this.notificaciones$.asObservable();
  }

  
desconectar() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}