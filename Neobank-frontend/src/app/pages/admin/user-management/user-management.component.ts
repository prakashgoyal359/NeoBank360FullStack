import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { AdminDashboardService, AdminUser, UserActivity } from '../../../services/admin-dashboard.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatPaginatorModule],
  template: `
    <section class="users">
      <div class="title-row">
        <div><h2>User Management</h2><p>Secure admin controls and activity monitoring.</p></div>
        <input [(ngModel)]="search" (keyup.enter)="loadUsers()" placeholder="Search users" />
      </div>
      <table mat-table [dataSource]="users" class="user-table">
        <ng-container matColumnDef="id"><th mat-header-cell *matHeaderCellDef>User ID</th><td mat-cell *matCellDef="let user">{{ user.id }}</td></ng-container>
        <ng-container matColumnDef="fullName"><th mat-header-cell *matHeaderCellDef>Full Name</th><td mat-cell *matCellDef="let user">{{ user.fullName }}</td></ng-container>
        <ng-container matColumnDef="email"><th mat-header-cell *matHeaderCellDef>Email</th><td mat-cell *matCellDef="let user">{{ user.email }}</td></ng-container>
        <ng-container matColumnDef="role"><th mat-header-cell *matHeaderCellDef>Role</th><td mat-cell *matCellDef="let user">{{ user.role }}</td></ng-container>
        <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let user"><span class="chip" [class.active]="user.isActive" [class.inactive]="!user.isActive">{{ user.isActive ? 'ACTIVE' : 'INACTIVE' }}</span></td></ng-container>
        <ng-container matColumnDef="createdAt"><th mat-header-cell *matHeaderCellDef>Registered Date</th><td mat-cell *matCellDef="let user">{{ user.createdAt | date:'mediumDate' }}</td></ng-container>
        <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>Actions</th><td mat-cell *matCellDef="let user"><button (click)="toggleStatus(user)">{{ user.isActive ? 'Deactivate' : 'Activate' }}</button><button class="ghost" (click)="loadActivity(user)">Activity</button></td></ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>
      <mat-paginator [length]="total" [pageSize]="pageSize" [pageIndex]="page" [pageSizeOptions]="[5,10,20]" (page)="onPage($event)"></mat-paginator>

      <div class="activity" *ngIf="selectedUser">
        <h3>{{ selectedUser.fullName }} Activity</h3>
        <div *ngFor="let item of activity" class="activity-row">
          <span>{{ item.transactionDate | date:'short' }}</span>
          <strong [class.credit]="item.transactionType === 'CREDIT'">{{ item.transactionType }} ₹{{ item.amount | number }}</strong>
          <span>{{ item.category || 'Other' }} - {{ item.description }}</span>
        </div>
        <div class="empty" *ngIf="activity.length === 0">No activity found</div>
      </div>
    </section>
  `,
  styles: [`
    .users { padding: 2rem; color: #f8fafc; }
    .title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; gap: 1rem; }
    h2, h3, p { margin: 0; } p { color: #a8bddf; margin-top: .35rem; }
    input { background: #12345d; color: #e5efff; border: 1px solid #2d5b91; border-radius: 8px; padding: .7rem; min-width: 260px; }
    .user-table { width: 100%; background: rgba(22,33,62,.94); border-radius: 12px; overflow: hidden; }
    .mat-mdc-header-cell { color: #bfdbfe; font-weight: 800; }
    .mat-mdc-cell { color: #f8fafc; }
    .mat-mdc-row, .mat-mdc-header-row { background: transparent; }
    .chip { border-radius: 999px; padding: .25rem .7rem; font-size: .75rem; font-weight: 800; }
    .active { background: rgba(52,211,153,.18); color: #34d399; }
    .inactive { background: rgba(248,113,113,.18); color: #f87171; }
    button { margin-right: .45rem; background: #2563eb; color: white; border: 0; border-radius: 7px; padding: .45rem .7rem; cursor: pointer; }
    button.ghost { background: #334155; }
    mat-paginator { background: rgba(22,33,62,.94); color: #f8fafc; }
    .activity { margin-top: 1rem; background: rgba(22,33,62,.94); border-radius: 12px; padding: 1rem; }
    .activity-row { display: grid; grid-template-columns: 180px 160px 1fr; gap: 1rem; padding: .75rem 0; border-bottom: 1px solid rgba(148,163,184,.18); }
    .activity-row strong { color: #f87171; } .activity-row strong.credit { color: #34d399; }
    .empty { color: #a8bddf; padding: 1rem; }
  `],
})
export class UserManagementComponent implements OnInit {
  columns = ['id', 'fullName', 'email', 'role', 'status', 'createdAt', 'actions'];
  users: AdminUser[] = [];
  total = 0;
  page = 0;
  pageSize = 10;
  search = '';
  selectedUser: AdminUser | null = null;
  activity: UserActivity[] = [];

  constructor(private service: AdminDashboardService) {}
  ngOnInit(): void { this.loadUsers(); }
  loadUsers(): void {
    this.service.getUsers(this.page, this.pageSize, this.search).subscribe((data) => {
      this.users = data.content; this.total = data.totalElements;
    });
  }
  onPage(event: PageEvent): void {
    this.page = event.pageIndex; this.pageSize = event.pageSize; this.loadUsers();
  }
  toggleStatus(user: AdminUser): void {
    const active = !user.isActive;
    if (!confirm(`${active ? 'Activate' : 'Deactivate'} ${user.fullName}?`)) return;
    this.service.setUserStatus(user.id, active).subscribe({ next: () => this.loadUsers(), error: (err) => alert(err.error?.message || 'Status update failed') });
  }
  loadActivity(user: AdminUser): void {
    this.selectedUser = user;
    this.service.getUserActivity(user.id).subscribe((data) => this.activity = data.content);
  }
}
