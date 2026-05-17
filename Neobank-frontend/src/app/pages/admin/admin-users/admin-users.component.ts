import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Account } from '../../../models/banking.model';
import { BankingService } from '../../../services/banking.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-container">
      <div class="users-header">
        <h2>Users Management</h2>
        <div class="search-box">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by account number..."
            class="search-input"
          />
        </div>
      </div>

      <div class="users-table-wrapper">
        <table class="users-table" *ngIf="filteredUsers.length > 0; else noUsers">
          <thead>
            <tr>
              <th>Account Number</th>
              <th>User Name</th>
              <th>Email</th>
              <th>Account Type</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of filteredUsers">
              <td>{{ user.accountNumber }}</td>
              <td>{{ user.userName || 'N/A' }}</td>
              <td>{{ user.email || 'N/A' }}</td>
              <td>{{ user.accountType }}</td>
              <td>₹{{ user.balance | number: '1.2-2' }}</td>
              <td>
                <span class="status" [ngClass]="user.isActive ? 'active' : 'inactive'">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ user.createdAt | date: 'short' }}</td>
              <td>
                <button class="btn-edit" (click)="openEditModal(user)">✏️ Edit</button>
              </td>
            </tr>
          </tbody>
        </table>

        <ng-template #noUsers>
          <div class="empty-state">
            <p>No users found</p>
          </div>
        </ng-template>
      </div>

      <!-- Edit Modal -->
      <div class="modal-overlay" *ngIf="showEditModal" (click)="closeEditModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Edit User Account</h3>
            <button class="close-btn" (click)="closeEditModal()">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedUser">
            <div class="form-group">
              <label>Account Number</label>
              <input type="text" [value]="selectedUser.accountNumber" disabled />
            </div>
            <div class="form-group">
              <label>User Name</label>
              <input type="text" [(ngModel)]="editForm.userName" placeholder="Enter user name" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="editForm.email" placeholder="Enter email" />
            </div>
            <div class="form-group">
              <label>Account Type</label>
              <select [(ngModel)]="editForm.accountType">
                <option value="SAVINGS">SAVINGS</option>
                <option value="CURRENT">CURRENT</option>
              </select>
            </div>
            <div class="form-group">
              <label>Balance (₹)</label>
              <input type="number" [(ngModel)]="editForm.balance" placeholder="Enter balance" />
            </div>
            <div class="form-group">
              <label>Status</label>
              <select [(ngModel)]="editForm.isActive">
                <option [ngValue]="true">Active</option>
                <option [ngValue]="false">Inactive</option>
              </select>
            </div>
            <div class="modal-actions">
              <button class="btn-cancel" (click)="closeEditModal()">Cancel</button>
              <button class="btn-save" (click)="saveUser()">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./admin-users.component.css'],
})
export class AdminUsersComponent {
  @Input() accounts: Account[] = [];
  searchQuery: string = '';

  constructor(private bankingService: BankingService) {}

  // Edit modal
  showEditModal = false;
  selectedUser: Account | null = null;
  editForm = {
    userName: '',
    email: '',
    accountType: 'SAVINGS' as 'SAVINGS' | 'CURRENT',
    balance: 0,
    isActive: true
  };

  get filteredUsers(): Account[] {
    if (!this.searchQuery.trim()) {
      return this.accounts;
    }
    return this.accounts.filter((account) =>
      account.accountNumber.toLowerCase().includes(this.searchQuery.toLowerCase()),
    );
  }

  openEditModal(user: Account): void {
    this.selectedUser = user;
    this.editForm = {
      userName: user.userName || '',
      email: user.email || '',
      accountType: user.accountType,
      balance: user.balance,
      isActive: user.isActive ?? true
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  saveUser(): void {
    if (this.selectedUser) {
      this.bankingService.updateAccount(
        this.selectedUser.id,
        this.editForm.accountType,
        this.editForm.isActive,
        this.editForm.balance,
        this.editForm.userName,
        this.editForm.email
      ).subscribe({
        next: (updatedAccount) => {
          // Update the account in the list
          const index = this.accounts.findIndex(a => a.id === this.selectedUser!.id);
          if (index !== -1) {
            this.accounts[index] = {
              ...this.accounts[index],
              accountType: updatedAccount.accountType,
              isActive: updatedAccount.isActive
            };
          }
          alert('User account updated successfully!');
          this.closeEditModal();
        },
        error: (error) => {
          alert('Failed to update user: ' + (error.error?.message || error.message));
        }
      });
    }
  }
}