import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="theme-toggle-btn"
      (click)="toggleTheme()"
      [title]="
        'Switch to ' + (themeService.getCurrentTheme() === 'light' ? 'dark' : 'light') + ' mode'
      "
      type="button"
    >
      <span class="theme-icon">{{ themeIcon() }}</span>
    </button>
  `,
  styles: [
    `
      .theme-toggle-btn {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 50%;
        width: 3rem;
        height: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: var(--shadow);
        transition: all 0.2s ease;
        color: var(--text-primary);
      }

      .theme-toggle-btn:hover {
        transform: scale(1.05);
        background: var(--bg-secondary);
      }

      .theme-icon {
        font-size: 1.25rem;
        line-height: 1;
      }
    `,
  ],
})
export class ThemeToggleComponent {
  themeIcon = computed(() => this.themeService.getThemeIcon());

  constructor(public themeService: ThemeService) {}

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
