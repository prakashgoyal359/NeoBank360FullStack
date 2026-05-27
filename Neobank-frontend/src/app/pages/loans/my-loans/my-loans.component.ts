import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ThemeService } from '../../../services/theme.service';
import { LoanService, LoanAccount, LoanRepayment, LoanApplication, LoanDashboard } from '../../../services/loan.service';

@Component({
  selector: 'app-my-loans',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatSortModule],
  template: `
    <div class="my-loans-container" [class.dark-mode]="isDarkMode">
      <div class="page-header">
        <h2>My Loans</h2>
        <p>View and manage your active loans</p>
      </div>

      <!-- Dashboard Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <span class="stat-value">{{ dashboard?.activeLoans || 0 }}</span>
            <span class="stat-label">Active Loans</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <span class="stat-value">₹{{ dashboard?.totalOutstanding || 0 | number }}</span>
            <span class="stat-label">Outstanding</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <span class="stat-value">{{ upcomingEmis.length }}</span>
            <span class="stat-label">Upcoming EMIs</span>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'accounts'" (click)="activeTab = 'accounts'">
          My Loans ({{ loanAccounts.length }})
        </button>
        <button class="tab" [class.active]="activeTab === 'applications'" (click)="activeTab = 'applications'">
          Applications ({{ applications.length }})
        </button>
        <button class="tab" [class.active]="activeTab === 'upcoming'" (click)="activeTab = 'upcoming'; loadUpcomingEmis()">
          Upcoming EMIs ({{ upcomingEmis.length }})
        </button>
      </div>

      <!-- My Loans Tab -->
      <div *ngIf="activeTab === 'accounts'" class="tab-content">
        <div *ngIf="loanAccounts.length === 0" class="empty-state">
          <div class="empty-icon">💳</div>
          <h3>No Active Loans</h3>
          <p>You don't have any active loans yet.</p>
          <button class="btn-primary" (click)="navigateToApply()">Apply for a Loan</button>
        </div>

        <div *ngFor="let account of loanAccounts" class="loan-card">
          <div class="loan-header">
            <div class="loan-info">
              <h3>{{ account.productName }}</h3>
              <span class="loan-account-number">{{ account.loanAccountNumber }}</span>
            </div>
            <span class="status-badge" [class]="getStatusClass(account.status)">
              {{ account.status }}
            </span>
          </div>

          <div class="loan-details-grid">
            <div class="detail-item">
              <span class="label">Principal Amount</span>
              <span class="value">₹{{ account.principalAmount | number }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Interest Rate</span>
              <span class="value">{{ account.interestRate * 100 | number:'1.2-2' }}% p.a.</span>
            </div>
            <div class="detail-item">
              <span class="label">Tenure</span>
              <span class="value">{{ account.tenureMonths }} months</span>
            </div>
            <div class="detail-item highlight">
              <span class="label">Monthly EMI</span>
              <span class="value">₹{{ account.emiAmount | number }}</span>
            </div>
          </div>

          <div class="loan-progress">
            <div class="progress-header">
              <span>Loan Progress</span>
              <span>{{ account.paidInstallments }} / {{ account.totalInstallments }} EMIs paid</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="(account.paidInstallments / account.totalInstallments) * 100"></div>
            </div>
          </div>

          <div class="loan-footer">
            <div class="remaining-info">
              <span class="label">Remaining</span>
              <span class="value">₹{{ account.remainingPrincipal | number }}</span>
            </div>
            <button class="btn-secondary" (click)="viewSchedule(account)">View Schedule</button>
          </div>
        </div>
      </div>

      <!-- Applications Tab -->
      <div *ngIf="activeTab === 'applications'" class="tab-content">
        <div *ngIf="applications.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>No Applications</h3>
          <p>You haven't applied for any loans yet.</p>
          <button class="btn-primary" (click)="navigateToApply()">Apply for a Loan</button>
        </div>

        <div *ngFor="let app of applications" class="application-card">
          <div class="app-header">
            <div class="app-info">
              <h3>{{ app.productName }}</h3>
              <span class="app-number">{{ app.applicationNumber }}</span>
            </div>
            <span class="status-badge" [class]="getApplicationStatusClass(app.status)">
              {{ app.status }}
            </span>
          </div>

          <div class="app-details">
            <div class="detail-item">
              <span class="label">Requested Amount</span>
              <span class="value">₹{{ app.requestedAmount | number }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Tenure</span>
              <span class="value">{{ app.requestedTenure }} months</span>
            </div>
            <div class="detail-item">
              <span class="label">Applied On</span>
              <span class="value">{{ app.appliedAt | date:'short' }}</span>
            </div>
          </div>

          <div *ngIf="app.status === 'REJECTED' && app.rejectionReason" class="rejection-info">
            <strong>Rejection Reason:</strong> {{ app.rejectionReason }}
          </div>
        </div>
      </div>

      <!-- Upcoming EMIs Tab -->
      <div *ngIf="activeTab === 'upcoming'" class="tab-content">
        <div *ngIf="upcomingEmis.length === 0" class="empty-state">
          <div class="empty-icon">✅</div>
          <h3>All Caught Up!</h3>
          <p>You have no upcoming EMIs.</p>
        </div>

        <div *ngFor="let emi of upcomingEmis" class="emi-card" [class.overdue]="emi.isOverdue">
          <div class="emi-header">
            <div class="emi-info">
              <h4>{{ emi.loanAccountNumber }}</h4>
              <span class="installment">EMI #{{ emi.installmentNumber }}</span>
            </div>
            <span class="status-badge small" [ngClass]="getStatusClass(emi.status)">
              {{ emi.status }}
            </span>
          </div>

          <div class="emi-details">
            <div class="detail-item">
              <span class="label">Due Date</span>
              <span class="value" [class.overdue-date]="emi.isOverdue">{{ emi.dueDate | date:'mediumDate' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Amount</span>
              <span class="value">₹{{ emi.emiAmount | number }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Principal</span>
              <span class="value">₹{{ emi.principalComponent | number }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Interest</span>
              <span class="value">₹{{ emi.interestComponent | number }}</span>
            </div>
          </div>

          <button class="btn-pay" (click)="payEmi(emi)">Pay Now</button>
        </div>
      </div>

      <!-- Repayment Schedule Modal -->
      <div *ngIf="showScheduleModal" class="modal-overlay" (click)="showScheduleModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Repayment Schedule</h3>
            <button class="close-btn" (click)="showScheduleModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="schedule-summary">
              <p><strong>Loan Account:</strong> {{ selectedLoanAccount?.loanAccountNumber }}</p>
              <p><strong>Total EMIs:</strong> {{ selectedLoanAccount?.tenureMonths }}</p>
              <p><strong>EMI Amount:</strong> ₹{{ selectedLoanAccount?.emiAmount | number }}</p>
            </div>

            <div class="schedule-table mat-elevation-z1">
              <table mat-table [dataSource]="repaymentsDataSource" matSort class="repayment-mat-table">
                <ng-container matColumnDef="installmentNumber">
                  <th mat-header-cell *matHeaderCellDef>#</th>
                  <td mat-cell *matCellDef="let repayment">{{ repayment.installmentNumber }}</td>
                </ng-container>

                <ng-container matColumnDef="dueDate">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Due Date</th>
                  <td mat-cell *matCellDef="let repayment">{{ repayment.dueDate | date:'mediumDate' }}</td>
                </ng-container>

                <ng-container matColumnDef="emiAmount">
                  <th mat-header-cell *matHeaderCellDef>EMI</th>
                  <td mat-cell *matCellDef="let repayment">₹{{ repayment.emiAmount | number }}</td>
                </ng-container>

                <ng-container matColumnDef="principalComponent">
                  <th mat-header-cell *matHeaderCellDef>Principal</th>
                  <td mat-cell *matCellDef="let repayment">₹{{ repayment.principalComponent | number }}</td>
                </ng-container>

                <ng-container matColumnDef="interestComponent">
                  <th mat-header-cell *matHeaderCellDef>Interest</th>
                  <td mat-cell *matCellDef="let repayment">₹{{ repayment.interestComponent | number }}</td>
                </ng-container>

                <ng-container matColumnDef="remainingPrincipal">
                  <th mat-header-cell *matHeaderCellDef>Balance</th>
                  <td mat-cell *matCellDef="let repayment">₹{{ repayment.remainingPrincipal | number }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                  <td mat-cell *matCellDef="let repayment">
                    <span class="status-badge small" [ngClass]="getStatusClass(repayment.status)">
                      {{ repayment.status }}
                    </span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="repaymentColumns"></tr>
                <tr mat-row *matRowDef="let repayment; columns: repaymentColumns"
                    [class.paid-row]="repayment.status === 'PAID'"
                    [class.overdue-row]="repayment.status === 'OVERDUE'"></tr>
              </table>
              <mat-paginator [pageSize]="10" [pageSizeOptions]="[5, 10, 20, 60]" showFirstLastButtons></mat-paginator>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-loans-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      animation: fadeIn 0.3s ease;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h2 { margin: 0 0 0.5rem; color: #1e293b; }
    .page-header p { margin: 0; color: #64748b; }
    .dark-mode .page-header h2 { color: #e4e4e7; }
    .dark-mode .page-header p { color: #94a3b8; }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    }

    .dark-mode .stat-card { background: #16213e; }

    .stat-icon { font-size: 2.5rem; }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #3b82f6;
    }

    .stat-label {
      color: #64748b;
      font-size: 0.9rem;
    }

    .dark-mode .stat-label { color: #94a3b8; }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .dark-mode .tabs { border-color: #2a2a4a; }

    .tab {
      padding: 1rem 1.5rem;
      background: none;
      border: none;
      font-size: 1rem;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;
    }

    .tab:hover { color: #3b82f6; }
    .tab.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
    }

    .dark-mode .tab { color: #94a3b8; }
    .dark-mode .tab:hover,
    .dark-mode .tab.active { color: #60a5fa; border-bottom-color: #60a5fa; }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    }

    .dark-mode .empty-state { background: #16213e; }

    .empty-icon { font-size: 4rem; margin-bottom: 1rem; }
    .empty-state h3 { margin: 0 0 0.5rem; color: #1e293b; }
    .empty-state p { color: #64748b; margin-bottom: 1.5rem; }

    .dark-mode .empty-state h3 { color: #e4e4e7; }
    .dark-mode .empty-state p { color: #94a3b8; }

    /* Loan Card */
    .loan-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    }

    .dark-mode .loan-card { background: #16213e; }

    .loan-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .loan-info h3 { margin: 0; color: #1e293b; font-size: 1.25rem; }
    .loan-account-number {
      font-size: 0.85rem;
      color: #64748b;
      font-family: monospace;
    }

    .dark-mode .loan-info h3 { color: #e4e4e7; }
    .dark-mode .loan-account-number { color: #94a3b8; }

    .loan-details-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .detail-item .label {
      display: block;
      font-size: 0.8rem;
      color: #64748b;
      margin-bottom: 0.25rem;
    }

    .detail-item .value {
      font-weight: 600;
      color: #334155;
    }

    .detail-item.highlight .value { color: #3b82f6; font-size: 1.1rem; }

    .dark-mode .detail-item .label { color: #94a3b8; }
    .dark-mode .detail-item .value { color: #e4e4e7; }

    .loan-progress {
      margin-bottom: 1.5rem;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: #64748b;
    }

    .progress-bar {
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #10b981);
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .loan-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    .dark-mode .loan-footer { border-color: #2a2a4a; }

    .remaining-info .label {
      display: block;
      font-size: 0.8rem;
      color: #64748b;
    }

    .remaining-info .value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #ef4444;
    }

    .dark-mode .remaining-info .label { color: #94a3b8; }
    .dark-mode .remaining-info .value { color: #f87171; }

    /* Status Badge */
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.ACTIVE { background: #d1fae5; color: #059669; }
    .status-badge.CLOSED { background: #e2e8f0; color: #64748b; }
    .status-badge.PENDING { background: #fef3c7; color: #d97706; }
    .status-badge.APPROVED { background: #d1fae5; color: #059669; }
    .status-badge.REJECTED { background: #fee2e2; color: #dc2626; }
    .status-badge.PAID { background: #d1fae5; color: #059669; }
    .status-badge.OVERDUE { background: #fee2e2; color: #dc2626; }
    .status-badge.small { font-size: 0.65rem; padding: 0.15rem 0.5rem; }

    .dark-mode .status-badge.ACTIVE { background: #064e3b; color: #34d399; }
    .dark-mode .status-badge.PENDING { background: #78350f; color: #fbbf24; }
    .dark-mode .status-badge.REJECTED { background: #7f1d1d; color: #f87171; }
    .dark-mode .status-badge.PAID { background: #064e3b; color: #34d399; }
    .dark-mode .status-badge.OVERDUE { background: #7f1d1d; color: #f87171; }

    /* Application Card */
    .application-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    }

    .dark-mode .application-card { background: #16213e; }

    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .app-info h3 { margin: 0; color: #1e293b; font-size: 1.1rem; }
    .app-number {
      font-size: 0.8rem;
      color: #64748b;
      font-family: monospace;
    }

    .dark-mode .app-info h3 { color: #e4e4e7; }
    .dark-mode .app-number { color: #94a3b8; }

    .app-details {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .rejection-info {
      margin-top: 1rem;
      padding: 1rem;
      background: #fef2f2;
      border-radius: 8px;
      color: #dc2626;
      font-size: 0.9rem;
    }

    .dark-mode .rejection-info { background: #7f1d1d; color: #f87171; }

    /* EMI Card */
    .emi-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      border-left: 4px solid #3b82f6;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    }

    .emi-card.overdue { border-left-color: #ef4444; }
    .dark-mode .emi-card { background: #16213e; }

    .emi-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .emi-info h4 { margin: 0; color: #1e293b; }
    .installment { font-size: 0.85rem; color: #64748b; }

    .dark-mode .emi-info h4 { color: #e4e4e7; }
    .dark-mode .installment { color: #94a3b8; }

    .overdue-badge {
      background: #ef4444;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
    }

    .emi-details {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .overdue-date { color: #ef4444 !important; }

    .btn-pay {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-pay:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); }

    /* Buttons */
    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.3s ease;
    }

    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; }
    .btn-secondary { background: #e2e8f0; color: #334155; }
    .btn-secondary:hover { background: #cbd5e1; }

    .dark-mode .btn-secondary { background: #374151; color: #e4e4e7; }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 90%;
      max-width: 900px;
      max-height: 80vh;
      overflow: hidden;
      animation: slideUp 0.3s ease;
    }

    .dark-mode .modal-content { background: #16213e; }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .dark-mode .modal-header { border-color: #2a2a4a; }

    .modal-header h3 { margin: 0; color: #1e293b; }
    .dark-mode .modal-header h3 { color: #e4e4e7; }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #94a3b8;
    }

    .modal-body {
      padding: 1.5rem;
      max-height: calc(80vh - 80px);
      overflow-y: auto;
    }

    .schedule-summary {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .dark-mode .schedule-summary { background: #1e293b; }
    .schedule-summary p { margin: 0.25rem 0; }
    .dark-mode .schedule-summary p { color: #e4e4e7; }

    .schedule-table {
      overflow-x: auto;
      border-radius: 10px;
      background: white;
    }

    .legacy-hidden { display: none; }

    .dark-mode .schedule-table { background: #101a33; }

    table,
    .repayment-mat-table {
      width: 100%;
      border-collapse: collapse;
      background: transparent;
    }

    th, td,
    .mat-mdc-header-cell,
    .mat-mdc-cell {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    th,
    .mat-mdc-header-cell {
      background: #f8fafc;
      font-weight: 600;
      color: #334155;
      font-size: 0.85rem;
    }

    .dark-mode th,
    .dark-mode .mat-mdc-header-cell { background: #1e293b; color: #e4e4e7; }
    .dark-mode td,
    .dark-mode .mat-mdc-cell { border-color: #2a2a4a; color: #e4e4e7; }
    .dark-mode .mat-mdc-paginator {
      background: #101a33;
      color: #e4e4e7;
    }

    .paid-row td { color: #059669 !important; }
    .overdue-row td { color: #dc2626 !important; }

    @media (max-width: 768px) {
      .my-loans-container { padding: 1rem; }
      .stats-grid { grid-template-columns: 1fr; }
      .loan-details-grid { grid-template-columns: repeat(2, 1fr); }
      .app-details { grid-template-columns: 1fr; }
      .emi-details { grid-template-columns: repeat(2, 1fr); }
      .tabs { overflow-x: auto; }
      .tab { white-space: nowrap; }
    }
  `]
})
export class MyLoansComponent implements OnInit {
  isDarkMode = false;
  activeTab = 'accounts';

