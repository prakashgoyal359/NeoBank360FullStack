import { CommonModule } from '@angular/common';

import { Component, OnInit, ChangeDetectorRef, effect } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { MatTableModule } from '@angular/material/table';

import {
  AdminDashboardService,
  AdminUser,
  UserActivity,
} from '../../../services/admin-dashboard.service';

import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-user-management',

  standalone: true,

  imports: [CommonModule, FormsModule, MatTableModule, MatPaginatorModule],

  template: `
    <section class="users" [class.dark-mode]="isDarkMode">
      <div class="title-row">
        <div>
          <h2>User Management</h2>

          <p>Secure admin controls and activity monitoring.</p>
        </div>

        <input [(ngModel)]="search" (keyup.enter)="loadUsers()" placeholder="Search users" />
      </div>

      <div class="table-scroll">
        <table mat-table [dataSource]="users" class="user-table">
          <ng-container matColumnDef="id"
            ><th mat-header-cell *matHeaderCellDef>User ID</th>

            <td mat-cell *matCellDef="let user">{{ user.id }}</td></ng-container
          >

          <ng-container matColumnDef="fullName"
            ><th mat-header-cell *matHeaderCellDef>Full Name</th>

            <td mat-cell *matCellDef="let user">{{ user.fullName }}</td></ng-container
          >

          <ng-container matColumnDef="email"
            ><th mat-header-cell *matHeaderCellDef>Email</th>

            <td mat-cell *matCellDef="let user">{{ user.email }}</td></ng-container
          >

          <ng-container matColumnDef="role"
            ><th mat-header-cell *matHeaderCellDef>Role</th>

            <td mat-cell *matCellDef="let user">{{ user.role }}</td></ng-container
          >

          <ng-container matColumnDef="status"
            ><th mat-header-cell *matHeaderCellDef>Status</th>

            <td mat-cell *matCellDef="let user">
              <span class="chip" [class.active]="user.isActive" [class.inactive]="!user.isActive">{{
                user.isActive ? 'ACTIVE' : 'INACTIVE'
              }}</span>
            </td></ng-container
          >

          <ng-container matColumnDef="createdAt"
            ><th mat-header-cell *matHeaderCellDef>Registered Date</th>

            <td mat-cell *matCellDef="let user">
              {{ user.createdAt | date: 'mediumDate' }}
            </td></ng-container
          >

          <ng-container matColumnDef="actions"
            ><th mat-header-cell *matHeaderCellDef>Actions</th>

            <td mat-cell *matCellDef="let user">
              <button (click)="toggleStatus(user)">
                {{ user.isActive ? 'Deactivate' : 'Activate' }}</button
              ><button class="ghost" (click)="loadActivity(user)">Activity</button>
            </td></ng-container
          >

          <tr mat-header-row *matHeaderRowDef="columns"></tr>

          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </div>

      <mat-paginator
        [length]="total"
        [pageSize]="pageSize"
        [pageIndex]="page"
        [pageSizeOptions]="[5, 10, 20]"
        (page)="onPage($event)"
      ></mat-paginator>

      <div class="activity" *ngIf="selectedUser">
        <h3>{{ selectedUser.fullName }} Activity</h3>

        <div *ngFor="let item of activity" class="activity-row">
          <span>{{ item.transactionDate | date: 'short' }}</span>

          <strong [class.credit]="item.transactionType === 'CREDIT'"
            >{{ item.transactionType }} ₹{{ item.amount | number }}</strong
          >

          <span>{{ item.category || 'Other' }} - {{ item.description }}</span>
        </div>

        <div class="empty" *ngIf="activity.length === 0">No activity found</div>
      </div>
    </section>
  `,

  styles: [
    `
      /* Light mode (default) */

      .users {
        padding: 2rem;

        color: #1f2937;

        background: #ffffff;
      }

      .title-row {
        display: flex;

        justify-content: space-between;

        align-items: center;

        margin-bottom: 1rem;

        gap: 1rem;
      }

      h2,
      h3,
      p {
        margin: 0;
      }

      h2 {
        color: #111827;
      }

      p {
        color: #6b7280;

        margin-top: 0.35rem;
      }

      input {
        background: #ffffff;

        color: #1f2937;

        border: 2px solid #e5e7eb;

        border-radius: 8px;

        padding: 0.7rem;

        min-width: 260px;
      }

      .user-table {
        width: 100%;

        min-width: 920px;

        background: #ffffff;

        border-radius: 12px;

        overflow: hidden;

        border: 1px solid #e5e7eb;
      }

      .table-scroll {
        width: 100%;

        overflow-x: auto;

        overflow-y: hidden;

        -webkit-overflow-scrolling: touch;

        border-radius: 12px;
      }

      .table-scroll::-webkit-scrollbar {
        height: 8px;
      }

      .table-scroll::-webkit-scrollbar-thumb {
        background: rgba(59, 130, 246, 0.45);

        border-radius: 999px;
      }

      .mat-mdc-header-cell {
        color: #374151;

        font-weight: 800;

        background: #f9fafb;
      }

      .mat-mdc-cell {
        color: #1f2937;
      }

      .mat-mdc-row,
      .mat-mdc-header-row {
        background: transparent;
      }

      .mat-mdc-row {
        border-bottom: 1px solid #e5e7eb;
      }

      .chip {
        border-radius: 999px;

        padding: 0.25rem 0.7rem;

        font-size: 0.75rem;

        font-weight: 800;
      }

      .active {
        background: rgba(209, 250, 229, 0.6);

        color: #059669;
      }

      .inactive {
        background: rgba(254, 226, 226, 0.6);

        color: #dc2626;
      }

      button {
        margin-right: 0.45rem;

        background: #3b82f6;

        color: white;

        border: 0;

        border-radius: 7px;

        padding: 0.45rem 0.7rem;

        cursor: pointer;

        font-weight: 600;
      }

      button.ghost {
        background: #e5e7eb;

        color: #1f2937;
      }

      button:hover {
        opacity: 0.9;
      }

      mat-paginator {
        background: #ffffff;

        color: #1f2937;

        border-top: 1px solid #e5e7eb;
      }

      .activity {
        margin-top: 1rem;

        background: #f9fafb;

        border-radius: 12px;

        padding: 1rem;

        border: 1px solid #e5e7eb;
      }

      .activity-row {
        display: grid;

        grid-template-columns: 180px 160px 1fr;

        gap: 1rem;

        padding: 0.75rem 0;

        border-bottom: 1px solid #e5e7eb;

        color: #6b7280;
      }

      .activity-row strong {
        color: #dc2626;
      }

      .activity-row strong.credit {
        color: #059669;
      }

      .empty {
        color: #9ca3af;

        padding: 1rem;
      }

      /* Dark mode */

      .users.dark-mode {
        padding: 2rem;

        color: #f8fafc;

        background: transparent;
      }

      .users.dark-mode h2 {
        color: #f1f5f9;
      }

      .users.dark-mode p {
        color: #a8bddf;
      }

      .users.dark-mode input {
        background: #0f3460;

        color: #e5efff;

        border: 1px solid #2d5b91;
      }

      .users.dark-mode .user-table {
        background: rgba(22, 33, 62, 0.94);

        border-color: rgba(148, 163, 184, 0.18);
      }

      .users.dark-mode .mat-mdc-header-cell {
        color: #bfdbfe;

        background: #0f3460;
      }

      .users.dark-mode .mat-mdc-cell {
        color: #f8fafc;
      }

      .users.dark-mode .mat-mdc-row {
        border-bottom-color: rgba(148, 163, 184, 0.18);
      }

      .users.dark-mode .active {
        background: rgba(52, 211, 153, 0.18);

        color: #34d399;
      }

      .users.dark-mode .inactive {
        background: rgba(248, 113, 113, 0.18);

        color: #f87171;
      }

      .users.dark-mode button.ghost {
        background: #334155;

        color: #e5e7eb;
      }

      .users.dark-mode mat-paginator {
        background: rgba(22, 33, 62, 0.94);

        color: #f8fafc;

        border-top-color: rgba(148, 163, 184, 0.18);
      }

      .users.dark-mode .activity {
        background: rgba(22, 33, 62, 0.94);

        border-color: rgba(148, 163, 184, 0.18);
      }

      .users.dark-mode .activity-row {
        border-bottom-color: rgba(148, 163, 184, 0.18);

        color: #a8bddf;
      }

      .users.dark-mode .activity-row strong {
        color: #f87171;
      }

      .users.dark-mode .activity-row strong.credit {
        color: #34d399;
      }

      .users.dark-mode .empty {
        color: #a8bddf;
      }

      @media (max-width: 1023px) {
        .users {
          padding: 1rem;
        }

        .title-row {
          align-items: stretch;

          flex-direction: column;
        }

        input {
          width: 100%;

          min-width: 0;

          font-size: 16px;
        }

        .activity {
          overflow-x: auto;
        }

        .activity-row {
          min-width: 720px;
        }
      }

      @media (max-width: 640px) {
        .users {
          padding: 0.875rem;
        }

        .activity-row {
          grid-template-columns: 1fr;

          min-width: 0;

          gap: 0.35rem;
        }
      }
    `,
  ],
})
export class UserManagementComponent implements OnInit {
  columns = ['id', 'fullName', 'email', 'role', 'status', 'createdAt', 'actions'];

