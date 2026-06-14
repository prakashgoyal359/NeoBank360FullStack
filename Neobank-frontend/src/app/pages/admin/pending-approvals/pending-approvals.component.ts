import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ChangeDetectorRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminDashboardService, PendingApproval } from '../../../services/admin-dashboard.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-pending-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="panel" [class.dark-mode]="isDarkMode">
      <div class="title-row">
        <div>
          <h2>Pending Approvals</h2>
          <p>Oldest-first loan approval queue.</p>
        </div>
        <select [(ngModel)]="moduleFilter" (change)="load()">
          <option value="">All Modules</option>
          <option value="LOAN">Loans</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Module</th>
            <th>Product</th>
            <th>Amount</th>
            <th>Applied</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of approvals">
            <td>{{ item.applicantName }}</td>
            <td>{{ item.module }}</td>
            <td>{{ item.productName }}</td>
            <td>₹{{ item.requestedAmount | number }}</td>
            <td>{{ item.applicationDate | date: 'medium' }}</td>
            <td>
              <span class="chip pending">{{ item.status }}</span>
            </td>
            <td><button class="review-btn" (click)="review.emit(item)">Review</button></td>
          </tr>
          <tr *ngIf="approvals.length === 0">
            <td colspan="7" class="empty">No pending approvals</td>
          </tr>
        </tbody>
      </table>
    </section>
  `,
  styles: [
    `
      .panel {
        padding: 2rem;
        color: #1f2937;
        background: #ffffff;
      }
      .panel.dark-mode {
        color: #f8fafc;
        background: transparent;
      }
      .title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      h2,
      p {
        margin: 0;
      }
      h2 {
        color: #111827;
      }
      .panel.dark-mode h2 {
        color: #f1f5f9;
      }
      p {
        color: #6b7280;
        margin-top: 0.35rem;
      }
      .panel.dark-mode p {
        color: #a8bddf;
      }
      select {
        background: #f3f4f6;
        color: #1f2937;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        padding: 0.7rem;
      }
      .panel.dark-mode select {
        background: #12345d;
        color: #e5efff;
        border-color: #2d5b91;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #e5e7eb;
      }
      .panel.dark-mode table {
        background: rgba(22, 33, 62, 0.94);
        border-color: rgba(148, 163, 184, 0.18);
      }
      th,
      td {
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
        text-align: left;
      }
      .panel.dark-mode th,
      .panel.dark-mode td {
        border-color: rgba(148, 163, 184, 0.18);
      }
      th {
        color: #374151;
        font-weight: 600;
      }
      .panel.dark-mode th {
        color: #bfdbfe;
      }
      td {
        color: #1f2937;
      }
      .panel.dark-mode td {
        color: #e4e4e7;
      }
      .chip {
        border-radius: 999px;
        padding: 0.25rem 0.7rem;
        font-size: 0.8rem;
        font-weight: 800;
      }
      .pending {
        background: rgba(251, 191, 36, 0.18);
        color: #fbbf24;
      }
      .review-btn {
        background: #2563eb;
        color: white;
        border: 0;
        border-radius: 8px;
        padding: 0.55rem 0.9rem;
        font-weight: 800;
        cursor: pointer;
      }
      .review-btn:hover {
        background: #1d4ed8;
      }
      .empty {
        text-align: center;
        color: #6b7280;
      }
      .panel.dark-mode .empty {
        color: #a8bddf;
      }
    `,
  ],
})
export class PendingApprovalsComponent implements OnInit {
  @Output() review = new EventEmitter<PendingApproval>();

  approvals: PendingApproval[] = [];
  moduleFilter = '';
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
    this.load();
  }

  load(): void {
    this.service.getPendingApprovals(this.moduleFilter).subscribe((data) => {
      this.approvals = data;
      this.cdr.detectChanges();
    });
  }
}