  loanAccounts: LoanAccount[] = [];
  applications: LoanApplication[] = [];
  upcomingEmis: LoanRepayment[] = [];
  dashboard: LoanDashboard | null = null;

  showScheduleModal = false;
  selectedLoanAccount: LoanAccount | null = null;
  repayments: LoanRepayment[] = [];
  repaymentsDataSource = new MatTableDataSource<LoanRepayment>([]);
  repaymentColumns = [
    'installmentNumber',
    'dueDate',
    'emiAmount',
    'principalComponent',
    'interestComponent',
    'remainingPrincipal',
    'status',
  ];

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator | undefined) {
    if (paginator) {
      this.repaymentsDataSource.paginator = paginator;
    }
  }

  @ViewChild(MatSort) set sort(sort: MatSort | undefined) {
    if (sort) {
      this.repaymentsDataSource.sort = sort;
    }
  }

  constructor(
    private loanService: LoanService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {
    this.isDarkMode = this.themeService.getCurrentTheme() === 'dark';
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadDashboard();
    this.loadAccounts();
    this.loadApplications();
  }

  loadDashboard(): void {
    this.loanService.getUserDashboard().subscribe({
      next: (data) => { this.dashboard = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading dashboard:', err)
    });
  }

  loadAccounts(): void {
    this.loanService.getMyAccounts().subscribe({
      next: (data) => { this.loanAccounts = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading accounts:', err)
    });
  }

  loadApplications(): void {
    this.loanService.getMyApplications().subscribe({
      next: (data) => { this.applications = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading applications:', err)
    });
  }

  loadUpcomingEmis(): void {
    this.loanService.getMyRepayments().subscribe({
      next: (data) => {
        this.upcomingEmis = data.filter(r => r.status === 'PENDING' || r.status === 'OVERDUE');
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading repayments:', err)
    });
  }

  viewSchedule(account: LoanAccount): void {
    this.selectedLoanAccount = account;
    this.loanService.getRepayments(account.id).subscribe({
      next: (data) => {
        this.repayments = data;
        this.repaymentsDataSource.data = data;
        this.showScheduleModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading schedule:', err)
    });
  }

  payEmi(emi: LoanRepayment): void {
    if (confirm(`Pay EMI #${emi.installmentNumber} of ₹${emi.emiAmount}?`)) {
      this.loanService.payRepayment(emi.loanAccountId, emi.id).subscribe({
        next: () => {
          alert('EMI paid successfully!');
          this.loadData();
          this.cdr.detectChanges();
        },
        error: (err) => alert(err.error?.message || 'Payment failed')
      });
    }
  }

  navigateToApply(): void {
    window.location.href = '/user?section=loans-apply';
  }

  getStatusClass(status: string): string {
    return status;
  }

  getApplicationStatusClass(status: string): string {
    return status;
  }
}
