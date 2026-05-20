import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../services/theme.service';
import { ThemeToggleComponent } from '../../../components/theme-toggle/theme-toggle.component';
import { AuthService } from '../../../services/auth.service';
import { LoanService, LoanProduct, LoanProductRequest, LoanApplication, LoanApplicationRequest, LoanDecisionRequest, LoanDashboard } from '../../../services/loan.service';

@Component({
  selector: 'app-admin-loans',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeToggleComponent],
  template: `
    <div class="admin-loans-container" [class.dark-mode]="isDarkMode">
      <!-- Top Header -->
      <header class="top-header">
        <h1 class="logo">NeoBank Admin - Loans</h1>
        <div class="header-right">
          <span class="user-name">{{ username }}</span>
          <app-theme-toggle></app-theme-toggle>
          <button class="btn-logout" (click)="logout()">Logout</button>
        </div>
      </header>

      <div class="main-container">
        <!-- Sidebar -->
        <aside class="sidebar">
          <nav class="sidebar-nav">
            <button class="nav-item" [class.active]="activeSection === 'products'" (click)="activeSection = 'products'">
              <span class="nav-icon">📦</span>
              <span class="nav-text">Loan Products</span>
            </button>
            <button class="nav-item" [class.active]="activeSection === 'applications'" (click)="activeSection = 'applications'; loadApplications()">
              <span class="nav-icon">📋</span>
              <span class="nav-text">Applications</span>
            </button>
            <button class="nav-item" [class.active]="activeSection === 'dashboard'" (click)="activeSection = 'dashboard'">
              <span class="nav-icon">📊</span>
              <span class="nav-text">Dashboard</span>
            </button>
          </nav>
          <div class="sidebar-footer">
            <app-theme-toggle></app-theme-toggle>
          </div>
        </aside>

        <!-- Content Area -->
        <main class="content-area">
          <!-- Dashboard Section -->
          <div *ngIf="activeSection === 'dashboard'" class="section">
            <h2>Loan Analytics</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">📦</div>
                <div class="stat-info">
                  <span class="stat-value">{{ dashboard?.totalProducts || 0 }}</span>
                  <span class="stat-label">Products</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">⏳</div>
                <div class="stat-info">
                  <span class="stat-value">{{ dashboard?.pendingApplications || 0 }}</span>
                  <span class="stat-label">Pending</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-info">
                  <span class="stat-value">{{ dashboard?.approvedApplications || 0 }}</span>
                  <span class="stat-label">Approved</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-info">
                  <span class="stat-value">{{ dashboard?.activeLoans || 0 }}</span>
                  <span class="stat-label">Active Loans</span>
                </div>
              </div>
            </div>

            <div class="analytics-row">
              <div class="analytics-card">
                <h3>Loan Portfolio</h3>
                <div class="analytics-content">
                  <div class="analytics-item">
                    <span class="label">Total Disbursed</span>
                    <span class="value">₹{{ dashboard?.totalDisbursed || 0 | number }}</span>
                  </div>
                  <div class="analytics-item">
                    <span class="label">Total Outstanding</span>
                    <span class="value">₹{{ dashboard?.totalOutstanding || 0 | number }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loan Products Section -->
          <div *ngIf="activeSection === 'products'" class="section">
            <div class="section-header">
              <h2>Loan Products</h2>
              <button class="btn-primary" (click)="openProductModal()">Add Product</button>
            </div>

            <div class="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Type</th>
                    <th>Interest Rate</th>
                    <th>Min/Max Amount</th>
                    <th>Tenure</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let product of products">
                    <td>{{ product.productName }}</td>
                    <td><span class="type-badge">{{ formatLoanType(product.loanType) }}</span></td>
                    <td>{{ product.interestRate * 100 | number:'1.2-2' }}%</td>
                    <td>₹{{ product.minAmount | number }} - ₹{{ product.maxAmount | number }}</td>
                    <td>{{ product.minTenure }} - {{ product.maxTenure }} months</td>
                    <td>
                      <span class="status-badge" [class.active]="product.isActive">
                        {{ product.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td>
                      <button class="btn-action" (click)="editProduct(product)">Edit</button>
                      <button class="btn-action delete" (click)="deleteProduct(product)">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Loan Applications Section -->
          <div *ngIf="activeSection === 'applications'" class="section">
            <div class="section-header">
              <h2>Loan Applications</h2>
            </div>

            <!-- Application Tabs -->
            <div class="tabs">
              <button class="tab" [class.active]="appTab === 'pending'" (click)="appTab = 'pending'; loadApplications()">
                Pending ({{ pendingApplications.length }})
              </button>
              <button class="tab" [class.active]="appTab === 'approved'" (click)="appTab = 'approved'; loadApplications()">
                Approved ({{ approvedApplications.length }})
              </button>
              <button class="tab" [class.active]="appTab === 'rejected'" (click)="appTab = 'rejected'; loadApplications()">
                Rejected ({{ rejectedApplications.length }})
              </button>
            </div>

            <div *ngIf="getCurrentApplications().length === 0" class="empty-state">
              <p>No {{ appTab }} applications</p>
            </div>

            <div *ngFor="let app of getCurrentApplications()" class="application-card">
              <div class="app-header">
                <div class="app-info">
                  <h3>{{ app.userName }}</h3>
                  <span class="app-email">{{ app.userEmail }}</span>
                </div>
                <span class="app-number">{{ app.applicationNumber }}</span>
              </div>

              <div class="app-details-grid">
                <div class="detail-item">
                  <span class="label">Product</span>
                  <span class="value">{{ app.productName }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Amount</span>
                  <span class="value">₹{{ app.requestedAmount | number }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Tenure</span>
                  <span class="value">{{ app.requestedTenure }} months</span>
                </div>
                <div class="detail-item">
                  <span class="label">Monthly Income</span>
                  <span class="value">₹{{ app.monthlyIncome || 0 | number }}</span>
                </div>
              </div>

              <div *ngIf="appTab === 'pending'" class="app-actions">
                <button class="btn-approve" (click)="openDecisionModal(app, 'APPROVED')">Approve</button>
                <button class="btn-reject" (click)="openDecisionModal(app, 'REJECTED')">Reject</button>
              </div>

              <div *ngIf="app.status === 'REJECTED' && app.rejectionReason" class="rejection-reason">
                <strong>Rejection Reason:</strong> {{ app.rejectionReason }}
              </div>
            </div>
          </div>
        </main>
      </div>

      <!-- Product Modal -->
      <div *ngIf="showProductModal" class="modal-overlay" (click)="closeProductModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingProduct ? 'Edit' : 'Create' }} Loan Product</h3>
            <button class="close-btn" (click)="closeProductModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Product Name</label>
              <input type="text" [(ngModel)]="productForm.productName" class="form-input" />
            </div>
            <div class="form-group">
              <label>Loan Type</label>
              <select [(ngModel)]="productForm.loanType" class="form-input">
                <option value="PERSONAL">Personal Loan</option>
                <option value="HOME">Home Loan</option>
                <option value="AUTO">Auto Loan</option>
                <option value="EDUCATION">Education Loan</option>
                <option value="BUSINESS">Business Loan</option>
              </select>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="productForm.description" class="form-input" rows="3"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Min Amount (₹)</label>
                <input type="number" [(ngModel)]="productForm.minAmount" class="form-input" />
              </div>
              <div class="form-group">
                <label>Max Amount (₹)</label>
                <input type="number" [(ngModel)]="productForm.maxAmount" class="form-input" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Interest Rate (%)</label>
                <input type="number" [(ngModel)]="productForm.interestRate" step="0.01" class="form-input" />
              </div>
              <div class="form-group">
                <label>Processing Fee (%)</label>
                <input type="number" [(ngModel)]="productForm.processingFee" step="0.01" class="form-input" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Min Tenure (months)</label>
                <input type="number" [(ngModel)]="productForm.minTenure" class="form-input" />
              </div>
              <div class="form-group">
                <label>Max Tenure (months)</label>
                <input type="number" [(ngModel)]="productForm.maxTenure" class="form-input" />
              </div>
            </div>
            <div class="form-group">
              <label>Allowed Tenures (comma-separated)</label>
              <input type="text" [(ngModel)]="productForm.allowedTenures" class="form-input" placeholder="12,24,36,48" />
            </div>

            <div *ngIf="formError" class="error-message">{{ formError }}</div>

            <button class="btn-primary" (click)="saveProduct()">
              {{ editingProduct ? 'Update' : 'Create' }} Product
            </button>
          </div>
        </div>
      </div>

      <!-- Decision Modal -->
      <div *ngIf="showDecisionModal" class="modal-overlay" (click)="closeDecisionModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ decisionType === 'APPROVED' ? 'Approve' : 'Reject' }} Application</h3>
            <button class="close-btn" (click)="closeDecisionModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="application-summary">
              <p><strong>Applicant:</strong> {{ selectedApplication?.userName }}</p>
              <p><strong>Product:</strong> {{ selectedApplication?.productName }}</p>
              <p><strong>Amount:</strong> ₹{{ selectedApplication?.requestedAmount | number }}</p>
              <p><strong>Tenure:</strong> {{ selectedApplication?.requestedTenure }} months</p>
            </div>

            <div class="form-group">
              <label>Remarks</label>
              <textarea [(ngModel)]="decisionRemarks" class="form-input" rows="3" placeholder="Add your remarks..."></textarea>
            </div>

            <div *ngIf="decisionType === 'REJECTED'" class="form-group">
              <label>Rejection Reason</label>
              <textarea [(ngModel)]="rejectionReason" class="form-input" rows="3" placeholder="Enter rejection reason..."></textarea>
            </div>

            <div *ngIf="decisionError" class="error-message">{{ decisionError }}</div>

            <div class="modal-actions">
              <button class="btn-secondary" (click)="closeDecisionModal()">Cancel</button>
              <button class="btn-primary" [class.approve]="decisionType === 'APPROVED'" [class.reject]="decisionType === 'REJECTED'" (click)="submitDecision()">
                Confirm {{ decisionType }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-loans-container {
      min-height: 100vh;
      background: #f5f7fa;
      color: #1a1a2e;
    }

    .dark-mode {
      background: #1a1a2e;
      color: #e4e4e7;
    }

    /* Header */
    .top-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .dark-mode .top-header {
      background: #16213e;
    }

    .logo { font-size: 1.5rem; font-weight: 700; color: #3b82f6; }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-name { font-weight: 600; color: #1a1a2e; }
    .dark-mode .user-name { color: #e4e4e7; }

    .btn-logout {
      padding: 0.5rem 1rem;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }

    /* Main Container */
    .main-container {
      display: flex;
      min-height: calc(100vh - 70px);
    }

    /* Sidebar */
    .sidebar {
      width: 250px;
      background: white;
      padding: 2rem 0;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
    }

    .dark-mode .sidebar {
      background: #16213e;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 1rem;
      color: #64748b;
      text-align: left;
      transition: all 0.3s ease;
    }

    .nav-item:hover {
      background: #f1f5f9;
      color: #3b82f6;
    }

    .nav-item.active {
      background: #eff6ff;
      color: #3b82f6;
      border-left: 4px solid #3b82f6;
    }

    .dark-mode .nav-item:hover {
      background: #1e293b;
      color: #60a5fa;
    }

    .dark-mode .nav-item.active {
      background: #1e3a8a;
      color: #60a5fa;
    }

    .nav-icon { font-size: 1.25rem; }

    .sidebar-footer {
      margin-top: auto;
      padding: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    .dark-mode .sidebar-footer { border-color: #2a2a4a; }

    /* Content Area */
    .content-area {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    .section h2 {
      margin: 0 0 1.5rem;
      color: #1e293b;
    }

    .dark-mode .section h2 { color: #e4e4e7; }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
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

    .stat-value {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #3b82f6;
    }

    .stat-label {
      color: #64748b;
      font-size: 0.9rem;
    }

    .dark-mode .stat-label { color: #94a3b8; }

    /* Table */
    .products-table {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    }

    .dark-mode .products-table { background: #16213e; }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: #f8fafc;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #334155;
    }

    .dark-mode th {
      background: #0f3460;
      color: #e4e4e7;
    }

    td {
      padding: 1rem;
      border-top: 1px solid #e2e8f0;
      color: #334155;
    }

    .dark-mode td {
      border-color: #2a2a4a;
      color: #e4e4e7;
    }

    .type-badge {
      background: #dbeafe;
      color: #1e40af;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .dark-mode .type-badge {
      background: #1e3a8a;
      color: #60a5fa;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #fee2e2;
      color: #dc2626;
    }

    .status-badge.active {
      background: #d1fae5;
      color: #059669;
    }

    .dark-mode .status-badge {
      background: #7f1d1d;
      color: #f87171;
    }

    .dark-mode .status-badge.active {
      background: #064e3b;
      color: #34d399;
    }

    .btn-action {
      padding: 0.4rem 0.8rem;
      margin-right: 0.5rem;
      background: #e2e8f0;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .btn-action:hover { background: #cbd5e1; }
    .btn-action.delete { background: #fee2e2; color: #dc2626; }
    .btn-action.delete:hover { background: #fecaca; }

    .dark-mode .btn-action { background: #374151; color: #e4e4e7; }
    .dark-mode .btn-action:hover { background: #4b5563; }
    .dark-mode .btn-action.delete { background: #7f1d1d; color: #f87171; }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .dark-mode .tabs { border-color: #2a2a4a; }

    .tab {
      padding: 1rem 1.5rem;
      background: none;
      border: none;
      font-size: 1rem;
      color: #64748b;
      cursor: pointer;
      border-bottom: 2px solid transparent;
    }

    .tab:hover { color: #3b82f6; }
    .tab.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
    }

    .dark-mode .tab { color: #94a3b8; }
    .dark-mode .tab:hover,
    .dark-mode .tab.active { color: #60a5fa; border-bottom-color: #60a5fa; }

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
    .app-email { font-size: 0.85rem; color: #64748b; }
    .app-number { font-family: monospace; color: #64748b; }

    .dark-mode .app-info h3 { color: #e4e4e7; }
    .dark-mode .app-email,
    .dark-mode .app-number { color: #94a3b8; }

    .app-details-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .detail-item .label {
      display: block;
      font-size: 0.8rem;
      color: #64748b;
    }

    .detail-item .value {
      font-weight: 600;
      color: #334155;
    }

    .dark-mode .detail-item .label { color: #94a3b8; }
    .dark-mode .detail-item .value { color: #e4e4e7; }

    .app-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-approve, .btn-reject {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-approve { background: #10b981; color: white; }
    .btn-approve:hover { background: #059669; }
    .btn-reject { background: #ef4444; color: white; }
    .btn-reject:hover { background: #dc2626; }

    .rejection-reason {
      margin-top: 1rem;
      padding: 1rem;
      background: #fef2f2;
      border-radius: 8px;
      color: #dc2626;
    }

    .dark-mode .rejection-reason { background: #7f1d1d; color: #f87171; }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 16px;
      color: #64748b;
    }

    .dark-mode .empty-state {
      background: #16213e;
      color: #94a3b8;
    }

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
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
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

    .modal-body { padding: 1.5rem; }

    .form-group { margin-bottom: 1rem; }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #334155;
    }

    .dark-mode .form-group label { color: #e4e4e7; }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 1rem;
      background: white;
    }

    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .dark-mode .form-input {
      background: #0f3460;
      border-color: #2a2a4a;
      color: #e4e4e7;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .error-message {
      color: #ef4444;
      padding: 0.75rem;
      background: #fef2f2;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .dark-mode .error-message { background: #7f1d1d; }

    .btn-primary, .btn-secondary {
      padding: 0.875rem 2rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }

    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; }

    .btn-secondary { background: #e2e8f0; color: #334155; }
    .btn-secondary:hover { background: #cbd5e1; }

    .dark-mode .btn-secondary { background: #374151; color: #e4e4e7; }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }

    .btn-primary.approve { background: #10b981; }
    .btn-primary.approve:hover { background: #059669; }
    .btn-primary.reject { background: #ef4444; }
    .btn-primary.reject:hover { background: #dc2626; }

    .application-summary {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .dark-mode .application-summary { background: #1e293b; }
    .application-summary p { margin: 0.25rem 0; }
    .dark-mode .application-summary p { color: #e4e4e7; }

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .app-details-grid { grid-template-columns: repeat(2, 1fr); }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminLoansComponent implements OnInit {
  isDarkMode = false;
  username = '';

  activeSection = 'products';
  appTab = 'pending';

  products: LoanProduct[] = [];
  allApplications: LoanApplication[] = [];
  pendingApplications: LoanApplication[] = [];
  approvedApplications: LoanApplication[] = [];
  rejectedApplications: LoanApplication[] = [];
  dashboard: LoanDashboard | null = null;

  showProductModal = false;
  editingProduct: LoanProduct | null = null;
  productForm: LoanProductRequest = this.getEmptyProductForm();

  showDecisionModal = false;
  selectedApplication: LoanApplication | null = null;
  decisionType: 'APPROVED' | 'REJECTED' = 'APPROVED';
  decisionRemarks = '';
  rejectionReason = '';
  decisionError = '';
  formError = '';

  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {
    this.isDarkMode = this.themeService.getCurrentTheme() === 'dark';
    const user = this.authService.getUser();
    this.username = user?.username || 'Admin';
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadApplications();
    this.loadDashboard();
  }

  loadProducts(): void {
    this.loanService.getAllProducts().subscribe({
      next: (data) => { this.products = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading products:', err)
    });
  }

  loadApplications(): void {
    this.loanService.getPendingApplications().subscribe({
      next: (data) => { this.pendingApplications = data; this.cdr.detectChanges(); }
    });
    this.loanService.getApprovedApplications().subscribe({
      next: (data) => { this.approvedApplications = data; this.cdr.detectChanges(); }
    });
    this.loanService.getRejectedApplications().subscribe({
      next: (data) => { this.rejectedApplications = data; this.cdr.detectChanges(); }
    });
  }

  loadDashboard(): void {
    this.loanService.getAdminDashboard().subscribe({
      next: (data) => { this.dashboard = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading dashboard:', err)
    });
  }

  getCurrentApplications(): LoanApplication[] {
    switch (this.appTab) {
      case 'pending': return this.pendingApplications;
      case 'approved': return this.approvedApplications;
      case 'rejected': return this.rejectedApplications;
      default: return [];
    }
  }

  getEmptyProductForm(): LoanProductRequest {
    return {
      productName: '',
      loanType: 'PERSONAL',
      description: '',
      minAmount: 0,
      maxAmount: 0,
      interestRate: 0,
      allowedTenures: '',
      minTenure: 0,
      maxTenure: 0,
      processingFee: 0
    };
  }

  openProductModal(): void {
    this.editingProduct = null;
    this.productForm = this.getEmptyProductForm();
    this.showProductModal = true;
    this.formError = '';
    this.cdr.detectChanges();
  }

  editProduct(product: LoanProduct): void {
    this.editingProduct = product;
    this.productForm = {
      productName: product.productName,
      loanType: product.loanType,
      description: product.description,
      minAmount: product.minAmount,
      maxAmount: product.maxAmount,
      interestRate: product.interestRate * 100,
      allowedTenures: product.allowedTenures,
      minTenure: product.minTenure,
      maxTenure: product.maxTenure,
      processingFee: product.processingFee * 100
    };
    this.showProductModal = true;
    this.formError = '';
    this.cdr.detectChanges();
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.editingProduct = null;
    this.cdr.detectChanges();
  }

  saveProduct(): void {
    if (!this.productForm.productName || !this.productForm.allowedTenures) {
      this.formError = 'Please fill all required fields';
      this.cdr.detectChanges();
      return;
    }

    if (this.productForm.minAmount <= 0 || this.productForm.maxAmount <= this.productForm.minAmount) {
      this.formError = 'Maximum amount must be greater than minimum amount';
      this.cdr.detectChanges();
      return;
    }

    if (this.productForm.minTenure <= 0 || this.productForm.maxTenure < this.productForm.minTenure) {
      this.formError = 'Maximum tenure must be greater than or equal to minimum tenure';
      this.cdr.detectChanges();
      return;
    }

    const allowedTenures = this.productForm.allowedTenures
      .split(',')
      .map((tenure) => Number(tenure.trim()))
      .filter((tenure) => Number.isFinite(tenure));

    if (
      allowedTenures.length === 0 ||
      allowedTenures.some(
        (tenure) => tenure < this.productForm.minTenure || tenure > this.productForm.maxTenure,
      )
    ) {
      this.formError = 'Allowed tenures must be comma-separated months inside the min/max tenure range';
      this.cdr.detectChanges();
      return;
    }

    const request = {
      ...this.productForm,
      interestRate: this.productForm.interestRate / 100,
      processingFee: (this.productForm.processingFee || 0) / 100,
      allowedTenures: allowedTenures.join(','),
    };

    if (this.editingProduct) {
      this.loanService.updateProduct(this.editingProduct.id, request).subscribe({
        next: () => {
          this.loadProducts();
          this.closeProductModal();
        },
        error: (err) => {
          this.formError = this.getErrorMessage(err, 'Failed to update product');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.loanService.createProduct(request).subscribe({
        next: () => {
          this.loadProducts();
          this.closeProductModal();
        },
        error: (err) => {
          this.formError = this.getErrorMessage(err, 'Failed to create product');
          this.cdr.detectChanges();
        }
      });
    }
  }

  getErrorMessage(error: any, fallback: string): string {
    if (typeof error?.error === 'string') {
      return error.error;
    }
    return error?.error?.message || error?.message || fallback;
  }

  deleteProduct(product: LoanProduct): void {
    if (confirm(`Delete ${product.productName}?`)) {
      this.loanService.deleteProduct(product.id).subscribe({
        next: () => this.loadProducts(),
        error: (err) => alert(err.error?.message || 'Failed to delete product')
      });
    }
  }

  openDecisionModal(app: LoanApplication, type: 'APPROVED' | 'REJECTED'): void {
    this.selectedApplication = app;
    this.decisionType = type;
    this.decisionRemarks = '';
    this.rejectionReason = '';
    this.decisionError = '';
    this.showDecisionModal = true;
    this.cdr.detectChanges();
  }

  closeDecisionModal(): void {
    this.showDecisionModal = false;
    this.selectedApplication = null;
    this.cdr.detectChanges();
  }

  submitDecision(): void {
    if (!this.selectedApplication) return;

    if (this.decisionType === 'REJECTED' && !this.rejectionReason) {
      this.decisionError = 'Rejection reason is required';
      this.cdr.detectChanges();
      return;
    }

    const decision: LoanDecisionRequest = {
      decision: this.decisionType,
      remarks: this.decisionRemarks,
      rejectionReason: this.rejectionReason
    };

    this.loanService.processApplication(this.selectedApplication.id, decision).subscribe({
      next: () => {
        this.loadApplications();
        this.loadDashboard();
        this.closeDecisionModal();
      },
      error: (err) => {
        this.decisionError = err.error?.message || 'Failed to process application';
        this.cdr.detectChanges();
      }
    });
  }

  formatLoanType(type: string): string {
    return type.charAt(0) + type.slice(1).toLowerCase();
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
