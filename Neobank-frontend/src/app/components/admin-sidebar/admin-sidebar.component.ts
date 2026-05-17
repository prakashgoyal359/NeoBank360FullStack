import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <h2>NeoBank Admin</h2>
      </div>
      <nav class="sidebar-nav">
        <button
          *ngFor="let item of menuItems"
          [class.active]="activeSection === item.id"
          (click)="onMenuClick(item.id)"
          class="nav-item"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        <button (click)="onLogout()" class="logout-btn">Logout</button>
      </div>
    </aside>
  `,
  styleUrls: ['./admin-sidebar.component.css'],
})
export class AdminSidebarComponent {
  @Input() activeSection: string = 'home';
  @Output() sectionChange = new EventEmitter<string>();
  @Output() logoutClick = new EventEmitter<void>();

  menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'pending', label: 'Pending Accounts', icon: '⏳' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  onMenuClick(sectionId: string): void {
    this.sectionChange.emit(sectionId);
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.logoutClick.emit();
    }
  }
}
