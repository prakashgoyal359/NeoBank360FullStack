import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h2>Admin Profile</h2>
      </div>

      <div class="profile-card">
        <div class="profile-avatar">👤</div>
        <div class="profile-info">
          <h3>{{ user?.fullName || 'Admin' }}</h3>
          <p>{{ user?.email || 'admin@neobank.com' }}</p>
          <p class="role">Administrator</p>
        </div>
      </div>

      <div class="profile-form">
        <h3>Edit Profile</h3>
        <form (ngSubmit)="onSaveProfile()">
          <div class="form-group">
            <label>Full Name</label>
            <input
              type="text"
              [(ngModel)]="profileData.fullName"
              name="fullName"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="profileData.email" name="email" class="form-input" />
          </div>

          <div class="form-group">
            <label>Mobile Number</label>
            <input
              type="tel"
              [(ngModel)]="profileData.mobileNumber"
              name="mobileNumber"
              class="form-input"
            />
          </div>

          <button type="submit" class="btn btn-save">Save Changes</button>
        </form>
      </div>

      <div class="password-section">
        <h3>Change Password</h3>
        <form (ngSubmit)="onChangePassword()">
          <div class="form-group">
            <label>Current Password</label>
            <input
              type="password"
              [(ngModel)]="passwordData.current"
              name="current"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>New Password</label>
            <input type="password" [(ngModel)]="passwordData.new" name="new" class="form-input" />
          </div>

          <div class="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              [(ngModel)]="passwordData.confirm"
              name="confirm"
              class="form-input"
            />
          </div>

          <button type="submit" class="btn btn-change">Change Password</button>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./admin-profile.component.css'],
})
export class AdminProfileComponent {
  user: any;
  profileData = {
    fullName: '',
    email: '',
    mobileNumber: '',
  };
  passwordData = {
    current: '',
    new: '',
    confirm: '',
  };

  constructor(private authService: AuthService) {
    this.user = this.authService.getUser();
    if (this.user) {
      this.profileData.fullName = this.user.fullName || '';
      this.profileData.email = this.user.email || '';
      this.profileData.mobileNumber = this.user.mobileNumber || '';
    }
  }

  onSaveProfile(): void {
    alert('Profile updated successfully!');
    console.log('Profile data:', this.profileData);
  }

  onChangePassword(): void {
    if (this.passwordData.new !== this.passwordData.confirm) {
      alert('Passwords do not match!');
      return;
    }
    alert('Password changed successfully!');
    console.log('Password changed');
    this.passwordData = { current: '', new: '', confirm: '' };
  }
}
