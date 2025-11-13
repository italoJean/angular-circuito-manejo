import { ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../shared/ui/material-module';
import { SettingsMenu } from '../settings-menu/settings-menu';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { MatDrawer } from '@angular/material/sidenav';
import { ScreenSizeService } from '../../services/screen-size.service';
import { PaqueteList } from "../../../features/paquete/pages/paquete-list/paquete-list";

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
}
