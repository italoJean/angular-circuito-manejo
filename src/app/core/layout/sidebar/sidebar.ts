import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { MaterialModule } from '../../../shared/ui/material-module';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [MaterialModule,RouterLink,CommonModule,RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
 @Input() isMobile=false;
  @Output() itemClicked= new EventEmitter<void>();

  subMenuOpen= signal<string|null>(null);

  toggleSubMenu(menu: string) {
    this.subMenuOpen.set(this.subMenuOpen() === menu ? null : menu);
  }

  handleItemClick() {
    if (this.isMobile) {
      this.itemClicked.emit();
    }
  }

}