  users: AdminUser[] = [];

  total = 0;

  page = 0;

  pageSize = 5;

  search = '';

  selectedUser: AdminUser | null = null;

  activity: UserActivity[] = [];

  isDarkMode = false;

  constructor(
    private service: AdminDashboardService,

    private cdr: ChangeDetectorRef,

    private themeService: ThemeService,
  ) {
    effect(() => {
      this.isDarkMode = this.themeService.isDarkMode();

      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.service
      .getUsers(this.page, this.pageSize, this.search)

      .subscribe({
        next: (data) => {
          this.users = [...data.content];

          this.total = data.totalElements;

          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error(err);

          this.cdr.detectChanges();
        },
      });
  }

  onPage(event: PageEvent): void {
    this.page = event.pageIndex;

    this.pageSize = event.pageSize;

    this.loadUsers();
  }

  toggleStatus(user: AdminUser): void {
    const active = !user.isActive;

    if (!confirm(`${active ? 'Activate' : 'Deactivate'} ${user.fullName}?`)) return;

    this.service

      .setUserStatus(user.id, active)

      .subscribe({
        next: () => this.loadUsers(),

        error: (err) => alert(err.error?.message || 'Status update failed'),
      });
  }

  loadActivity(user: AdminUser): void {
    this.selectedUser = user;

    this.activity = [];

    this.cdr.detectChanges();

    this.service
      .getUserActivity(user.id)

      .subscribe({
        next: (data) => {
          this.activity = [...data.content];

          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error(err);

          this.cdr.detectChanges();
        },
      });
  }
}
