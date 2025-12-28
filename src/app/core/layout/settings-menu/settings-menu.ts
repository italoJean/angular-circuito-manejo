import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MaterialModule } from '../../../shared/ui/material-module';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-settings-menu',
  imports: [MaterialModule],
  templateUrl: './settings-menu.html',
  styleUrl: './settings-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsMenu {
authService = inject(AuthService);

// Getter para facilitar el acceso al usuario en el HTML
  get user() {
    return this.authService.currentUser();
  }
  
  onLogout() {
    this.authService.logout();
  }
}
