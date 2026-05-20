import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { ThemeToggleComponent } from '../../../components/theme-toggle/theme-toggle.component';
import { AuthService } from '../../../services/auth.service';
import {
  LoanService,
  LoanProduct,
  LoanApplication,
  LoanAccount,
  LoanRepayment,
  LoanDashboard,
} from '../../../services/loan.service';

interface LoanDecision {
  decision: 'APPROVED' | 'REJECTED';
  remarks: string;
  rejectionReason: string;
}

@Component({
  selector: 'app-loans-apply',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="loan-apply-container" [class.dark-mode]="isDarkMode">
      <div class="page-header">
        <h2>Apply for a Loan</h2>
        <p>Choose a loan product that fits your needs</p>
      </div>

      <!-- Step Indicator -->
      <div class="step-indicator">
        <div class="step" [class.active]="step >= 1" [class.completed]="step > 1">
          <span class="step-number">1</span>
          <span class="step-label">Select Product</span>
        </div>
        <div class="step-line"></div>
        <div class="step" [class.active]="step >= 2" [class.completed]="step > 2">
          <span class="step-number">2</span>
          <span class="step-label">Enter Details</span>
        </div>
        <div class="step-line"></div>
        <div class="step" [class.active]="step >= 3">
          <span class="step-number">3</span>
          <span class="step-label">Review & Submit</span>
        </div>
      </div>

      <!-- Step 1: Select Product -->
      <div *ngIf="step === 1" class="step-content">
        <div class="search-filter">
          <select
            [ngModel]="selectedProduct?.id || null"
            (ngModelChange)="selectProductById($event)"
            class="filter-select"
          >
            <option [ngValue]="null">Select Loan Product</option>
            <option *ngFor="let product of products" [ngValue]="product.id">
              {{ formatLoanType(product.loanType) }} - {{ product.productName }}
            </option>
          </select>
        </div>

        <div *ngIf="selectedProduct" class="selected-product-preview">
          <div>
            <span class="loan-type-badge">{{ formatLoanType(selectedProduct.loanType) }}</span>
            <h3>{{ selectedProduct.productName }}</h3>
            <p>{{ selectedProduct.description }}</p>
          </div>
          <div class="preview-metrics">
            <span>{{ selectedProduct.interestRate * 100 | number: '1.2-2' }}% p.a.</span>
            <span>Rs. {{ selectedProduct.minAmount | number }} - Rs. {{ selectedProduct.maxAmount | number }}</span>
            <span>{{ selectedProduct.allowedTenures }} months</span>
          </div>
        </div>

        <div *ngIf="filteredProducts.length > 0" class="products-grid">
          <div
            *ngFor="let product of filteredProducts"
            class="product-card"
            [class.selected]="selectedProduct?.id === product.id"
            (click)="selectProduct(product)"
          >
            <div class="product-header">
              <span class="loan-type-badge">{{ formatLoanType(product.loanType) }}</span>
              <span class="interest-rate"
                >{{ product.interestRate * 100 | number: '1.2-2' }}% p.a.</span
              >
            </div>
            <h3 class="product-name">{{ product.productName }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-details">
              <div class="detail-item">
                <span class="label">Min Amount</span>
                <span class="value">₹{{ product.minAmount | number }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Max Amount</span>
                <span class="value">₹{{ product.maxAmount | number }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Tenure</span>
                <span class="value">{{ product.minTenure }} - {{ product.maxTenure }} months</span>
              </div>
            </div>
            <button
              type="button"
              class="select-btn"
              [class.selected]="selectedProduct?.id === product.id"
              (click)="selectProduct(product); $event.stopPropagation()"
            >
              {{ selectedProduct?.id === product.id ? 'Selected' : 'Select' }}
            </button>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn-primary" [disabled]="!selectedProduct" (click)="nextStep()">
            Continue to Details
          </button>
        </div>
      </div>

      <!-- Step 2: Enter Details -->
      <div *ngIf="step === 2" class="step-content">
        <div class="selected-product-summary">
          <div class="summary-header">
            <h3>{{ selectedProduct?.productName }}</h3>
            <button class="btn-text" (click)="step = 1">Change</button>
          </div>
        </div>

        <div class="form-section">
          <h4>Loan Details</h4>
          <div class="form-row">
            <div class="form-group">
              <label>Loan Amount (₹)</label>
              <input
                type="number"
                [(ngModel)]="applicationAmount"
                (ngModelChange)="calculateEmi()"
                [min]="selectedProduct?.minAmount || 0"
                [max]="selectedProduct?.maxAmount || 0"
                placeholder="Enter loan amount"
                class="form-input"
              />
              <small class="hint"
                >Min: ₹{{ selectedProduct?.minAmount | number }} / Max: ₹{{
                  selectedProduct?.maxAmount | number
                }}</small
              >
            </div>
            <div class="form-group">
              <label>Tenure (months)</label>
              <select
                [(ngModel)]="applicationTenure"
                (ngModelChange)="calculateEmi()"
                class="form-select"
              >
                <option [ngValue]="null">Select tenure</option>
                <option *ngFor="let tenure of tenureOptions" [ngValue]="tenure">
                  {{ tenure }} months
                </option>
              </select>
            </div>
          </div>

          <div *ngIf="applicationAmount && applicationTenure" class="emi-preview">
            <h4>EMI Preview</h4>
            <div class="emi-details">
              <div class="emi-item">
                <span class="label">Monthly EMI</span>
                <span class="value emi-amount">₹{{ emiCalculation.emi | number }}</span>
              </div>
              <div class="emi-item">
                <span class="label">Total Interest</span>
                <span class="value">₹{{ emiCalculation.totalInterest | number }}</span>
              </div>
              <div class="emi-item">
                <span class="label">Total Amount</span>
                <span class="value">₹{{ emiCalculation.totalAmount | number }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4>Employment Details</h4>
          <div class="form-row">
            <div class="form-group">
              <label>Monthly Income (₹)</label>
              <input
                type="number"
                [(ngModel)]="monthlyIncome"
                placeholder="Enter monthly income"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Employer Name</label>
              <input
                type="text"
                [(ngModel)]="employerName"
                placeholder="Enter employer name"
                class="form-input"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Designation</label>
              <input
                type="text"
                [(ngModel)]="designation"
                placeholder="Enter designation"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Existing EMIs (₹)</label>
              <input type="number" [(ngModel)]="existingEmis" placeholder="0" class="form-input" />
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn-secondary" (click)="prevStep()">Back</button>
          <button class="btn-primary" [disabled]="!isStep2Valid()" (click)="nextStep()">
            Review Application
          </button>
        </div>
      </div>

      <!-- Step 3: Review & Submit -->
      <div *ngIf="step === 3" class="step-content">
        <div class="review-card">
          <h3>Review Your Loan Application</h3>

          <div class="review-section">
            <h4>Loan Details</h4>
            <div class="review-grid">
              <div class="review-item">
                <span class="label">Product</span>
                <span class="value">{{ selectedProduct?.productName }}</span>
              </div>
              <div class="review-item">
                <span class="label">Loan Type</span>
                <span class="value">{{ formatLoanType(selectedProduct?.loanType || '') }}</span>
              </div>
              <div class="review-item">
                <span class="label">Amount</span>
                <span class="value">₹{{ applicationAmount | number }}</span>
              </div>
              <div class="review-item">
                <span class="label">Tenure</span>
                <span class="value">{{ applicationTenure }} months</span>
              </div>
              <div class="review-item">
                <span class="label">Interest Rate</span>
                <span class="value"
                  >{{ (selectedProduct?.interestRate || 0) * 100 | number: '1.2-2' }}% p.a.</span
                >
              </div>
              <div class="review-item highlight">
                <span class="label">Monthly EMI</span>
                <span class="value">₹{{ emiCalculation.emi | number }}</span>
              </div>
            </div>
          </div>

          <div class="review-section">
            <h4>Employment Details</h4>
            <div class="review-grid">
              <div class="review-item">
                <span class="label">Monthly Income</span>
                <span class="value">₹{{ monthlyIncome || 0 | number }}</span>
              </div>
              <div class="review-item">
                <span class="label">Employer</span>
                <span class="value">{{ employerName || 'N/A' }}</span>
              </div>
              <div class="review-item">
                <span class="label">Designation</span>
                <span class="value">{{ designation || 'N/A' }}</span>
              </div>
              <div class="review-item">
                <span class="label">Existing EMIs</span>
                <span class="value">₹{{ existingEmis || 0 | number }}</span>
              </div>
            </div>
          </div>

          <div class="terms-acceptance">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="termsAccepted" />
              <span
                >I accept the terms and conditions and confirm that the information provided is
                accurate</span
              >
            </label>
          </div>

          <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
          <div *ngIf="successMessage" class="success-message">{{ successMessage }}</div>
        </div>

        <div class="step-actions">
          <button class="btn-secondary" (click)="prevStep()">Back</button>
          <button
            class="btn-primary"
            [disabled]="!termsAccepted || isSubmitting"
            (click)="submitApplication()"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit Application' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .loan-apply-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
        animation: fadeIn 0.3s ease;
      }

      .page-header {
        margin-bottom: 2rem;
      }

      .page-header h2 {
        margin: 0 0 0.5rem;
        color: #1e293b;
      }

      .page-header p {
        color: #64748b;
        margin: 0;
      }

      .dark-mode .page-header h2,
      .dark-mode .review-card h3,
      .dark-mode .review-section h4 {
        color: #e4e4e7;
      }

      .dark-mode .page-header p {
        color: #94a3b8;
      }

      /* Step Indicator */
      .step-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 3rem;
        padding: 1.5rem;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      }

      .dark-mode .step-indicator {
        background: #16213e;
      }

      .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .step-number {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #e2e8f0;
        color: #64748b;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      .step.active .step-number {
        background: #3b82f6;
        color: white;
      }

      .step.completed .step-number {
        background: #10b981;
        color: white;
      }

      .step-label {
        font-size: 0.85rem;
        color: #64748b;
        font-weight: 500;
      }

      .step.active .step-label,
      .step.completed .step-label {
        color: #3b82f6;
      }

      .dark-mode .step-number {
        background: #1e293b;
        color: #94a3b8;
      }

      .dark-mode .step-label {
        color: #94a3b8;
      }

      .step-line {
        width: 80px;
        height: 2px;
        background: #e2e8f0;
        margin: 0 1rem;
      }

      /* Products Grid */
      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .product-card {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      }

      .product-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }

      .product-card.selected {
        border-color: #3b82f6;
      }

      .dark-mode .product-card {
        background: #16213e;
      }

      .product-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .loan-type-badge {
        background: #dbeafe;
        color: #1e40af;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
      }

      .dark-mode .loan-type-badge {
        background: #1e3a8a;
        color: #60a5fa;
      }

      .interest-rate {
        font-size: 1.25rem;
        font-weight: 700;
        color: #10b981;
      }

      .product-name {
        margin: 0 0 0.5rem;
        color: #1e293b;
      }

      .dark-mode .product-name {
        color: #e4e4e7;
      }

      .product-description {
        color: #64748b;
        font-size: 0.9rem;
        margin: 0 0 1rem;
        line-height: 1.5;
      }

      .dark-mode .product-description {
        color: #94a3b8;
      }

      .product-details {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
        margin-bottom: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
      }

      .dark-mode .product-details {
        border-color: #2a2a4a;
      }

      .detail-item {
        text-align: center;
      }

      .detail-item .label {
        display: block;
        font-size: 0.75rem;
        color: #64748b;
        margin-bottom: 0.25rem;
      }

      .dark-mode .detail-item .label {
        color: #94a3b8;
      }

      .detail-item .value {
        font-weight: 600;
        color: #334155;
        font-size: 0.85rem;
      }

      .dark-mode .detail-item .value {
        color: #e4e4e7;
      }

      .select-btn {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #3b82f6;
        background: transparent;
        color: #3b82f6;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .select-btn:hover {
        background: #eff6ff;
      }

      .select-btn.selected {
        background: #3b82f6;
        color: white;
      }

      /* Form Styles */
      .selected-product-summary {
        background: #eff6ff;
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1.5rem;
      }

      .dark-mode .selected-product-summary {
        background: #1e3a8a;
      }

      .summary-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .summary-header h3 {
        margin: 0;
        color: #1e40af;
      }

      .dark-mode .summary-header h3 {
        color: #60a5fa;
      }

      .btn-text {
        background: none;
        border: none;
        color: #3b82f6;
        cursor: pointer;
        font-weight: 500;
      }

      .form-section {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      }

      .dark-mode .form-section {
        background: #16213e;
      }

      .form-section h4 {
        margin: 0 0 1.5rem;
        color: #1e293b;
      }

      .dark-mode .form-section h4 {
        color: #e4e4e7;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #334155;
      }

      .dark-mode .form-group label {
        color: #e4e4e7;
      }

      .form-input,
      .form-select {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        font-size: 1rem;
        background: white;
        transition: border-color 0.3s ease;
      }

      .form-input:focus,
      .form-select:focus {
        outline: none;
        border-color: #3b82f6;
      }

      .dark-mode .form-input,
      .dark-mode .form-select {
        background: #0f3460;
        border-color: #2a2a4a;
        color: #e4e4e7;
      }

      .hint {
        display: block;
        margin-top: 0.25rem;
        color: #64748b;
        font-size: 0.8rem;
      }

      .dark-mode .hint {
        color: #94a3b8;
      }

      /* EMI Preview */
      .emi-preview {
        background: linear-gradient(135deg, #10b981, #059669);
        border-radius: 12px;
        padding: 1.5rem;
        color: white;
        margin-top: 1.5rem;
      }

      .emi-preview h4 {
        margin: 0 0 1rem;
        color: white;
        font-size: 1rem;
      }

      .emi-details {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .emi-item .label {
        display: block;
        font-size: 0.85rem;
        opacity: 0.9;
        margin-bottom: 0.25rem;
      }

      .emi-item .value {
        font-size: 1.25rem;
        font-weight: 700;
      }

      .emi-amount {
        font-size: 1.5rem !important;
      }

      /* Review Card */
      .review-card {
        background: white;
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      }

      .dark-mode .review-card {
        background: #16213e;
      }

      .review-section {
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #e2e8f0;
      }

      .dark-mode .review-section {
        border-color: #2a2a4a;
      }

      .review-section:last-of-type {
        border-bottom: none;
      }

      .review-section h4 {
        margin: 0 0 1rem;
        color: #1e293b;
      }

      .review-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .review-item {
        background: #f8fafc;
        padding: 1rem;
        border-radius: 8px;
      }

      .review-item.highlight {
        background: #eff6ff;
        border: 2px solid #3b82f6;
      }

      .dark-mode .review-item {
        background: #1e293b;
      }

      .dark-mode .review-item.highlight {
        background: #1e3a8a;
      }

      .review-item .label {
        display: block;
        font-size: 0.8rem;
        color: #64748b;
        margin-bottom: 0.25rem;
      }

      .review-item .value {
        font-weight: 600;
        color: #334155;
      }

      .review-item.highlight .value {
        color: #3b82f6;
        font-size: 1.25rem;
      }

      .dark-mode .review-item .label {
        color: #94a3b8;
      }

      .dark-mode .review-item .value {
        color: #e4e4e7;
      }

      .terms-acceptance {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
      }

      .dark-mode .terms-acceptance {
        border-color: #2a2a4a;
      }

      .checkbox-label {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        cursor: pointer;
        color: #334155;
      }

      .dark-mode .checkbox-label {
        color: #e4e4e7;
      }

      .checkbox-label input {
        width: 20px;
        height: 20px;
        margin-top: 2px;
      }

      .error-message {
        color: #ef4444;
        margin-top: 1rem;
        padding: 0.75rem;
        background: #fef2f2;
        border-radius: 8px;
      }

      .success-message {
        color: #10b981;
        margin-top: 1rem;
        padding: 0.75rem;
        background: #f0fdf4;
        border-radius: 8px;
      }

      /* Buttons */
      .step-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
      }

      .btn-primary,
      .btn-secondary {
        padding: 0.875rem 2rem;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
      }

      .btn-primary {
        background: #3b82f6;
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background: #2563eb;
      }

      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-secondary {
        background: #e2e8f0;
        color: #334155;
      }

      .btn-secondary:hover {
        background: #cbd5e1;
      }

      .dark-mode .btn-secondary {
        background: #374151;
        color: #e4e4e7;
      }

      .dark-mode .btn-secondary:hover {
        background: #4b5563;
      }

      .search-filter {
        margin-bottom: 1.5rem;
      }

      .filter-select {
        padding: 0.75rem 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        font-size: 1rem;
        background: white;
      }

      .dark-mode .filter-select {
        background: #0f3460;
        border-color: #2a2a4a;
        color: #e4e4e7;
      }

      .selected-product-preview {
        display: flex;
        justify-content: space-between;
        gap: 1.5rem;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
        border-radius: 14px;
        background: rgba(59, 130, 246, 0.12);
        border: 1px solid rgba(96, 165, 250, 0.35);
      }

      .selected-product-preview h3 {
        margin: 0.75rem 0 0.35rem;
        color: #e4e4e7;
      }

      .selected-product-preview p {
        margin: 0;
        color: #94a3b8;
      }

      .preview-metrics {
        display: grid;
        min-width: 280px;
        gap: 0.5rem;
        color: #dbeafe;
        font-weight: 600;
      }

      @media (max-width: 768px) {
        .loan-apply-container {
          padding: 1rem;
        }

        .products-grid {
          grid-template-columns: 1fr;
        }

        .selected-product-preview {
          flex-direction: column;
        }

        .preview-metrics {
          min-width: 0;
        }

        .form-row {
          grid-template-columns: 1fr;
        }

        .emi-details {
          grid-template-columns: 1fr;
        }

        .review-grid {
          grid-template-columns: 1fr;
        }

        .step-indicator {
          padding: 1rem;
        }

        .step-line {
          width: 30px;
        }
      }
    `,
  ],
})
export class LoansApplyComponent implements OnInit {
  isDarkMode = false;

  // Step management
  step = 1;

  // Products
  products: LoanProduct[] = [];
  filteredProducts: LoanProduct[] = [];
  selectedProduct: LoanProduct | null = null;
  filterType = '';

  // Application
  applicationAmount: number | null = null;
  applicationTenure: number | null = null;
  monthlyIncome: number | null = null;
  employerName = '';
  designation = '';
  existingEmis: number | null = null;
  termsAccepted = false;

  // EMI Calculation
  emiCalculation = { emi: 0, totalInterest: 0, totalAmount: 0, monthlyRate: 0 };
  tenureOptions: number[] = [];

  // Status
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
  ) {
    this.isDarkMode = this.themeService.getCurrentTheme() === 'dark';
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loanService.getActiveProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading products:', err),
    });
  }

  filterProducts(): void {
    this.filteredProducts = this.filterType
      ? this.products.filter((p) => p.loanType === this.filterType)
      : this.products;
    this.cdr.detectChanges();
  }

  selectProductById(productId: number | null): void {
    const product = this.products.find((item) => item.id === Number(productId));
    if (product) {
      this.selectProduct(product);
      this.filterType = product.loanType;
      this.filteredProducts = this.products.filter((item) => item.loanType === product.loanType);
      return;
    }

    this.selectedProduct = null;
    this.tenureOptions = [];
    this.applicationTenure = null;
    this.applicationAmount = null;
    this.filteredProducts = this.products;
    this.cdr.detectChanges();
  }

  selectProduct(product: LoanProduct): void {
    this.selectedProduct = product;
    this.tenureOptions = this.loanService.getTenureOptions(product);
    this.applicationTenure = null;
    this.applicationAmount = null;
    this.calculateEmi();
    this.cdr.detectChanges();
  }

  calculateEmi(): void {
    if (this.selectedProduct && this.applicationAmount && this.applicationTenure) {
      const annualRate =
        this.selectedProduct.interestRate > 1
          ? this.selectedProduct.interestRate / 100
          : this.selectedProduct.interestRate;

      this.emiCalculation = this.loanService.calculateEmi(
        this.applicationAmount,
        annualRate,
        this.applicationTenure,
      );
      this.cdr.detectChanges();
      return;
    }

    this.emiCalculation = { emi: 0, totalInterest: 0, totalAmount: 0, monthlyRate: 0 };
  }

  isStep2Valid(): boolean {
    if (!this.selectedProduct || !this.applicationAmount || !this.applicationTenure) {
      return false;
    }
    if (
      this.applicationAmount < (this.selectedProduct.minAmount || 0) ||
      this.applicationAmount > (this.selectedProduct.maxAmount || Infinity)
    ) {
      return false;
    }
    return this.tenureOptions.includes(this.applicationTenure);
  }

  nextStep(): void {
    if (this.step === 1 && !this.selectedProduct) {
      return;
    }
    if (this.step === 2) {
      if (!this.isStep2Valid()) {
        return;
      }
      this.calculateEmi();
    }
    this.step++;
    this.cdr.detectChanges();
  }

  prevStep(): void {
    this.step--;
    this.cdr.detectChanges();
  }

  submitApplication(): void {
    if (!this.selectedProduct || !this.applicationAmount || !this.applicationTenure) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request = {
      loanProductId: this.selectedProduct.id,
      requestedAmount: this.applicationAmount,
      requestedTenure: this.applicationTenure,
      monthlyIncome: this.monthlyIncome || undefined,
      employerName: this.employerName || undefined,
      designation: this.designation || undefined,
      existingEmis: this.existingEmis || undefined,
    };

    this.loanService.applyForLoan(request).subscribe({
      next: (response) => {
        this.successMessage = `Application submitted successfully! Application Number: ${response.applicationNumber}`;
        this.isSubmitting = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/user'], { queryParams: { section: 'loans' } });
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to submit application';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  formatLoanType(type: string): string {
    return type.charAt(0) + type.slice(1).toLowerCase();
  }
}
