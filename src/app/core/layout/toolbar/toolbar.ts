import { ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../shared/ui/material-module';
import { SettingsMenu } from '../settings-menu/settings-menu';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { MatDrawer } from '@angular/material/sidenav';
import { ScreenSizeService } from '../../services/screen-size.service';
import { PaqueteList } from "../../../features/paquete/pages/paquete-list/paquete-list";
import { WebSocketService } from '../../services/web-socket.service';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-toolbar',
  imports: [MaterialModule, SettingsMenu, RouterOutlet, Sidebar],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toolbar {
  //Conecta la referencia local #drawer (del HTML) con la clase.
  // abre o cierra el sidenav programáticamente
  @ViewChild('drawer') drawer!: MatDrawer;

  private readonly screenSizeService=inject(ScreenSizeService);

  isMobile=this.screenSizeService.isMobile;


  
  onNavigate(){
    if(this.isMobile()){
      this.drawer.close();  
    }
  }


   alertaActual: any = null;

  constructor(private webSocketService: WebSocketService, private authService: AuthService) {}

  ngOnInit() {
    // 1. Obtener el ID del usuario logueado (desde tu servicio de Auth o JWT)
    const userInfo = this.authService.currentUser(); 

    console.log('dsad',userInfo)

    // Extraemos el email del JSON de Google
  const userEmail = userInfo?.email;


    // 2. Conectar
    if (userEmail) {
      console.log('Intentando conectar con:', userEmail);
      this.webSocketService.conectar(userEmail);
    }

    // 3. Escuchar notificaciones
    this.webSocketService.getNotificaciones().subscribe(data => {
      if (data) {
        this.alertaActual = data;
        // La notificación desaparece sola tras 10 segundos
        // setTimeout(() => {
        //   this.alertaActual = null;
        // }, 10000);
      }
    });
  }

  ngOnDestroy() {
    this.webSocketService.desconectar();
  }
}
