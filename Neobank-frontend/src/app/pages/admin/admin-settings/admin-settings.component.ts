import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-container">
      <div class="settings-header">
        <h2>Settings</h2>
      </div>

      <div class="settings-grid">
        <div class="setting-card">
          <div class="setting-icon">🔔</div>
          <h3>Notifications</h3>
          <p>Manage notification preferences</p>
          <button class="btn btn-setting">Configure</button>
        </div>

        <div class="setting-card">
          <div class="setting-icon">🔐</div>
          <h3>Security</h3>
          <p>Update security settings</p>
          <button class="btn btn-setting">Configure</button>
        </div>

        <div class="setting-card">
          <div class="setting-icon">📊</div>
          <h3>Reports</h3>
          <p>Configure report generation</p>
          <button class="btn btn-setting">Configure</button>
        </div>

        <div class="setting-card">
          <div class="setting-icon">🎨</div>
          <h3>Appearance</h3>
          <p>Customize dashboard appearance</p>
          <button class="btn btn-setting">Configure</button>
        </div>

        <div class="setting-card">
          <div class="setting-icon">📧</div>
          <h3>Email Settings</h3>
          <p>Configure email templates</p>
          <button class="btn btn-setting">Configure</button>
        </div>

        <div class="setting-card">
          <div class="setting-icon">🔗</div>
          <h3>Integrations</h3>
          <p>Connect external services</p>
          <button class="btn btn-setting">Configure</button>
        </div>
      </div>

      <div class="coming-soon">
        <p>More settings coming soon...</p>
      </div>
    </div>
  `,
  styleUrls: ['./admin-settings.component.css'],
})
export class AdminSettingsComponent {}
